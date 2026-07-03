const { chmodSync, copyFileSync, existsSync } = require('node:fs');
const path = require('node:path');

exports.default = async function afterPack(context) {
    if (context.electronPlatformName !== 'linux') { return; }

    const source = path.join(__dirname, '..', 'build', 'linux', 'tree-ide-launcher.sh');
    if (!existsSync(source)) { return; }

    const target = path.join(context.appOutDir, 'tree-ide-launcher');
    copyFileSync(source, target);
    chmodSync(target, 0o755);
};