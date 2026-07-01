import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: path.resolve(__dirname),
    test: {
        include: ['tests/**/*.test.js'],
        globals: true,
        environment: 'node',
        environmentMatchGlobs: [
            ['tests/customSelect.test.js', 'happy-dom'],
            ['tests/renderer-tree-render.test.js', 'happy-dom'],
            ['tests/panel-resize.test.js', 'happy-dom'],
        ],
    },
});