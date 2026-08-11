"use client";

import { useEffect, useState } from "react";

/**
 * Resolves CSS variables to concrete colour strings for Recharts.
 *
 * Recharts renders SVG fills through inline attributes and cannot consume
 * var(--positive), so the values have to be read out of the cascade with
 * getComputedStyle. A MutationObserver on data-theme re-reads them when the
 * theme changes, which is what keeps the chart in step with the rest of the UI.
 *
 * @param {string[]} names CSS custom property names, e.g. ["--positive"]
 * @returns {Record<string, string>} resolved values, empty on first paint
 */
export function useThemeColors(names) {
  const [colors, setColors] = useState({});

  useEffect(() => {
    const read = () => {
      const styles = getComputedStyle(document.documentElement);
      const next = {};
      for (const name of names) {
        next[name] = styles.getPropertyValue(name).trim();
      }
      setColors(next);
    };

    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
    // names is a module-level constant at every call site, so a join is a
    // stable and cheap dependency.
  }, [names.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return colors;
}
