const importPlugin = require("eslint-plugin-import");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Enforce group order: 1) external packages, 2) internal/relative paths
      "import/order": [
        "error",
        {
          "groups": [
            "external",   // e.g. import OpenAI from "openai"
            "internal",   // e.g. import { Foo } from "../../commons/..."
          ],
          "pathGroups": [
            {
              "pattern": "./**",
              "group": "internal",
            },
            {
              "pattern": "../**",
              "group": "internal",
            },
          ],
          "newlines-between": "always",
          "alphabetize": {
            "order": "asc",
            "orderImportKind": "asc",
            "caseInsensitive": true,
          },
        },
      ],
    },
  },
];
