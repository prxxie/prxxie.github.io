#!/usr/bin/env python3
"""Verify the ADF doc set against the contracts in .agents/rules/02-docs-navigation.md.

Usage: python3 .agents/scripts/verify-docs.py [--docs DIR] [--strict] [--fix]

  --fix     regenerate every generated block (<!-- adf:<kind> --> … <!-- /adf:<kind> -->) before checking
  --strict  treat warnings as errors

Exit codes: 0 = no errors, 1 = errors found (or warnings with --strict), 2 = docs directory not found.
Standard library only.
"""

from __future__ import annotations

import argparse
import codecs
import datetime
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import unquote

STORY_STATUSES = ("done", "in-progress", "ready", "blocked", "draft", "closed")  # order used in stats
PRIORITIES = {"P0", "P1", "P2", "P3"}
SIZES = {"S", "M", "L"}
OQ_STATUSES = {"open", "answered", "withdrawn"}
OQ_REQUIRED_FIELDS = ("Status", "Raised", "Blocks", "Assumption", "Answer")
ADR_STATUSES = {"proposed", "accepted", "superseded", "deprecated"}
TIERS = {"lite", "standard", "full"}
PROJECT_TYPES = {
    "web-app", "api-service", "mobile-app", "cli-tool",
    "library", "data-ml", "integration", "desktop-app",
}
STORY_REQUIRED = ("id", "title", "epic", "status", "priority", "size", "depends_on", "open_questions")
STORY_LISTS = ("depends_on", "open_questions", "accepted_assumptions", "refs")
FINISHED = {"done", "closed"}

EPIC_DIR_RE = re.compile(r"^EPIC-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*$")
EPIC_CODE_RE = re.compile(r"^[A-Z]{2,6}$")
STORY_ID_RE = re.compile(r"^US-([A-Z]{2,6})-\d{3}$")
STORY_FILE_RE = re.compile(r"^(US-[A-Z]{2,6}-\d{3})(?:-[a-z0-9-]+)?\.md$")
ADR_FILE_RE = re.compile(r"^(ADR-\d{4})(?:-[a-z0-9-]+)?\.md$")
OQ_HEADING_RE = re.compile(r"^##\s+(OQ-\d{2,})\b\s*(?:[—–-]\s*)?(.*)$")
OQ_FIELD_RE = re.compile(r"^-\s+\*\*([A-Za-z][A-Za-z ]*)\*\*:\s*(.*)$")
LINK_RE = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
MENTION_RE = re.compile(r"\b(US-[A-Z]{2,6}-\d{3}|OQ-\d{2,}|ADR-\d{4})\b")
ASSUMPTION_TAG_RE = re.compile(r"\[assumption:\s*(OQ-\d{2,})\]")
NFR_RE = re.compile(r"\bNFR-\d{2,}\b")
# Template placeholders look like `<capability>` or `<What problem, for whom>`: '<' at a word boundary, a letter first,
# and no characters that occur in comparisons, generics after a word, e-mails, or URLs.
PLACEHOLDER_RE = re.compile(r"(?:^|(?<=[\s(|]))<([A-Za-z][^<>@=:/\n]*)>")
EMPTY_FIELD_RE = re.compile(r"^-\s+\*\*[^*]+\*\*:\s*$")
BLOCK_RE = re.compile(r"(<!-- adf:([a-z-]+) -->\r?\n)(.*?)(<!-- /adf:\2 -->)", re.DOTALL)
BLOCK_MARKER_RE = re.compile(r"<!-- (/?)adf:([a-z-]+) -->")
FENCE_RE = re.compile(r"^\s*(```|~~~)")
INLINE_CODE_RE = re.compile(r"`[^`]*`")
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
NO_ANSWER = {"", "—", "-", "none"}


@dataclass(frozen=True)
class Finding:
    level: str  # "error" | "warning"
    path: str
    message: str

    def render(self) -> str:
        return f"{self.level.upper():7} {self.path}: {self.message}"


@dataclass(frozen=True)
class Story:
    id: str
    path: Path
    meta: dict

    @property
    def status(self) -> str:
        value = self.meta.get("status")
        return value if isinstance(value, str) else ""


