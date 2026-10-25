import React from "react";
import { Link } from "react-router";
import { loadPosts, type Post } from "@devlog/content";

/** The collection is compiled during the build; this module-level read is the only one. */
const posts: Post[] = loadPosts();

function formatDate(date: string): string {
  return date;
}

/**
 * The index of the devlog (US-DEVLOG-002). Every entry is one link with a visible
 * focus ring, the newest post is first, and the whole list is in the prerendered
 * document.
 */
export default function DevlogIndex(): React.ReactElement {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[40px] leading-[1.1] text-ink">Devlog</h1>
        <p className="text-body">Notes on what was built, what broke and what it cost.</p>
      </div>

      {posts.length === 0 ? (
        <p className="panel-body text-body">
          Nothing published yet. The first note appears here the moment it lands.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                to={`/devlog/${post.slug}`}
                className="panel group flex flex-col gap-2 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-[24px] leading-tight text-ink">{post.title}</h2>
                  <time className="font-code text-[12px] text-muted" dateTime={post.date}>
                    {formatDate(post.date)}
                  </time>
                </div>
                <p className="text-body">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
