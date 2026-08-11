"use client";

import { useState } from "react";

/**
 * Brand input + Analyze button.
 *
 * DESIGN.md specifies a 480px input; that's a max-width here so it collapses
 * cleanly on mobile rather than forcing a horizontal scroll.
 */
export function BrandSearchForm({ onSubmit, disabled = false, initialValue = "" }) {
  const [value, setValue] = useState(initialValue);
  const trimmed = value.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[480px] flex-col items-center gap-4"
    >
      <div className="relative w-full">
        <span
          className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        >
          ⌕
        </span>
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search a brand..."
          aria-label="Brand name"
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          className="w-full rounded-field border border-line bg-card py-3.5 pr-5 pl-11 text-fg placeholder:text-fg-muted focus:border-accent focus:ring-focus focus:outline-none disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={!trimmed || disabled}
        className="rounded-field bg-accent px-7 py-3.5 text-base font-semibold text-ground transition-opacity duration-200 hover:opacity-88 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Analyze
      </button>
    </form>
  );
}