@dataclass(frozen=True)
class Question:
    id: str
    title: str
    heading: str  # raw heading text, for the GitHub anchor
    line: int
    fields: dict = field(default_factory=dict)

    @property
    def status(self) -> str:
        return self.fields.get("Status", "")

    @property
    def is_open(self) -> bool:
        return self.status == "open"


@dataclass(frozen=True)
class Epic:
    name: str
    code: str
    title: str
    path: Path


# --------------------------------------------------------------------------- parsing


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig", errors="replace")


def _scalar(raw: str) -> str:
    value = raw.strip()
    quoted = re.match(r"""^(["'])(.*?)\1\s*(?:#.*)?$""", value)
    if quoted:
        return quoted.group(2)
    return re.sub(r"\s+#.*$", "", value).strip()


def _is_one_of(value: object, allowed: set[str] | tuple[str, ...]) -> bool:
    return isinstance(value, str) and value in allowed


def _inline_list(raw: str) -> list[str]:
    inner = re.sub(r"\s+#.*$", "", raw.strip())[1:-1]
    return [_scalar(item) for item in inner.split(",") if item.strip()]


def parse_frontmatter(text: str) -> dict | None:
    """Parse a minimal YAML subset: `key: value`, `key: [a, b]`, and `key:` followed by `- item` lines."""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    try:
        end = next(i for i, line in enumerate(lines[1:], start=1) if line.strip() == "---")
    except StopIteration:
        return None

    meta: dict = {}
    current_list_key: str | None = None
    for line in lines[1:end]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        item = re.match(r"^\s*-\s+(.*)$", line)
        if item and current_list_key:
            meta[current_list_key] = [*meta[current_list_key], _scalar(item.group(1))]
            continue
        pair = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if not pair:
            continue
        key, raw = pair.group(1), pair.group(2)
        stripped = re.sub(r"\s+#.*$", "", raw).strip()
        if stripped == "":
            meta[key] = []
            current_list_key = key
        elif stripped.startswith("[") and stripped.endswith("]"):
            meta[key] = _inline_list(stripped)
            current_list_key = None
        else:
            meta[key] = _scalar(raw)
            current_list_key = None
    return meta


def _as_list(value: object) -> list[str]:
    """A frontmatter value as a list: lists as-is, a non-empty scalar as one item, anything else empty."""
    if isinstance(value, list):
        return value
    return [value] if isinstance(value, str) and value else []


def _list(meta: dict, key: str) -> list[str]:
    value = meta.get(key)
    return value if isinstance(value, list) else []


def prose_lines(text: str):
    """Yield (line_number, line) outside fenced code blocks, with inline code and HTML comments removed."""
    cleaned = HTML_COMMENT_RE.sub(lambda m: "\n" * m.group(0).count("\n"), text)
    in_fence = False
    for number, line in enumerate(cleaned.splitlines(), start=1):
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        if not in_fence:
            yield number, INLINE_CODE_RE.sub("", line)


def github_slug(heading: str) -> str:
    text = re.sub(r"<[^>]+>", "", heading.strip().lower())
    text = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[^\w\- ]", "", text)  # keeps letters, digits, '_', '-', spaces — as GitHub does
    return text.replace(" ", "-")


def heading_anchors(path: Path) -> set[str]:
    anchors: set[str] = set()
    counts: dict[str, int] = {}
    in_fence = False
    for line in _read(path).splitlines():
        if FENCE_RE.match(line):
            in_fence = not in_fence
            continue
        match = None if in_fence else re.match(r"^#{1,6}\s+(.*?)\s*#*\s*$", line)
        if not match:
            continue
        slug = github_slug(match.group(1))
        seen = counts.get(slug, 0)
        anchors.add(slug if seen == 0 else f"{slug}-{seen}")
        counts[slug] = seen + 1
    return anchors


TABLE_SEPARATOR_RE = re.compile(r"^\|?[\s:|-]+\|?$")


