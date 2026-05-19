import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".worktrees/**",
    "**/*.md",
  ]),
  {
    rules: {
      "prefer-arrow-callback": ["error", { allowNamedFunctions: true }],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "no-multi-spaces": "error",
      "no-prototype-builtins": "off",
      camelcase: "off",
      "no-underscore-dangle": "off",
      "import/no-unresolved": "off",
      "prefer-destructuring": "off",
      "import/extensions": "off",
      "import/no-extraneous-dependencies": "off",
      "import/prefer-default-export": "off",
      "react/jsx-props-no-spreading": "off",
      "linebreak-style": "off",
      "no-unused-vars": "warn",
      "max-len": ["error", { code: 140 }],
      "no-magic-numbers": "off",
      "no-param-reassign": "off",
      semi: ["error", "never"],
      "no-console": "warn",
      "no-implicit-globals": "error",
      "template-curly-spacing": "off",
      indent: ["error", 2, { SwitchCase: 1, ignoredNodes: ["TemplateLiteral"] }],
      "react/jsx-max-props-per-line": ["error", { maximum: 1, when: "always" }],
      "react/jsx-one-expression-per-line": "error",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            { pattern: "components/**", group: "internal", position: "after" },
            { pattern: "pages/**", group: "internal", position: "after" },
            { pattern: "hooks/**", group: "internal", position: "after" },
            { pattern: "assets/**", group: "internal", position: "after" },
            { pattern: "utils/**", group: "internal", position: "after" },
            { pattern: "helpers/**", group: "internal", position: "after" },
            { pattern: "services/**", group: "internal", position: "after" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
    },
  },
  {
    files: ["src/components/ui/**"],
    rules: { "max-len": "off" },
  },
])

export default eslintConfig
