const { execSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const path = require('node:path');

exports.default = async function beforePack() {
    execSync('npm run build:renderer', { stdio: 'inherit' });

    const indexHtml = path.join(__dirname, '..', 'dist', 'renderer', 'index.html');
    const assetsDir = path.join(__dirname, '..', 'dist', 'renderer', 'assets');

    if (!existsSync(indexHtml)) {
        throw new Error('Renderer build failed: dist/renderer/index.html is missing');
    }
    if (!existsSync(assetsDir)) {
        throw new Error('Renderer build failed: dist/renderer/assets is missing');
    }
};