def _is_brief_content(line: str, next_line: str) -> bool:
    """True when a brief line carries an answer: not blank, a heading, a label, a table header, or an empty row."""
    stripped = line.strip()
    if not stripped or stripped.startswith(("#", ">")) or re.fullmatch(r"\*\*[^*]+\*\*", stripped):
        return False
    if stripped.startswith("|"):
        if TABLE_SEPARATOR_RE.match(stripped) or TABLE_SEPARATOR_RE.match(next_line.strip() or "x"):
            return False  # separator row, or header row (followed by a separator)
        return bool(re.sub(r"[|\s]", "", stripped))
    return not EMPTY_FIELD_RE.match(stripped)


def _valid_date(value: object) -> bool:
    if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
        return False
    try:
        datetime.date.fromisoformat(value)
    except ValueError:
        return False
    return True


# --------------------------------------------------------------------------- generated blocks


def _link(from_file: Path, to_file: Path, anchor: str = "") -> str:
    rel = os.path.relpath(to_file, from_file.parent).replace(os.sep, "/")
    return f"{rel}#{anchor}" if anchor else rel


def _table(header: list[str], rows: list[list[str]]) -> str:
    lines = ["| " + " | ".join(header) + " |", "|" + "|".join("---" for _ in header) + "|"]
    lines += ["| " + " | ".join(cell.replace("|", "\\|") for cell in row) + " |" for row in rows]
    return "\n".join(lines) + "\n"


def _fence_spans(text: str) -> list[tuple[int, int]]:
    """Character ranges covered by fenced code blocks (generated blocks inside them are examples, not targets)."""
    spans: list[tuple[int, int]] = []
    offset, start = 0, None
    for line in text.splitlines(keepends=True):
        if FENCE_RE.match(line):
            if start is None:
                start = offset
            else:
                spans.append((start, offset + len(line)))
                start = None
        offset += len(line)
    if start is not None:
        spans.append((start, offset))
    return spans


def _in_spans(position: int, spans: list[tuple[int, int]]) -> bool:
    return any(start <= position < end for start, end in spans)


class Generator:
    """Renders the content of generated blocks from the parsed doc set."""

    def __init__(self, stories: dict[str, Story], questions: dict[str, Question], epics: list[Epic],
                 oq_file: Path):
        self.stories = stories
        self.questions = questions
        self.epics = epics
        self.oq_file = oq_file

    def _blocking(self) -> dict[str, list[str]]:
        """Open question id → ids of blocked stories that list it."""
        result: dict[str, list[str]] = {}
        for story in sorted(self.stories.values(), key=lambda s: s.id):
            if story.status != "blocked":
                continue
            for oq in _list(story.meta, "open_questions"):
                if oq in self.questions and self.questions[oq].is_open:
                    result.setdefault(oq, []).append(story.id)
        return result

    def _oq_counts(self) -> str:
        statuses = [q.status for q in self.questions.values()]
        return (f"**Open: {statuses.count('open')} · Blocking: {len(self._blocking())} · "
                f"Answered: {statuses.count('answered')} · Withdrawn: {statuses.count('withdrawn')}**")

    def stats(self, _target: Path) -> str:
        counts = [str(sum(1 for s in self.stories.values() if s.status == st)) for st in STORY_STATUSES]
        header = ["Stories", *(st.replace("-", " ").capitalize() for st in STORY_STATUSES)]
        return _table(header, [[str(len(self.stories)), *counts]]) + "\nOpen questions: " + self._oq_counts() + "\n"

    def epics_table(self, target: Path) -> str:
        rows = []
        for epic in self.epics:
            own = [s for s in self.stories.values() if s.meta.get("epic") == epic.name]
            done = sum(1 for s in own if s.status == "done")
            blocked = sum(1 for s in own if s.status == "blocked")
            rows.append([f"[{epic.name}]({_link(target, epic.path)})", epic.code, epic.title,
                         str(len(own)), str(done), str(blocked)])
        return _table(["Epic", "Code", "Title", "Stories", "Done", "Blocked"], rows)

    def epic_stories(self, target: Path) -> str:
        epic_name = target.parent.name
        rows = []
        for story in sorted(self.stories.values(), key=lambda s: s.id):
            if story.meta.get("epic") != epic_name:
                continue
            deps = ", ".join(_list(story.meta, "depends_on")) or "—"
            rows.append([f"[{story.id}]({_link(target, story.path)})", str(story.meta.get("title", "")),
                         str(story.meta.get("priority", "")), str(story.meta.get("size", "")), story.status, deps])
        return _table(["Id", "Title", "Priority", "Size", "Status", "Depends on"], rows)

    def oq_summary(self, target: Path) -> str:
        blocking = self._blocking()
        rows = []
        for question in sorted(self.questions.values(), key=lambda q: int(q.id[3:])):
            anchor = github_slug(question.heading)
            rows.append([f"[{question.id}]({_link(target, self.oq_file, anchor)})", question.title,
                         question.status, ", ".join(blocking.get(question.id, [])) or "—"])
        return self._oq_counts() + "\n\n" + _table(["Id", "Question", "Status", "Blocking"], rows)

    def render(self, kind: str, target: Path) -> str | None:
        renderers = {"stats": self.stats, "epics": self.epics_table,
                     "epic-stories": self.epic_stories, "oq-summary": self.oq_summary}
        renderer = renderers.get(kind)
        return renderer(target) if renderer else None


