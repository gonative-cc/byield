import globals from "globals";
import tseslint from "typescript-eslint";
import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tailwind from "eslint-plugin-tailwindcss";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default defineConfig([
  js.configs.recommended,
  ...ts.configs.recommended,
  ...tailwind.configs["flat/recommended"],
  includeIgnoreFile(gitignorePath),
  {
    ignores: ["worker-configuration.d.ts", "workers/app.ts"],
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  reactHooks.configs["recommended-latest"],
  jsxA11y.flatConfigs.recommended,

  {
    settings: {
      tailwindcss: {
        config: path.join(__dirname, "/app/tailwind.css"),
        removeDuplicates: true,
        whitelist: [
          "twitter-tweet",
          "toast-bottom",
          "toast-end",
          "tabs-fixed",
          "card-border",
          "tabs-boxed",
          "dropdown-open",
          "dropdown-content",
        ],
      },
    },
  },

  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/react-in-jsx-scope": "off",
    },
    languageOptions: { globals: globals.browser },
  },

  {
    files: ["**/*.{jsx,tsx,js,ts}"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // disable tailwind classname order because prettier is doing that
      "tailwindcss/classnames-order": "off",
    },
  },

  // Prettier config to disable eslint formatting rules and avoid formatting conflicts.
  // THIS MUST ALWAYS BE THE LAST CONFIGURATION.
  eslintConfigPrettier,
]);
