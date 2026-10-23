export interface Post {
  slug: string;
  title: string;
  /** ISO `YYYY-MM-DD`, the only date format a post may carry. */
  date: string;
  summary: string;
  teaserGame?: string;
  teaserLevel?: string;
  /** Markdown body with the frontmatter block removed. */
  body: string;
}

const REQUIRED_FIELDS = ["title", "date", "summary"] as const;
const OPTIONAL_FIELDS = ["teaserGame", "teaserLevel"] as const;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isKnownField(key: string): boolean {
  return (
    (REQUIRED_FIELDS as readonly string[]).includes(key) ||
    (OPTIONAL_FIELDS as readonly string[]).includes(key)
  );
}

function parseFrontmatter(source: string, file: string): {
  fields: Record<string, string>;
  body: string;
} {
  if (!source.startsWith("---")) {
    throw new Error(`[posts] ${file}: missing frontmatter block`);
  }

  const end = source.indexOf("\n---", 3);
  if (end === -1) {
    throw new Error(`[posts] ${file}: frontmatter block is not closed`);
  }

  const rawBlock = source.slice(3, end);
  const body = source.slice(end + 4).replace(/^[\r\n]+/, "");
  const fields: Record<string, string> = {};

  for (const line of rawBlock.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`[posts] ${file}: frontmatter line is not a key/value pair: ${line.trim()}`);
    }

    const key = line.slice(0, separator).trim();
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^["']/, "")
      .replace(/["']$/, "");

    if (!isKnownField(key)) {
      throw new Error(`[posts] ${file}: unknown frontmatter field "${key}"`);
    }
    fields[key] = value;
  }

  return { fields, body };
}

/**
 * Parses one post source into the typed shape.
 *
 * @throws when a required field is missing, the date is not `YYYY-MM-DD`, or an
 * unknown frontmatter field appears — a broken post must never ship.
 */
export function parsePost(source: string, file: string): Post {
  const { fields, body } = parseFrontmatter(source, file);

  for (const field of REQUIRED_FIELDS) {
    if (fields[field] === undefined || fields[field] === "") {
      throw new Error(`[posts] ${file}: missing required frontmatter field "${field}"`);
    }
  }

  const date = fields.date;
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`[posts] ${file}: field "date" must be YYYY-MM-DD, got "${date}"`);
  }

  const slug = file
    .replace(/^.*\//, "")
    .replace(/\.md$/, "");

  return {
    slug,
    title: fields.title,
    date,
    summary: fields.summary,
    teaserGame: fields.teaserGame,
    teaserLevel: fields.teaserLevel,
    body,
  };
}

/** Newest first; equal dates fall back to the slug so the order is stable. */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

const postSources: Record<string, string> = import.meta.glob("./posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** The markdown, compiled at build time — the only place post files are read. */
export function loadPosts(): Post[] {
  const posts = Object.entries(postSources).map(([path, source]) => parsePost(source, path));
  return sortPosts(posts);
}
