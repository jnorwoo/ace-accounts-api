const {
    defineConfig,
    globalIgnores,
// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require("eslint/config");

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsParser = require("@typescript-eslint/parser");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const globals = require("globals");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const js = require("@eslint/js");

const {
    FlatCompat,
// eslint-disable-next-line @typescript-eslint/no-require-imports
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",
        parserOptions: {},

        globals: {
            ...globals.node,
            ...globals.jest,
        },
    },

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    extends: compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended"),
}, globalIgnores(["**/dist/"])]);
