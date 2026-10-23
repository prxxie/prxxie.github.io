import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      // React 17+ JSX transform: React does not need to be in scope.
      "react/react-in-jsx-scope": "off",
      // Props are typed by TypeScript; PropTypes would duplicate every contract.
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-call": "warn",
      // Test doubles pass unbound matchers (e.g. expect(...).toBe) around by design.
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // Build scripts run on plain Node, outside the TypeScript project: lint them
  // without the type-aware rules that need a tsconfig entry for every file.
  {
    files: ["scripts/**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: { project: false, projectService: false },
    },
  },
  {
    ignores: [
      "dist/",
      "node_modules/",
      "packages/*/dist/",
      "*.config.ts",
      "*.config.js",
      "*.config.mjs",
      "eslint.config.mjs",
    ],
  }
);
