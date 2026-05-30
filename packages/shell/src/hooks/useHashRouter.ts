import { useState, useEffect, useCallback } from "react";
import type { Tab } from "../types";

const VALID_TABS: Tab[] = ["home", "about", "posts", "pets", "shikaku", "sokoban"];

function getTabFromHash(): Tab {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const path = hash.replace(/^#\/?/, "");
  if ((VALID_TABS as string[]).includes(path)) {
    return path as Tab;
  }
  return "home";
}

export function useHashRouter(): { currentTab: Tab; navigate: (tab: Tab) => void } {
  const [currentTab, setCurrentTab] = useState<Tab>(getTabFromHash);

  useEffect(() => {
    const handleHashChange = (): void => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((tab: Tab) => {
    window.location.hash = tab === "home" ? "" : `#/${tab}`;
    setCurrentTab(tab);
  }, []);

  return { currentTab, navigate };
}
