import React from "react";
import { Link, useParams } from "react-router";
import { loadPosts, type Post } from "@devlog/content";
import { renderPostBody } from "@devlog/markdown";
import NotFound from "./NotFound";

/** The collection is compiled during the build; this module-level read is the only one. */
const posts: Post[] = loadPosts();

function neighbours(slug: string): { previous: Post | null; next: Post | null } {
  const index = posts.findIndex((post) => post.slug === slug);

  return {
    previous: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/**
 * One post, with its body compiled at build time (US-DEVLOG-003): the document a
 * reader receives without JavaScript already carries the text and the links.
 */
export default function DevlogPost(): React.ReactElement {
  const { slug = "" } = useParams();
  const post = posts.find((entry) => entry.slug === slug);

  if (post === undefined) {
    return <NotFound />;
  }

  const { previous, next } = neighbours(post.slug);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link to="/devlog" className="font-code text-[12px] text-primary underline underline-offset-4">
          ← All notes
        </Link>
        <h1 className="font-display text-[40px] leading-[1.1] text-ink">{post.title}</h1>
        <p className="flex flex-wrap items-baseline gap-3">
          <time className="font-code text-[12px] text-muted" dateTime={post.date}>
            {post.date}
          </time>
          <span className="text-body">{post.summary}</span>
        </p>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: renderPostBody(post.body) }} />

      <nav aria-label="Adjacent posts" className="flex flex-wrap justify-between gap-3 border-t border-hairline pt-4">
        {previous !== null ? (
          <Link to={`/devlog/${previous.slug}`} className="text-primary underline underline-offset-4">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next !== null ? (
          <Link to={`/devlog/${next.slug}`} className="text-primary underline underline-offset-4">
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
