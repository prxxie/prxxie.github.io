import React from "react";
import { Link } from "react-router";

/** The first thing a reader sees: who this is, what they get, and where to go (US-HOME-001). */
export default function Headline(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4">
      <p className="font-code text-[11px] uppercase tracking-[0.18em] text-muted">prxxie — front-end engineer</p>
      <h1 className="font-display text-[40px] leading-[1.05] text-ink sm:text-[56px]">
        I build small, finished things.
      </h1>
      <p className="max-w-[62ch] text-[17px] leading-relaxed text-body">
        Three puzzle games, a devlog and a pet that lives in the footer — built as one site with React,
        Module Federation and a test suite that has to pass before anything ships.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" to="/games">
          Play the games
        </Link>
        <Link className="btn" to="/devlog">
          Read the devlog
        </Link>
      </div>
    </section>
  );
}
