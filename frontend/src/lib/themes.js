/**
 * Theme registry.
 *
 * Each theme's colours live in globals.css under a [data-theme="..."] block;
 * this module only carries the identity and the label shown in the switcher.
 * The `swatch` var name is read by ThemeSwitcher to render a live accent dot —
 * it deliberately points at a CSS variable rather than a hex value so the
 * swatch can never drift from the real palette.
 */

export const THEMES = [
  {
    id: "void",
    label: "Void",
    description: "Cold, pure dark",
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Deep space purple",
  },
  {
    id: "ember",
    label: "Ember",
    description: "Warm amber fire",
  },
  {
    id: "matrix",
    label: "Matrix",
    description: "Terminal green",
  },
];

export const DEFAULT_THEME = "void";

export const THEME_STORAGE_KEY = "io-theme";

export const THEME_IDS = THEMES.map((theme) => theme.id);

export function isValidTheme(value) {
  return THEME_IDS.includes(value);
}
