import React, { useEffect } from "react";
import { useUiStore } from "../store/uiStore";
import type { Tab } from "../types";

interface ConsoleFrameProps {
  children: React.ReactNode;
  currentTab: Tab;
  setTab: (tab: Tab) => void;
}

const NAV_ITEMS: Array<{ id: Tab; label: string }> = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "posts", label: "POSTS" },
  { id: "pets", label: "PETS" },
  { id: "shikaku", label: "SHIKAKU" },
];

export default function ConsoleFrame({
  children,
  currentTab,
  setTab,
}: ConsoleFrameProps): React.ReactElement {
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setMenuOpen = useUiStore((state) => state.setMenuOpen);
  const toggleMenu = useUiStore((state) => state.toggleMenu);

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

  const handleTabClick = (tabName: Tab): void => {
    setTab(tabName);
    setMenuOpen(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-cozy-bg box-border">
      <header className="bg-white border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30">
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
            <span className="font-press text-xs font-bold text-cozy-accent">
              PRXXIE
            </span>
          </div>

          <nav className="hidden md:flex gap-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`pixel-btn text-[9px] px-3 py-1 ${currentTab === item.id ? "bg-cozy-accent text-white border-cozy-border shadow-none translate-y-[2px]" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleMenu}
            className="md:hidden pixel-btn text-[9px] px-3 py-1"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu-drawer"
            aria-label="Toggle navigation menu"
          >
            [MENU.EXE]
          </button>
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
          className="fixed top-0 right-0 bottom-0 w-64 bg-white border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden"
        >
          <div className="flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2">
            <span className="font-press text-[10px] text-cozy-accent">
              📂 MENU.EXE
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-cozy-accent font-bold cursor-pointer font-press text-[10px] bg-transparent border-none"
              aria-label="Close navigation menu"
            >
              [X]
            </button>
          </div>
          <nav className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`pixel-btn w-full text-[10px] text-left py-2 px-3 ${currentTab === item.id ? "bg-cozy-accent text-white border-cozy-border shadow-none" : ""}`}
              >
                {currentTab === item.id ? "[x]" : "[ ]"} {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border">
        {children}
      </main>
    </div>
  );
}
