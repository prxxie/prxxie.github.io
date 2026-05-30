import React, { useEffect, useState } from "react";
import { PixelFolderIcon } from "./Icons";
import { useUiStore } from "../store/uiStore";
import type { Tab } from "../types";
import { getAudioMuted, setAudioMuted, playBeepSound } from "../utils/audio";
import MatrixMenu from "./MatrixMenu";

interface ConsoleFrameProps {
  children: React.ReactNode;
  currentTab: Tab;
  setTab: (tab: Tab) => void;
}

export default function ConsoleFrame({
  children,
  currentTab,
  setTab,
}: ConsoleFrameProps): React.ReactElement {
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setMenuOpen = useUiStore((state) => state.setMenuOpen);
  const toggleMenu = useUiStore((state) => state.toggleMenu);
  const [muted, setMuted] = useState<boolean>(getAudioMuted);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setMenuOpen]);

  const handleAudioToggle = (): void => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      playBeepSound(520, 0.08);
    }
  };

  const handleNavigate = (tab: Tab): void => {
    setTab(tab);
    setMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
      <header className="bg-black border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30">
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
            <button
              onClick={handleAudioToggle}
              className={`pixel-btn text-[9px] px-3 py-1 ${
                !muted ? "bg-cozy-accent text-black border-cozy-border" : ""
              }`}
              aria-label="Toggle Audio Beeps"
            >
              SOUND: {!muted ? "ON" : "OFF"}
            </button>

            <button
              onClick={() => {
                playBeepSound(440, 0.05);
                toggleMenu();
              }}
              className="md:hidden pixel-btn text-[9px] px-3 py-1"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu-drawer"
              aria-label="Toggle navigation menu"
            >
              [MENU]
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/45 z-40 md:hidden animate-[fade-in_0.2s_ease-out]"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {isMenuOpen && (
        <div
          id="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed top-0 right-0 bottom-0 w-64 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden"
        >
          <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2">
            <span className="font-press text-[10px] text-cozy-accent flex items-center gap-1">
              <PixelFolderIcon className="w-3.5 h-3.5" /> MOBILE_CTRL
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-cozy-accent font-bold cursor-pointer font-press text-[10px] bg-transparent border-none"
              aria-label="Close navigation menu"
            >
              [X]
            </button>
          </div>

          <MatrixMenu currentTab={currentTab} navigate={handleNavigate} />
        </div>
      )}

      <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
        {children}
      </main>
    </div>
  );
}
