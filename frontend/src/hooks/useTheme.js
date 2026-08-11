"use client";

import { useCallback, useEffect, useState } from "react";

import { DEFAULT_THEME, THEME_STORAGE_KEY, isValidTheme } from "@/lib/themes";

/**
 * Reads and writes the data-theme attribute on <html>.
 *
 * The initial render intentionally reports DEFAULT_THEME rather than reading
 * localStorage, so server and client markup match. The inline script in
 * layout.js has already applied the stored theme to the DOM by then; the
 * effect below only syncs React's copy of that state. This keeps the switcher
 * label correct without a hydration mismatch.
 */
export function useTheme() {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    const applied = document.documentElement.getAttribute("data-theme");
    if (isValidTheme(applied)) setTheme(applied);
  }, []);

  const changeTheme = useCallback((next) => {
    if (!isValidTheme(next)) return;
    document.documentElement.setAttribute("data-theme", next);
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — the theme still applies for
      // this session, it just won't persist.
    }
  }, []);

  return { theme, changeTheme };
}
