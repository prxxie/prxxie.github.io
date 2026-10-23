#!/usr/bin/env python3
"""Claude Code PostToolUse hook: after an edit under docs/, run `verify-docs.py --fix` (AGENTS.md hard rule 5).

Reads the hook event as JSON on stdin and acts only when `tool_input.file_path` is inside the project's docs/.
The generated index files are checked but never fixed: `--fix` rewrites them, so fixing *because* one of them was
edited would replace the file the agent just read ("File has been modified since read") and cost a re-read per turn.
Exit codes follow the Claude Code hook contract: 0 = nothing to report, 2 = verifier errors (stderr is shown to
Claude), 1 = the hook itself failed (shown to the user, non-blocking). Standard library only.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

VERIFIER = Path(".agents") / "scripts" / "verify-docs.py"
VERIFY_ERRORS = 1  # verify-docs.py: 1 = errors found, 2 = no docs directory
# Indexes that `--fix` regenerates. Checking them is useful; fixing them from their own edit is not.
GENERATED = (Path("docs") / "README.md", Path("docs") / "03-stories" / "README.md")


def edited_path(event: object) -> str:
    tool_input = event.get("tool_input") if isinstance(event, dict) else None
    if not isinstance(tool_input, dict):
        return ""
    path = tool_input.get("file_path")
    return path if isinstance(path, str) else ""


def main() -> int:
    try:
        event = json.load(sys.stdin)
    except json.JSONDecodeError as exc:
        print(f"adf-verify-docs: hook input is not JSON: {exc}", file=sys.stderr)
        return 1
    path = edited_path(event)
    if not path:
        return 0
    project = Path(os.environ.get("CLAUDE_PROJECT_DIR") or event.get("cwd") or os.getcwd()).resolve()
    edited = Path(project, path).resolve()
    if project / "docs" not in edited.parents:
        return 0
    if not (project / VERIFIER).is_file():
        return 0  # ADF was uninstalled or never installed here: nothing to verify against

    command = [sys.executable, str(VERIFIER)]
    if not any(edited == project / name for name in GENERATED):
        command.append("--fix")
    result = subprocess.run(
        command, cwd=project, capture_output=True, text=True, check=False,
    )
    if result.returncode == VERIFY_ERRORS:
        print("verify-docs.py found errors in docs/ — fix them before moving on:", file=sys.stderr)
        print(result.stdout + result.stderr, file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