# --------------------------------------------------------------------------- checks


class Verifier:
    def __init__(self, docs: Path):
        self.docs = docs
        self.root = docs.parent
        self.findings: list[Finding] = []
        self.epics: list[Epic] = []

    def _rel(self, path: Path) -> str:
        try:
            return str(path.relative_to(self.root))
        except ValueError:
            return str(path)

    def error(self, path: Path, message: str) -> None:
        self.findings.append(Finding("error", self._rel(path), message))

    def warn(self, path: Path, message: str) -> None:
        self.findings.append(Finding("warning", self._rel(path), message))

    @property
    def oq_file(self) -> Path:
        return self.docs / "04-decisions" / "open-questions.md"

    # -- open questions ----------------------------------------------------

    def parse_questions(self) -> dict[str, Question]:
        path = self.oq_file
        if not path.exists():
            return {}
        questions: dict[str, Question] = {}
        current: Question | None = None
        text = _read(path)
        raw_lines = text.splitlines()
        for number, line in prose_lines(text):
            heading = OQ_HEADING_RE.match(line)
            if heading:
                oq_id = heading.group(1)
                if oq_id in questions:
                    self.error(path, f"line {number}: duplicate question id {oq_id}")
                raw_heading = re.sub(r"^#+\s+", "", raw_lines[number - 1]).strip()
                raw_title = re.sub(r"^OQ-\d+\s*(?:[—–-]\s*)?", "", raw_heading)
                current = Question(oq_id, raw_title, raw_heading, number)
                questions[oq_id] = current
                continue
            if line.startswith("#"):
                current = None
                continue
            field_match = OQ_FIELD_RE.match(line)
            if field_match and current:
                current.fields[field_match.group(1).strip()] = field_match.group(2).strip()
        return questions

    def check_questions(self, questions: dict[str, Question]) -> None:
        path = self.oq_file
        for question in questions.values():
            where = f"line {question.line}: {question.id}"
            for name in OQ_REQUIRED_FIELDS:
                if name not in question.fields:
                    self.error(path, f"{where} is missing the **{name}** field")
            if "Status" in question.fields and question.status not in OQ_STATUSES:
                self.error(path, f"{where} has invalid status '{question.status}'")
            if question.status == "answered" and question.fields.get("Answer", "").lower() in NO_ANSWER:
                self.error(path, f"{where} is answered but **Answer** is empty")

    # -- ADRs --------------------------------------------------------------

    def check_adrs(self) -> set[str]:
        adr_dir = self.docs / "04-decisions" / "adr"
        ids: set[str] = set()
        if not adr_dir.is_dir():
            return ids
        for path in sorted(adr_dir.glob("*.md")):
            if path.name.lower() == "readme.md":
                continue
            match = ADR_FILE_RE.match(path.name)
            if not match:
                self.error(path, "ADR filename must be ADR-<nnnn>-<slug>.md")
                continue
            adr_id = match.group(1)
            if adr_id in ids:
                self.error(path, f"duplicate ADR id {adr_id}")
            ids.add(adr_id)
            meta = parse_frontmatter(_read(path))
            if meta is None:
                self.error(path, "missing frontmatter")
                continue
            if meta.get("id") != adr_id:
                self.error(path, f"frontmatter id '{meta.get('id')}' does not match filename ({adr_id})")
            if not _is_one_of(meta.get("status"), ADR_STATUSES):
                self.error(path, f"invalid status '{meta.get('status')}'")
            if not isinstance(meta.get("title"), str) or not meta["title"]:
                self.error(path, "frontmatter 'title' is missing or empty")
            if not _valid_date(meta.get("date")):
                self.error(path, f"date '{meta.get('date')}' is not a valid YYYY-MM-DD date")
            for old in _as_list(meta.get("supersedes")):
                if not re.fullmatch(r"ADR-\d{4}", old):
                    self.error(path, f"supersedes entry '{old}' is not an ADR id")
        return ids

    # -- epics and stories -------------------------------------------------

    def _parse_epic(self, epic_dir: Path, codes: dict[str, Path]) -> str | None:
        readme = epic_dir / "README.md"
        if not readme.exists():
            self.error(epic_dir, "epic directory has no README.md")
            return None
        meta = parse_frontmatter(_read(readme)) or {}
        code = meta.get("code")
        if not isinstance(code, str) or not EPIC_CODE_RE.match(code):
            self.error(readme, f"frontmatter 'code' must be 2-6 uppercase letters, got '{code}'")
            return None
        if code in codes:
            self.error(readme, f"epic code {code} already used by {self._rel(codes[code])}")
        codes[code] = epic_dir
        title = meta.get("title")
        self.epics.append(Epic(epic_dir.name, code, title if isinstance(title, str) else "", readme))
        return code

    def collect_stories(self) -> dict[str, Story]:
        stories_dir = self.docs / "03-stories"
        stories: dict[str, Story] = {}
        if not stories_dir.is_dir():
            return stories
        for stray in sorted(stories_dir.glob("US-*.md")):
            self.error(stray, "story must live inside an EPIC-<nn>-<slug> directory")

        codes: dict[str, Path] = {}
        for epic_dir in sorted(p for p in stories_dir.iterdir() if p.is_dir()):
            if not EPIC_DIR_RE.match(epic_dir.name):
                self.error(epic_dir, "epic directory must be named EPIC-<nn>-<slug>")
                continue
            code = self._parse_epic(epic_dir, codes)
            for path in sorted(epic_dir.glob("US-*.md")):
                story = self._parse_story(path, epic_dir.name, code)
                if story is None:
                    continue
                if story.id in stories:
                    self.error(path, f"duplicate story id {story.id} (also {self._rel(stories[story.id].path)})")
                    continue
                stories[story.id] = story
        return stories

    def _parse_story(self, path: Path, epic_name: str, code: str | None) -> Story | None:
        file_match = STORY_FILE_RE.match(path.name)
        if not file_match:
            self.error(path, "story filename must be US-<CODE>-<nnn>-<slug>.md")
            return None
        meta = parse_frontmatter(_read(path))
        if meta is None:
            self.error(path, "missing frontmatter")
            return None

        for key in STORY_REQUIRED:
            if key not in meta:
                self.error(path, f"frontmatter missing '{key}'")
        story_id = meta.get("id", "")
        if story_id != file_match.group(1):
            self.error(path, f"id '{story_id}' does not match filename ({file_match.group(1)})")
        id_match = STORY_ID_RE.match(story_id if isinstance(story_id, str) else "")
        if code and id_match and id_match.group(1) != code:
            self.error(path, f"id code {id_match.group(1)} does not match epic code {code}")
        if meta.get("epic") != epic_name:
            self.error(path, f"epic '{meta.get('epic')}' does not match directory {epic_name}")
        self._check_enum(path, meta, "status", STORY_STATUSES)
        self._check_enum(path, meta, "priority", PRIORITIES)
        self._check_enum(path, meta, "size", SIZES)
        title = meta.get("title", "")
        if isinstance(title, str) and title.endswith("."):
            self.warn(path, "title should not end with a period")
        for key in STORY_LISTS:
            if key in meta and not isinstance(meta[key], list):
                self.error(path, f"'{key}' must be a list")
        return Story(file_match.group(1), path, meta)

    def _check_enum(self, path: Path, meta: dict, key: str, allowed: set[str] | tuple[str, ...]) -> None:
        if key in meta and not _is_one_of(meta[key], allowed):
            self.error(path, f"{key} '{meta[key]}' is not one of {sorted(allowed)}")

    def check_story_relations(self, stories: dict[str, Story], questions: dict[str, Question]) -> None:
        for story in stories.values():
            self._check_dependencies(story, stories)
            self._check_story_questions(story, questions)
            for ref in _list(story.meta, "refs"):
                if not (self.docs / ref.split("#", 1)[0]).exists():
                    self.error(story.path, f"ref '{ref}' does not exist under docs/")
        self._check_cycles(stories)

    def _check_dependencies(self, story: Story, stories: dict[str, Story]) -> None:
        for dep in _list(story.meta, "depends_on"):
            if dep == story.id:
                self.error(story.path, "story depends on itself")
            elif dep not in stories:
                self.error(story.path, f"depends_on {dep} does not exist")
            elif story.status in {"in-progress", "done"} and stories[dep].status not in FINISHED:
                self.error(story.path, f"is {story.status} but dependency {dep} is '{stories[dep].status}'")

    def _check_story_questions(self, story: Story, questions: dict[str, Question]) -> None:
        listed = _list(story.meta, "open_questions")
        accepted = _list(story.meta, "accepted_assumptions")
        for oq in [*listed, *accepted]:
            if oq not in questions:
                self.error(story.path, f"{oq} not found in 04-decisions/open-questions.md")
        known = [oq for oq in listed if oq in questions]
        if story.status == "blocked":
            if not listed:
                self.error(story.path, "blocked story must list at least one open question")
            elif known and not any(questions[oq].is_open for oq in known):
                self.error(story.path, "is blocked but none of its open_questions is still open")
        elif story.status in {"ready", "in-progress", "done"}:
            for oq in known:
                if questions[oq].is_open:
                    self.error(story.path, f"is {story.status} but lists open question {oq} — answer it, mark the "
                                           "story blocked, or move it to accepted_assumptions")
                else:
                    self.warn(story.path, f"{oq} is {questions[oq].status}; remove it from open_questions")
        for oq in accepted:
            if oq in questions and questions[oq].fields.get("Assumption", "").lower() in NO_ANSWER:
                self.error(story.path, f"accepted assumption {oq} has no **Assumption** recorded")

    def _check_cycles(self, stories: dict[str, Story]) -> None:
        state: dict[str, int] = {}  # 1 = visiting, 2 = done

        def visit(node: str, trail: tuple[str, ...]) -> None:
            if state.get(node) == 2 or node not in stories:
                return
            if state.get(node) == 1:
                cycle = " -> ".join((*trail[trail.index(node):], node))
                self.error(stories[node].path, f"dependency cycle: {cycle}")
                return
            state[node] = 1
            for dep in _list(stories[node].meta, "depends_on"):
                visit(dep, (*trail, node))
            state[node] = 2

        for story_id in sorted(stories):
            visit(story_id, ())

    # -- brief and AGENTS.md -------------------------------------------------

    def check_brief(self) -> bool:
        """Check the brief; return True when it is confirmed."""
        path = self.docs / "00-source" / "brief.md"
        if not path.exists():
            return False
        text = _read(path)
        meta = parse_frontmatter(text)
        if meta is None:
            self.error(path, "missing frontmatter")
            return False
        if not _is_one_of(meta.get("tier"), TIERS):
            self.error(path, f"tier '{meta.get('tier')}' is not one of {sorted(TIERS)}")
        types = meta.get("project_types")
        if not isinstance(types, list):
            self.error(path, "project_types must be a list")
        else:
            for unknown in sorted(set(types) - PROJECT_TYPES):
                self.error(path, f"unknown project type '{unknown}'")
        if not _is_one_of(meta.get("status"), {"draft", "confirmed"}):
            self.error(path, f"status '{meta.get('status')}' must be draft or confirmed")
        confirmed = meta.get("status") == "confirmed"
        if confirmed:
            if not _valid_date(meta.get("updated")):
                self.error(path, f"updated '{meta.get('updated')}' is not a valid YYYY-MM-DD date")
            self._check_brief_complete(path, text)
        return confirmed

    def _check_brief_complete(self, path: Path, text: str) -> None:
        lines = list(prose_lines(text))
        section: str | None = None
        has_content = False
        for index, (number, line) in enumerate(lines):
            if line.startswith("## "):
                self._report_empty_section(path, section, has_content)
                section, has_content = line[3:].strip(), False
                continue
            if PLACEHOLDER_RE.search(line):
                self.error(path, f"line {number}: confirmed brief still has a template placeholder")
            if EMPTY_FIELD_RE.match(line):
                self.error(path, f"line {number}: confirmed brief has an empty field")
            next_line = lines[index + 1][1] if index + 1 < len(lines) else ""
            if section and _is_brief_content(line, next_line):
                has_content = True
        self._report_empty_section(path, section, has_content)

    def _report_empty_section(self, path: Path, section: str | None, has_content: bool) -> None:
        if section and not has_content:
            self.error(path, f"confirmed brief has an empty section '{section}' (write _not applicable_ and why)")

    def check_agents_md(self, confirmed: bool) -> None:
        path = self.root / "AGENTS.md"
        if not confirmed or not path.exists() or not (self.docs / "01-overview").is_dir():
            return
        for number, line in prose_lines(_read(path)):
            if "_not set_" in line:
                self.error(path, f"line {number}: PROJECT field not set although docs exist ({line.strip()})")

    # -- NFR traceability ----------------------------------------------------

    def check_nfr_coverage(self, stories: dict[str, Story]) -> None:
        path = self.docs / "01-overview" / "nonfunctional-requirements.md"
        if not path.exists() or not stories:
            return
        defined: dict[str, str] = {}
        for _, line in prose_lines(_read(path)):
            for nfr in NFR_RE.findall(line):
                defined.setdefault(nfr, line)
        covered = {nfr for story in stories.values() for nfr in NFR_RE.findall(_read(story.path))}
        for nfr, line in sorted(defined.items()):
            if nfr not in covered and "operational" not in line.lower():
                self.warn(path, f"{nfr} is not referenced by any story and not marked operational")

    # -- links, mentions, assumption tags ------------------------------------

    def _checked_files(self) -> list[Path]:
        source = self.docs / "00-source"
        keep = {source / "brief.md", source / "ingest-report.md"}
        files = [
            path for path in sorted(self.docs.rglob("*.md"))
            if not path.is_relative_to(source) or path in keep or path.is_relative_to(source / "change-requests")
        ]
        agents = self.root / "AGENTS.md"
        return [agents, *files] if agents.exists() else files

    def check_links_and_mentions(self, known_ids: set[str], questions: dict[str, Question]) -> None:
        anchor_cache: dict[Path, set[str]] = {}
        for path in self._checked_files():
            for number, line in prose_lines(_read(path)):
                for target in LINK_RE.findall(line):
                    self._check_link(path, number, target, anchor_cache)
                for mention in sorted(set(MENTION_RE.findall(line)) - known_ids):
                    self.warn(path, f"line {number}: mentions unknown id {mention}")
                for oq in ASSUMPTION_TAG_RE.findall(line):
                    if oq in questions and not questions[oq].is_open:
                        self.warn(path, f"line {number}: stale [assumption: {oq}] — {oq} is "
                                        f"{questions[oq].status}; replace with the decided fact")
                if "⚠️ Assumption" in line and not ASSUMPTION_TAG_RE.search(line):
                    self.warn(path, f"line {number}: assumption without an [assumption: OQ-nn] tag")

    def _check_link(self, path: Path, number: int, target: str, cache: dict[Path, set[str]]) -> None:
        if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.IGNORECASE):
            return  # external URL, mailto:, etc.
        file_part, _, anchor = target.partition("#")
        file_part = unquote(file_part)
        if not file_part:
            resolved = path
        elif file_part.startswith("/"):  # root-relative: resolved from the repository root
            resolved = (self.root / file_part.lstrip("/")).resolve()
        else:
            resolved = (path.parent / file_part).resolve()
        if not resolved.exists():
            self.error(path, f"line {number}: broken link '{target}'")
            return
        if anchor and resolved.suffix == ".md":
            if resolved not in cache:
                cache[resolved] = heading_anchors(resolved)
            if anchor.lower() not in cache[resolved]:
                self.warn(path, f"line {number}: anchor '#{anchor}' not found in {resolved.name}")

    # -- generated blocks ----------------------------------------------------

    def sync_blocks(self, generator: Generator, fix: bool) -> list[str]:
        """Compare (or with fix=True rewrite) every generated block; return paths that were rewritten."""
        fixed: list[str] = []
        for path in self._checked_files():
            raw = path.read_bytes()
            try:
                text = raw.decode("utf-8-sig")
            except UnicodeDecodeError:
                self.error(path, "not valid UTF-8; generated blocks were not checked")
                continue
            fences = _fence_spans(text)
            if not self._markers_balanced(path, text, fences):
                continue
            newline = "\r\n" if "\r\n" in text else "\n"
            stale: list[str] = []

            def replace(match: re.Match[str]) -> str:
                if _in_spans(match.start(), fences):
                    return match.group(0)  # an example inside a code fence
                kind = match.group(2)
                expected = generator.render(kind, path)
                if expected is None:
                    self.error(path, f"unknown generated block 'adf:{kind}'")
                    return match.group(0)
                expected = expected.replace("\n", newline)
                if match.group(3) != expected:
                    stale.append(kind)
                return match.group(1) + expected + match.group(4)

            updated = BLOCK_RE.sub(replace, text)
            if not stale:
                continue
            if fix:
                bom = codecs.BOM_UTF8 if raw.startswith(codecs.BOM_UTF8) else b""
                path.write_bytes(bom + updated.encode("utf-8"))  # keeps BOM and line endings as they were
                fixed.append(self._rel(path))
            else:
                for kind in stale:
                    self.error(path, f"generated block 'adf:{kind}' is out of date — run verify-docs.py --fix")
        return fixed

    def _markers_balanced(self, path: Path, text: str, fences: list[tuple[int, int]]) -> bool:
        open_kinds: list[str] = []
        for marker in BLOCK_MARKER_RE.finditer(text):
            if _in_spans(marker.start(), fences):
                continue
            closing, kind = marker.group(1) == "/", marker.group(2)
            if not closing and not open_kinds:
                open_kinds.append(kind)
            elif closing and open_kinds and open_kinds[-1] == kind:
                open_kinds.pop()
            else:
                self.error(path, f"unbalanced generated block markers near 'adf:{kind}' — fix them by hand")
                return False
        if open_kinds:
            self.error(path, f"unbalanced generated block markers: 'adf:{open_kinds[-1]}' is never closed")
            return False
        return True

    # -- run -----------------------------------------------------------------

    def run(self, fix: bool = False) -> tuple[list[Finding], list[str]]:
        confirmed = self.check_brief()
        self.check_agents_md(confirmed)
        questions = self.parse_questions()
        self.check_questions(questions)
        adr_ids = self.check_adrs()
        stories = self.collect_stories()
        self.check_story_relations(stories, questions)
        self.check_nfr_coverage(stories)
        fixed = self.sync_blocks(Generator(stories, questions, self.epics, self.oq_file), fix)
        self.check_links_and_mentions(set(questions) | adr_ids | set(stories), questions)
        return self.findings, fixed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify the ADF doc set.")
    parser.add_argument("--docs", default="docs", help="docs directory (default: ./docs)")
    parser.add_argument("--strict", action="store_true", help="treat warnings as errors")
    parser.add_argument("--fix", action="store_true", help="regenerate generated blocks before checking")
    args = parser.parse_args(argv)

    docs = Path(args.docs).resolve()
    if not docs.is_dir():
        print(f"verify-docs: docs directory not found: {docs}", file=sys.stderr)
        return 2

    findings, fixed = Verifier(docs).run(fix=args.fix)
    for path in fixed:
        print(f"FIXED   {path}: regenerated generated blocks")
    for finding in findings:
        print(finding.render())
    errors = sum(1 for f in findings if f.level == "error")
    warnings = len(findings) - errors
    print(f"verify-docs: {errors} error(s), {warnings} warning(s)")
    return 1 if errors or (args.strict and warnings) else 0


if __name__ == "__main__":
    sys.exit(main())
