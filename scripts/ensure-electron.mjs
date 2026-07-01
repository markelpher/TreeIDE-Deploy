import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const electronDir = path.join(root, 'node_modules/electron');
const pathTxt = path.join(electronDir, 'path.txt');
const installJs = path.join(electronDir, 'install.js');

const install = spawnSync(process.execPath, [installJs], { stdio: 'inherit', cwd: root });
if (install.status !== 0) {
    process.exit(install.status ?? 1);
}

for (let attempt = 1; attempt <= 60; attempt++) {
    if (fs.existsSync(pathTxt)) {
        console.log('Electron binary ready');
        process.exit(0);
    }
    console.log(`Waiting for Electron install (${attempt}/60)...`);
    await sleep(2000);
}

console.error('Electron binary was not installed');
try {
    console.error(fs.readdirSync(electronDir));
} catch (err) {
    console.error(err?.message || err);
}
process.exit(1);