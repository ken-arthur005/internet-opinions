import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // useGSAP takes a dependency array like useEffect, but the rule doesn't
      // know that by default — without this, stale closures in animation
      // callbacks pass lint silently.
      "react-hooks/exhaustive-deps": [
        "warn",
        { additionalHooks: "(useGSAP)" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
