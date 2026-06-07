import { useState, useCallback, useEffect } from "react";
import { getChapters } from "@/data/chapters";

const STORAGE_KEY = "jslearn_progress";

type ProgressStore = {
  completedSlugs: string[];
  lastUpdated: string | null;
};

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completedSlugs: [], lastUpdated: null };
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return { completedSlugs: [], lastUpdated: null };
  }
}

function writeStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable — silently skip
  }
}

export function useProgress() {
  const [store, setStore] = useState<ProgressStore>(() => readStore());
  const chapters = getChapters();
  const total = chapters.length;
  const completed = store.completedSlugs.length;

  const markComplete = useCallback((slug: string, done: boolean) => {
    setStore((prev) => {
      const next: ProgressStore = {
        completedSlugs: done
          ? Array.from(new Set([...prev.completedSlugs, slug]))
          : prev.completedSlugs.filter((s) => s !== slug),
        lastUpdated: new Date().toISOString(),
      };
      writeStore(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (slug: string) => store.completedSlugs.includes(slug),
    [store.completedSlugs]
  );

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setStore(readStore());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return {
    completedSlugs: store.completedSlugs,
    totalChapters: total,
    completedChapters: completed,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
    streakDays: Math.min(completed, 7),
    markComplete,
    isCompleted,
  };
}
