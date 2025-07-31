/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config}
 */
const config = {
    trailingComma: 'es5',
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    printWidth: 120,
    plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
    // This plugin's options
    importOrder: [
        '<TYPES>^(node:)',
        '<TYPES>',
        '<TYPES>^[.]',
        '^react$',
        '^next',
        '<BUILTIN_MODULES>', // Node.js built-in modules
        '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.,
        '^@/(.*)$',
        '^[./]',
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    importOrderCaseSensitive: false,
}

export default config
