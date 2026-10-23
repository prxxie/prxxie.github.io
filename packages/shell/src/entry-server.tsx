import React from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppRoutes, games, prerenderPaths } from "./routes";
import { ProgressServiceProvider } from "./hooks/useProgressService";
import { loadPosts, type Post } from "posts/content";

export interface PrerenderedPage {
  path: string;
  title: string;
  /** The sentence a search result or a share card shows for this route (US-LAUNCH-001). */
  description: string;
  html: string;
}

const SITE = "prxxie.dev";

/** The posts the build read, so a post route can describe itself. */
const posts: Post[] = loadPosts();

function postFor(pathname: string): Post | undefined {
  const slug = /^\/devlog\/([^/]+)$/.exec(pathname)?.[1];

  return posts.find((post) => post.slug === slug);
}

/** `<title>` and `<main>` must describe the route, not the home page (AC3). */
export function titleForPath(pathname: string): string {
  if (pathname === "/" || pathname === "") return `${SITE} — small, finished things`;
  if (pathname === "/404") return `Page not found — ${SITE}`;

  const gameMatch = /^\/games\/([^/]+)$/.exec(pathname);
  if (gameMatch) {
    const slug = gameMatch[1];
    const game = games.find((entry) => entry.slug === slug);

    return game ? `${game.title} — ${SITE}` : `Unknown game — ${SITE}`;
  }
  if (pathname === "/games") return `Games — ${SITE}`;
  if (pathname === "/devlog") return `Devlog — ${SITE}`;

  const post = postFor(pathname);
  if (post) return `${post.title} — Devlog — ${SITE}`;

  return `Page not found — ${SITE}`;
}

/**
 * One sentence per route, so a search result and a share card say what the page is
 * about. A route with no sentence of its own falls back to the site sentence.
 */
export function descriptionForPath(pathname: string): string {
  const post = postFor(pathname);
  if (post) return post.summary;

  const game = games.find((entry) => pathname === `/games/${entry.slug}`);
  if (game) return `${game.title}: ${game.blurb}`;

  if (pathname === "/games") return "Three small puzzle games, each shipped as its own deployable app.";
  if (pathname === "/devlog") return "Notes on building this site one story at a time, with tests and CI as the proof.";
  if (pathname === "/404") return "There is no page at this address.";

  return "prxxie builds small, finished things: puzzle games, a devlog, and the build that ships them.";
}

/** Every path the build must emit, once per route (AC1). */
export function listRoutes(postSlugs: string[] = []): string[] {
  return prerenderPaths(postSlugs);
}

/**
 * Renders one route to a string with React Router's static handler: the same
 * route table the browser uses, so the prerendered document and the hydrated
 * one cannot drift.
 */
export async function renderPage(pathname: string): Promise<PrerenderedPage> {
  const routes = createAppRoutes();
  const handler = createStaticHandler(routes);
  const url = new URL(pathname, "https://prxxie.dev");
  const context = await handler.query(new Request(url));

  if (context instanceof Response) {
    throw new Error(`the route table answered ${pathname} with ${context.status}, not a page`);
  }

  const router = createStaticRouter(handler.dataRoutes, context);
  const queryClient = new QueryClient();
  const html = renderToString(
    <ProgressServiceProvider>
      <QueryClientProvider client={queryClient}>
        <StaticRouterProvider router={router} context={context} />
      </QueryClientProvider>
    </ProgressServiceProvider>,
  );

  return { path: pathname, title: titleForPath(pathname), description: descriptionForPath(pathname), html };
}
