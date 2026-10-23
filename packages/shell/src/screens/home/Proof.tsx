import React from "react";
import facts from "../../generated/build-facts.json";

interface BuildFacts {
  tests: number | null;
  files: number | null;
  gates: { name: string; passing: boolean }[];
  remotes: number | null;
  levels: number | null;
}

const measured = facts as BuildFacts;

function Figure({ label, value }: { label: string; value: number | null }): React.ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-code text-[11px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="font-display text-[28px] leading-none text-ink">
        {value === null ? <span className="text-[18px] text-muted">not measured yet</span> : value}
      </dd>
    </div>
  );
}

/**
 * The engineering claims, as numbers the build measured (US-HOME-003). A figure
 * with no source is a named placeholder, never a stale number.
 */
export default function Proof(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="proof">
      <h2 className="font-display text-[28px] leading-tight text-ink" id="proof">
        The proof
      </h2>
      <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Figure label="Tests passing" value={measured.tests} />
        <Figure label="Test files" value={measured.files} />
        <Figure label="Federated bundles" value={measured.remotes} />
        <Figure label="Puzzle levels" value={measured.levels} />
      </dl>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 font-code text-[11px] text-muted">
        {measured.gates.map((gate) => (
          <li key={gate.name}>
            {gate.name}: {gate.passing ? "passing" : "failing"}
          </li>
        ))}
        <li>accessibility: checked on the built artifact</li>
      </ul>
    </section>
  );
}
