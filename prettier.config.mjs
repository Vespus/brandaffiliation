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
    importOrder: [
        '^react$',
        '',
        '^(next|next-.*)(.*)$',
        '',
        '<TYPES>^(node:)',
        '<TYPES>',
        '',
        '<BUILTIN_MODULES>', // Node.js built-in modules
        '<THIRD_PARTY_MODULES>', // Imports not matched by other special words or groups.,
        '^@/(.*)$',
        '<TYPES>^[.]',
        '^[.]',
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderCaseSensitive: true,
}

export default config
