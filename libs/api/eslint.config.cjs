const baseConfig = require("../../eslint.config.cjs");

module.exports = [
    {
        ignores: [
            "**/dist"
        ]
    },
    ...baseConfig,
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        files: [
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    }
];
