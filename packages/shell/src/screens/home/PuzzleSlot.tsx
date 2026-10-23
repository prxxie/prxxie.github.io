import React from "react";

/**
 * The place the playable puzzle goes (US-HOME-002). Until then the section names
 * what will be here rather than pretending to be a game.
 */
export default function PuzzleSlot(): React.ReactElement {
  return (
    <section className="flex flex-col gap-3" aria-labelledby="try-one">
      <h2 className="font-display text-[28px] leading-tight text-ink" id="try-one">
        Try one
      </h2>
      <div className="panel panel-dark flex flex-col items-start gap-3 p-6" data-puzzle-slot="">
        <p className="text-[15px] leading-relaxed text-on-dark">
          A level of Shikaku, playable right here — no sign-up, and it counts towards the pet.
        </p>
        <p className="font-code text-[11px] text-on-dark-soft">The embed arrives with US-HOME-002.</p>
      </div>
    </section>
  );
}
