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
      // Enforce group order: 1) Node built-ins, 2) external packages, 3) internal/relative paths
      "import/order": [
        "error",
        {
          "groups": [
            "builtin",    // e.g. import * as fs from "fs"
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
