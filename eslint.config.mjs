import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:@/|(?:\\.\\.?/)+)(?:app|features|server)(?:/|$)",
              message:
                "Keep the domain independent of app, UI and server adapters.",
            },
            {
              regex: "^(?:next|react|react-dom|zustand)(?:/|$)",
              message: "Keep domain logic framework-independent.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/storefront/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^(?:@/|(?:\\.\\.?/)+)(?:server|app/api)(?:/|$)",
              message:
                "Call server code through an HTTP route from the storefront.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
