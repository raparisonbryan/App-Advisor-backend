module.exports = [
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'error',
            'no-undef': 'error',
            'semi': ['error', 'always']
        }
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            'build/',
            '*.min.js'
        ]
    }
];