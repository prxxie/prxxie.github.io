import React from "react";
import Headline from "./home/Headline";
import WhatIBuild from "./home/WhatIBuild";
import PuzzleSlot from "./home/PuzzleSlot";
import Proof from "./home/Proof";
import ContactBlock from "../components/ContactBlock";

/**
 * The proof page: headline → what I build → puzzle → proof → contact (US-HOME-001).
 * Every section is text in the prerendered document, so the page reads with
 * JavaScript off.
 */
export default function HomePage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-12 py-4">
      <Headline />
      <WhatIBuild />
      <PuzzleSlot />
      <Proof />
      <section className="flex flex-col gap-3" aria-labelledby="say-hello">
        <h2 className="font-display text-[28px] leading-tight text-ink" id="say-hello">
          Say hello
        </h2>
        <p className="max-w-[62ch] text-[15px] leading-relaxed text-body">
          Hiring, collaborating, or curious about how something here works? Write to me directly.
        </p>
        <ContactBlock />
      </section>
    </div>
  );
}
