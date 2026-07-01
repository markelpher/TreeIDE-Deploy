const { defineConfig } = require('vite');
const path = require('path');
const pkg = require('./package.json');

module.exports = defineConfig({
    root: path.resolve(__dirname, 'src/renderer'),
    base: './',
    define: {
        __TREEIDE_VERSION__: JSON.stringify(pkg.version)
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            host: '127.0.0.1',
            port: 5173
        }
    },
    build: {
        outDir: path.resolve(__dirname, 'dist/renderer'),
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'src/renderer/index.html')
        }
    }
});