import React from "react";
import { renderToString } from "react-dom/server";
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppRoutes, games, prerenderPaths } from "./routes";
import { ProgressServiceProvider } from "./hooks/useProgressService";

export interface PrerenderedPage {
  path: string;
  title: string;
  html: string;
}

const SITE = "prxxie.dev";

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

  const postMatch = /^\/devlog\/([^/]+)$/.exec(pathname);
  if (postMatch) return `${postMatch[1]} — Devlog — ${SITE}`;

  return `Page not found — ${SITE}`;
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

  return { path: pathname, title: titleForPath(pathname), html };
}
