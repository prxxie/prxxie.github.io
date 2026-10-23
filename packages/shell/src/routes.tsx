import React from "react";
import type { RouteObject } from "react-router";
import AppShell from "./AppShell";
import HomePage from "./screens/HomePage";
import GamesHub from "./screens/GamesHub";
import GameRoute from "./screens/GameRoute";
import DevlogIndex from "./screens/DevlogIndex";
import DevlogPost from "./screens/DevlogPost";
import NotFound from "./screens/NotFound";
import { RouteError } from "./components/regions/ErrorBoundary";

/** The three puzzle remotes, in the order the hub lists them. */
export const games = [
  {
    slug: "shikaku",
    title: "Shikaku",
    blurb: "Divide the grid into rectangles that each hold one number.",
  },
  {
    slug: "sokoban",
    title: "Sokoban",
    blurb: "Push every crate onto a target without cornering yourself.",
  },
  {
    slug: "slitherlink",
    title: "Slitherlink",
    blurb: "Draw one closed loop that obeys every numbered clue.",
  },
] as const;

export type GameSlug = (typeof games)[number]["slug"];

export const gameSlugs: GameSlug[] = games.map((game) => game.slug);

export function isGameSlug(value: string): value is GameSlug {
  return (gameSlugs as string[]).includes(value);
}

/**
 * Every path the build prerenders, in navigation order. The dynamic entries are
 * expanded from the game registry and, once US-DEVLOG-001 lands, from the post
 * collection compiled out of `public/posts`.
 */
export function prerenderPaths(postSlugs: string[] = []): string[] {
  return [
    "/",
    "/games",
    ...gameSlugs.map((slug) => `/games/${slug}`),
    "/devlog",
    ...postSlugs.map((slug) => `/devlog/${slug}`),
    "/404",
  ];
}

/**
 * One route table, read by the browser and by the prerender step.
 * `/about` is not a route: the proof page carries the biography (US-HOME-001).
 */
export function createAppRoutes(): RouteObject[] {
  return [
    {
      path: "/",
      element: <AppShell />,
      // Each child carries its own errorElement so a failure replaces the page
      // region only: the header, the navigation and the footer stay mounted.
      children: [
        { index: true, element: <HomePage />, errorElement: <RouteError /> },
        { path: "games", element: <GamesHub />, errorElement: <RouteError /> },
        { path: "games/:game", element: <GameRoute />, errorElement: <RouteError /> },
        { path: "devlog", element: <DevlogIndex />, errorElement: <RouteError /> },
        { path: "devlog/:slug", element: <DevlogPost />, errorElement: <RouteError /> },
        { path: "*", element: <NotFound />, errorElement: <RouteError /> },
      ],
    },
  ];
}
