module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["react-app", "react-app/jest"],
  plugins: ["@typescript-eslint", "import", "no-default-export"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "import/no-default-export": "error",
    "no-default-export/no-default-export": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error",
  },
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      excludedFiles: ["*.d.ts", "src/react-app-env.d.ts"],
      rules: {
        "import/no-default-export": "error",
      },
    },
    {
      files: ["*.d.ts"],
      rules: {
        "import/no-default-export": "off",
        "no-default-export/no-default-export": "off",
      },
    },
  ],
};
