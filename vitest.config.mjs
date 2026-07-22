import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: path.resolve(__dirname),
    resolve: {
        alias: {
            electron: path.resolve(__dirname, 'tests/mocks/electron.mjs')
        }
    },
    test: {
        include: ['tests/**/*.test.js'],
        globals: true,
        environment: 'node',
        environmentMatchGlobs: [
            ['tests/customSelect.test.js', 'happy-dom'],
            ['tests/editor-indent.test.js', 'happy-dom'],
            ['tests/renderer-templates.test.js', 'happy-dom'],
            ['tests/renderer-toast.test.js', 'happy-dom'],
            ['tests/renderer-tree-render.test.js', 'happy-dom'],
            ['tests/panel-resize.test.js', 'happy-dom'],
            ['tests/discord-presence-ui.test.js', 'happy-dom']
        ]
    }
});
