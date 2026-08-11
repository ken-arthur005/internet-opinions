import { Unbounded, Albert_Sans, JetBrains_Mono } from "next/font/google";

import { DEFAULT_THEME, THEME_STORAGE_KEY, THEME_IDS } from "@/lib/themes";
import "./globals.css";

/* Self-hosted via next/font rather than DESIGN.md's @import url(...) — no
   render-blocking request to fonts.googleapis.com and no FOUT. The variables
   below are consumed by the @theme inline block in globals.css.

   Unbounded and Albert Sans are both variable fonts, so no weight array is
   passed: Next loads the variable axis and every weight is available. */
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  display: "swap",
});

const albertSans = Albert_Sans({
  variable: "--font-albert-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  // Numbers only appear on the dashboard, so preloading this on the hero
  // triggers a "preloaded but not used" console warning. It still loads, just
  // on demand rather than up front.
  preload: false,
});

export const metadata = {
  title: "Internet Opinions",
  description: "Discover what the internet thinks.",
};

export const viewport = {
  themeColor: "#080810",
  colorScheme: "dark",
};

/* Runs before first paint so a stored theme is applied without a frame of the
   default. Inlined deliberately: any deferred script would flash void first.
   Kept in sync with lib/themes.js via the interpolated values below. */
const noFlashTheme = `
try {
  var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  var allowed = ${JSON.stringify(THEME_IDS)};
  if (allowed.indexOf(stored) !== -1) {
    document.documentElement.setAttribute('data-theme', stored);
  }
} catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
      className={`${unbounded.variable} ${albertSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
