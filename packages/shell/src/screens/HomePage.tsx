import React from "react";
import HomeDashboard from "../components/HomeDashboard";

/**
 * Placeholder front page: US-HOME-001 replaces the dashboard with the proof page.
 * The single `h1` is here already so every route has exactly one.
 */
export default function HomePage(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-[32px] leading-tight text-ink">
        prxxie builds small, finished things
      </h1>
      <HomeDashboard />
    </section>
  );
}
