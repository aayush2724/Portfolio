import js from "@eslint/js"
import globals from "globals"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"

export default [
  { ignores: ["dist/**", "node_modules/**", "scripts/og/**", ".kiro/**", "coverage/**"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{js,jsx,mjs}"],
    plugins: { "react-hooks": reactHooks },
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off",
      // Prose-heavy JSX: literal apostrophes and quotes in text are intended.
      "react/no-unescaped-entities": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    // react-three-fiber elements take three.js constructor props that are not
    // DOM attributes; the unknown-property rule has no way to know that.
    files: ["src/components/LazyDevPage.jsx", "src/components/ShaderScene.jsx", "src/components/sentira/ParticleWave.jsx"],
    rules: { "react/no-unknown-property": "off" },
  },
]
