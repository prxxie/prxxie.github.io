import React, { useEffect, useState } from "react";
import PetSprite from "./PetSprite";

const MESSAGES = [
  "LOADING...",
  "PET IS WARMING UP...",
  "FETCHING MODULES...",
  "ALMOST THERE...",
  "BOOTING SYSTEM...",
  "PET IS EXCITED!",
];

interface MfeLoaderProps {
  petStage?: number;
}

export default function MfeLoader({ petStage = 1 }: MfeLoaderProps) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState("");
  const [frame, setFrame] = useState(0);

  // Cycle through cute messages
  useEffect(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Animate trailing dots independently
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(t);
  }, []);

  // Sprite animation frame (for stage that uses it)
  useEffect(() => {
    const t = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] gap-6 select-none">
      {/* Bouncing pet */}
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 80,
            height: 80,
            background: "radial-gradient(circle, rgba(255,176,0,0.15) 0%, transparent 70%)",
            animationDuration: "1.5s",
          }}
        />
        {/* Shadow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full animate-pulse"
          style={{
            width: 40,
            height: 6,
            background: "rgba(255,176,0,0.2)",
            filter: "blur(4px)",
            bottom: -8,
          }}
        />
        <div className="animate-bounce" style={{ animationDuration: "0.8s" }}>
          <PetSprite
            size={72}
            stage={petStage}
            status="playing"
            animationFrame={frame}
          />
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col items-center gap-2">
        <span
          className="font-press text-[9px] text-cozy-accent"
          style={{ minWidth: "16ch", textAlign: "center", letterSpacing: "0.05em" }}
        >
          {MESSAGES[msgIdx].replace(/\.\.\.$/, "")}{dots}
        </span>

        {/* Pixel progress bar */}
        <div
          className="border border-cozy-border bg-black overflow-hidden"
          style={{ width: 120, height: 6 }}
        >
          <div
            className="h-full bg-cozy-accent"
            style={{
              animation: "mfe-progress-slide 1.2s ease-in-out infinite alternate",
            }}
          />
        </div>
      </div>
    </div>
  );
}
