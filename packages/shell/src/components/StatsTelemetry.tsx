import React, { useEffect, useState } from "react";

interface ShikakuSaveData {
  completed?: Record<string, { stars: number; bestTime: number }>;
}

const STATIC_POSTS = [
  { date: "2026-05-30", title: "Monochrome Amber CRT theme conversion completed" },
  { date: "2026-05-29", title: "Building Sokoban micro-frontend puzzle game" },
];

export default function StatsTelemetry(): React.ReactElement {
  const [shikakuSolved, setShikakuSolved] = useState(0);
  const [sokobanLevel, setSokobanLevel] = useState(0);

  useEffect(() => {
    try {
      const savedShikaku = localStorage.getItem("cozy_os_shikaku_save");
      if (savedShikaku) {
        const parsed = JSON.parse(savedShikaku) as ShikakuSaveData;
        if (parsed?.completed) {
          setShikakuSolved(Object.keys(parsed.completed).length);
        }
      }
    } catch (e) {
      console.error("Failed to parse Shikaku save progress in dashboard", e);
    }

    try {
      const savedSokoban = localStorage.getItem("cozy_os_sokoban_level");
      if (savedSokoban) {
        const parsed = parseInt(savedSokoban, 10);
        if (!Number.isNaN(parsed)) {
          setSokobanLevel(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="border border-cozy-border p-2 bg-black text-cozy-text font-mono text-[9px] flex flex-col gap-2">
      <div className="font-press text-[9px] text-cozy-accent text-center bg-cozy-muted/20 py-1">
        USER_STATS_TELEMETRY
      </div>

      <div className="flex flex-col gap-1.5 leading-relaxed">
        <div>
          <span className="text-cozy-accent font-bold">● SHIKAKU CORES</span>
          <br />
          <span>SOLVED: {shikakuSolved} PUZZLE(S)</span>
        </div>
        <div>
          <span className="text-cozy-accent font-bold">● SOKOBAN CARGO</span>
          <br />
          <span>
            LEVEL REACHED: {sokobanLevel + 1} | SOLVED: {sokobanLevel}
          </span>
        </div>
        <div className="border-t border-dashed border-cozy-border pt-1.5 mt-1">
          <span className="text-cozy-accent font-bold">● NEWEST POSTS LOG</span>
          <ul className="list-none flex flex-col gap-1 mt-1">
            {STATIC_POSTS.map((post, idx) => (
              <li key={idx} className="truncate">
                [{post.date}] {post.title}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
