import React, { useEffect, useState } from "react";

interface ShikakuSaveData {
  completed?: Record<string, { stars: number; bestTime: number }>;
}

interface CompletedLevel {
  module: string;
  levelId: string;
  stars: number;
  completedAt: number;
}

interface CozyProgress {
  version: number;
  state: { completedLevels: CompletedLevel[] };
}

const PROGRESS_KEY = "cozyos.progress.v1";

const STATIC_POSTS = [
  { date: "2026-05-30", title: "Monochrome Amber CRT theme conversion completed" },
  { date: "2026-05-29", title: "Building Sokoban micro-frontend puzzle game" },
];

export default function StatsTelemetry(): React.ReactElement {
  const [shikakuSolved, setShikakuSolved] = useState(0);
  const [sokobanSolved, setSokobanSolved] = useState(0);
  const [sokobanMaxLevel, setSokobanMaxLevel] = useState(-1);

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
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress) as CozyProgress;
        if (parsed?.version === 1 && Array.isArray(parsed.state?.completedLevels)) {
          const sokobanLevels = parsed.state.completedLevels.filter(
            (l) => l.module === "sokoban"
          );
          setSokobanSolved(sokobanLevels.length);
          // levelId is a 0-based index stored as string (e.g. "0", "4")
          const maxIdx = sokobanLevels.reduce((max, l) => {
            const idx = parseInt(l.levelId, 10);
            return Number.isNaN(idx) ? max : Math.max(max, idx);
          }, -1);
          setSokobanMaxLevel(maxIdx);
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
            SOLVED: {sokobanSolved} | BEST LEVEL: {sokobanMaxLevel >= 0 ? sokobanMaxLevel + 1 : 0}
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
