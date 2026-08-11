"use client";

import { useEffect, useRef, useState } from "react";

import { useTheme } from "@/hooks/useTheme";
import { THEMES } from "@/lib/themes";

/**
 * Named theme selector. Each option renders a live accent swatch by mounting a
 * scoped [data-theme] wrapper, so the dot always shows that theme's real
 * accent colour rather than a duplicated hex.
 */
export function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}`}
        className="flex items-center gap-2 rounded-pill border border-line bg-card/70 px-3 py-2 backdrop-blur-[12px] transition-colors duration-200 hover:border-line-accent hover:bg-card-hover/80"
      >
        <span className="size-3 rounded-pill bg-accent" aria-hidden="true" />
        <span className="hidden text-sm text-fg-secondary sm:inline">{active.label}</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Theme"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-card border border-line bg-card/95 backdrop-blur-[12px]"
        >
          {THEMES.map((item) => (
            <li key={item.id} data-theme={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={item.id === theme}
                onClick={() => {
                  changeTheme(item.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-card-hover"
              >
                <span className="size-3 shrink-0 rounded-pill bg-accent" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-sm text-fg">{item.label}</span>
                  <span className="block text-xs text-fg-muted">{item.description}</span>
                </span>
                {item.id === theme ? (
                  <span className="text-xs text-accent" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
