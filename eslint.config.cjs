const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        ignores: ['node_modules/', 'dist/', '*.min.js', 'lucide-local.js']
    },
    {
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                fetch: 'readonly',
                navigator: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                AudioContext: 'readonly',
                ResizeObserver: 'readonly',
                MutationObserver: 'readonly',
                URL: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_|err|e|e2', caughtErrorsIgnorePattern: '^_|err|e|e2' }],
            'no-console': 'off',
            'prefer-const': 'warn',
            'no-var': 'warn',
            'eqeqeq': 'warn',
            'curly': 'warn',
            'no-empty': 'warn',
            'no-useless-assignment': 'off'
        }
    },
    {
        files: ['scripts/**/*.mjs'],
        languageOptions: {
            globals: {
                AbortController: 'readonly',
                console: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                fetch: 'readonly',
                URL: 'readonly',
                Buffer: 'readonly'
            }
        }
    },
    {
        files: ['src/renderer/**/*.js'],
        languageOptions: {
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                fetch: 'readonly',
                navigator: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                AudioContext: 'readonly',
                ResizeObserver: 'readonly',
                URL: 'readonly',
                Event: 'readonly',
                KeyboardEvent: 'readonly',
                getComputedStyle: 'readonly',
                indexedDB: 'readonly',
                performance: 'readonly',
                Node: 'readonly',
                Element: 'readonly',
                AbortController: 'readonly',
                updateFileNameDisplay: 'readonly',
                openFilePreview: 'readonly',
                closeFilePreview: 'readonly',
                refreshTreeView: 'readonly',
                setZoomLevel: 'readonly',
                getCurrentZoom: 'readonly',
                applyZoom: 'readonly',
                syncLanguageControls: 'readonly',
                __TREEIDE_VERSION__: 'readonly'
            }
        }
    },
    {
        files: ['src/shared/**/*.js'],
        languageOptions: {
            globals: {
                document: 'readonly',
                localStorage: 'readonly',
                navigator: 'readonly',
                window: 'readonly',
                Node: 'readonly',
                console: 'readonly'
            }
        }
    },
    {
        files: ['src/main/**/*.js', 'src/preload/**/*.{js,mjs}'],
        languageOptions: {
            globals: {
                Buffer: 'readonly',
                process: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                console: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                URL: 'readonly'
            }
        }
    },
    {
        files: ['tests/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                Event: 'readonly',
                KeyboardEvent: 'readonly',
                globalThis: 'readonly',
                Buffer: 'readonly',
                process: 'readonly',
                console: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly'
            }
        }
    }
];
