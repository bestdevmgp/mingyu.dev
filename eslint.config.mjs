import next from "eslint-config-next";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const config = [
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
];

export default config;
