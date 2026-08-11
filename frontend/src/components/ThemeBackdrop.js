/**
 * Theme background for the hero and loading screens.
 *
 * The image, its tint strength and its dim level come from --theme-bg-image,
 * --theme-bg-tint and --theme-bg-dim, set per theme in globals.css, so
 * switching themes swaps the artwork with no JS and no re-render. A static
 * url() in a stylesheet also keeps this within CLAUDE.md's no-inline-styles
 * rule, which a runtime next/image src could not do while staying themeable.
 *
 * Layer order is load-bearing: tint recolours the artwork, dim then lowers the
 * result uniformly, and the scrim shapes what's left around the content. Dim
 * sits above the tint so the blend samples the artwork's own luminosity rather
 * than an already-darkened copy.
 *
 * On the dashboard this gives way to the Unsplash brand photo — except when
 * there isn't one, where it stays as a far better fallback than flat colour.
 */
export function ThemeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="theme-backdrop pointer-events-none fixed inset-0 z-0"
    >
      <div className="theme-backdrop-tint absolute inset-0" />
      <div className="theme-backdrop-dim absolute inset-0" />
      <div className="theme-backdrop-scrim absolute inset-0" />
    </div>
  );
}
