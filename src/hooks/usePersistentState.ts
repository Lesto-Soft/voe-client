import { useEffect, useState } from "react";

/**
 * Like useState, but the value survives page reloads via localStorage.
 * Storage failures (private mode, blocked storage) fall back to plain state.
 * @param key Unique localStorage key, e.g. "voe.taskActivities.sortAsc"
 * @param defaultValue Value used when nothing is stored yet.
 */
export function usePersistentState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable — keep working with in-memory state only
    }
  }, [key, value]);

  return [value, setValue] as const;
}
