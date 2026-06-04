import React, { useState } from "react";
import { getAudioMuted, setAudioMuted, playBeepSound } from "../utils/audio";

interface ConsoleFrameProps {
  children: React.ReactNode;
  onMobileHud?: () => void;
  onCloudClick?: () => void;
  cloudUser?: string | null;
}

export default function ConsoleFrame({
  children,
  onMobileHud,
  onCloudClick,
  cloudUser,
}: ConsoleFrameProps): React.ReactElement {
  const [muted, setMuted] = useState<boolean>(getAudioMuted);

  const handleAudioToggle = (): void => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      playBeepSound(520, 0.08);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
      <header className="bg-black border-b border-cozy-border p-3 box-border w-full relative z-30">
        <div className="max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border">
          <div className="flex items-center gap-2">
            <svg
              className="inline-block"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="var(--color-cozy-accent)"
              strokeWidth="2.5"
              strokeLinecap="square"
            >
              <path d="M3,4 L8,8 L3,12" />
              <line x1="9" y1="12" x2="14" y2="12" />
            </svg>
            <span className="font-press text-xs font-bold text-cozy-accent uppercase">
              PRXXIE_OS v4.7
            </span>
          </div>

          <div className="flex items-center gap-3">
            {onCloudClick && (
              <button
                onClick={onCloudClick}
                className="pixel-btn text-[9px] px-3 py-1"
                aria-label="Cloud sync menu"
              >
                {cloudUser ? "[CLOUD: SYNCED]" : "[CLOUD: CONNECT]"}
              </button>
            )}

            <button
              onClick={handleAudioToggle}
              className={`pixel-btn text-[9px] px-3 py-1 ${
                !muted ? "bg-cozy-accent text-black border-cozy-border" : ""
              }`}
              aria-label="Toggle Audio Beeps"
            >
              SOUND: {!muted ? "ON" : "OFF"}
            </button>

            {onMobileHud && (
              <button
                onClick={onMobileHud}
                className="md:hidden pixel-btn text-[9px] px-3 py-1"
                aria-label="Open mobile HUD"
              >
                [ HUD ]
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
        {children}
      </main>
    </div>
  );
}
