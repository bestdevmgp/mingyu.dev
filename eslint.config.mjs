import next from "eslint-config-next";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const nodeGlobals = {
  module: "readonly",
  require: "readonly",
  process: "readonly",
  __dirname: "readonly",
  __filename: "readonly",
  exports: "writable",
};

const config = [
  {
    ignores: ["**/.next/**", "**/node_modules/**", "**/generated/**", "next-env.d.ts"],
  },

  ...next,

  prettierRecommended,

  {
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "import/order": [
        "error",
        {
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: false,
          },
          groups: ["builtin", "external", "internal", ["sibling", "index", "parent"], "type"],
          pathGroups: [
            {
              pattern: "{react*,react*/**}",
              group: "external",
              position: "before",
            },
            {
              pattern: "{@/*,@/*/**}",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: [],
        },
      ],
      "import/newline-after-import": ["error", { count: 1 }],
    },
  },

  {
    files: ["**/*.{js,cjs,mjs}", "*.config.ts", "prisma.config.ts"],
    languageOptions: { globals: nodeGlobals },
  },
];

export default config;
