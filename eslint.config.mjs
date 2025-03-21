import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default defineConfig([
  globalIgnores([
    "cypress/*",
    ".config/*",
    "node_modules/*",
    "build/*",
    "cypress.config.js",
    ".next/*",
  ]),
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  },
  {
    files: [".next/**/*.{js,jsx}"],
    rules: {
      "no-prototype-builtins": "off", // Disable no-prototype-builtins for these files
      "no-unused-vars": "off", // Disable no-unused-vars for these files
      "no-undef": "off", // Disable no-undef for these files
      "no-sparse-arrays": "off", // Disable no-sparse-arrays for these files
      "no-redeclare": "off", // Disable no-redeclare for these files
      "no-fallthrough": "off", // Disable no-fallthrough for these files
      "no-empty": "off", // Disable no-empty for these files
    },
  },
]);
