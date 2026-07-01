import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { downloadArtifact } = require('@electron/get');
const extract = require('extract-zip');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const electronDir = path.join(root, 'node_modules/electron');
const pathTxt = path.join(electronDir, 'path.txt');
const distDir = path.join(electronDir, 'dist');
const { version } = require(path.join(electronDir, 'package.json'));
const checksums = require(path.join(electronDir, 'checksums.json'));

function getDefaultElectronCache() {
    const home = os.homedir();

    switch (process.platform) {
        case 'darwin':
            return path.join(home, 'Library', 'Caches', 'electron');
        case 'win32':
            return path.join(
                process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'),
                'electron',
                'Cache'
            );
        default:
            return path.join(process.env.XDG_CACHE_HOME || path.join(home, '.cache'), 'electron');
    }
}

/** @param {string} platform */
function getPlatformPath(platform) {
    switch (platform) {
        case 'mas':
        case 'darwin':
            return 'Electron.app/Contents/MacOS/Electron';
        case 'freebsd':
        case 'openbsd':
        case 'linux':
            return 'electron';
        case 'win32':
            return 'electron.exe';
        default:
            throw new Error(`Electron builds are not available on platform: ${platform}`);
    }
}

/** @param {string} platform */
function resolveArch(platform) {
    let arch = process.env.ELECTRON_INSTALL_ARCH || process.env.npm_config_arch || process.arch;

    if (
        platform === 'darwin'
        && process.platform === 'darwin'
        && arch === 'x64'
        && process.env.npm_config_arch === undefined
    ) {
        try {
            const output = execSync('sysctl -in sysctl.proc_translated', { encoding: 'utf8' });
            if (output.trim() === '1') {
                arch = 'arm64';
            }
        } catch {
            // Ignore failure
        }
    }

    return arch;
}

/** @param {string} platformPath */
function binaryExists(platformPath) {
    return fs.existsSync(path.join(distDir, platformPath));
}

/** @param {string} platformPath */
function isInstalled(platformPath) {
    try {
        const installedVersion = fs.readFileSync(path.join(distDir, 'version'), 'utf8').replace(/^v/, '');
        if (installedVersion !== version) {
            return false;
        }

        if (fs.readFileSync(pathTxt, 'utf8') !== platformPath) {
            return false;
        }

        return binaryExists(platformPath);
    } catch {
        return false;
    }
}

/** @param {string} platformPath */
function repairMissingPathFile(platformPath) {
    if (!binaryExists(platformPath)) {
        return false;
    }

    try {
        const installedVersion = fs.readFileSync(path.join(distDir, 'version'), 'utf8').replace(/^v/, '');
        if (installedVersion !== version) {
            return false;
        }
    } catch {
        return false;
    }

    fs.writeFileSync(pathTxt, platformPath);
    return true;
}

async function installElectron() {
    const platform = process.env.ELECTRON_INSTALL_PLATFORM || process.env.npm_config_platform || process.platform;
    const arch = resolveArch(platform);
    const platformPath = getPlatformPath(platform);

    if (isInstalled(platformPath)) {
        console.log('Electron binary already installed');
        return;
    }

    if (repairMissingPathFile(platformPath)) {
        console.log('Electron binary repaired (path.txt restored)');
        return;
    }

    console.log(`Downloading Electron ${version} for ${platform}-${arch}...`);

    const cacheRoot = process.env.ELECTRON_CACHE
        || process.env.electron_config_cache
        || getDefaultElectronCache();

    const zipPath = await downloadArtifact({
        version,
        artifactName: 'electron',
        platform,
        arch,
        cacheRoot,
        checksums: process.env.electron_use_remote_checksums ? undefined : checksums,
    });

    fs.rmSync(distDir, { recursive: true, force: true });
    await extract(zipPath, { dir: distDir });

    const srcTypeDefPath = path.join(distDir, 'electron.d.ts');
    const targetTypeDefPath = path.join(electronDir, 'electron.d.ts');
    if (fs.existsSync(srcTypeDefPath)) {
        fs.renameSync(srcTypeDefPath, targetTypeDefPath);
    }

    await fs.promises.writeFile(pathTxt, platformPath);
    console.log('Electron binary ready');
}

try {
    await installElectron();
} catch (err) {
    console.error(err?.stack || err);
    try {
        console.error('electron dir:', fs.readdirSync(electronDir));
        if (fs.existsSync(distDir)) {
            console.error('dist dir:', fs.readdirSync(distDir));
        }
    } catch (listErr) {
        console.error(listErr?.message || listErr);
    }
    process.exit(1);
}