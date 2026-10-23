import React from "react";

const PILLARS = [
  {
    title: "Small surfaces, finished",
    body: "Each thing here is small enough to finish: a puzzle, a post, a widget. Finished means tested, accessible and deployed.",
  },
  {
    title: "One shell, several bundles",
    body: "The shell owns routing, tokens and progress. Each game is a separate build, fetched only when you ask for it.",
  },
  {
    title: "Boring where it counts",
    body: "Progress lives in this browser, in localStorage. No account, no backend, no cookie banner.",
  },
] as const;

/** What this site is made of, in the reader's language (US-HOME-001). */
export default function WhatIBuild(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="what-i-build">
      <h2 className="font-display text-[28px] leading-tight text-ink" id="what-i-build">
        What I build
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <li className="panel panel-body flex flex-col gap-2" key={pillar.title}>
            <h3 className="font-display text-[20px] leading-tight text-ink">{pillar.title}</h3>
            <p className="text-[15px] leading-relaxed text-body">{pillar.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
