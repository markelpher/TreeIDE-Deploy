import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import zip7 from '7zip-min';

const require = createRequire(import.meta.url);
const { path7za } = require('7zip-bin');

let configured = false;

/** @param {string} binaryPath */
function applyAsarUnpack(binaryPath) {
    const isUsingAsar = 'electron' in process.versions
        && process.argv.length > 1
        && process.argv[1].includes('app.asar');
    return isUsingAsar ? binaryPath.replace('app.asar', 'app.asar.unpacked') : binaryPath;
}

/**
 * Resolves the 7za binary path.
 * Includes defensive fallback for Windows on ARM64 (uses x64 binary).
 * 7zip-bin primarily ships win/x64 (and ia32); the fallback covers edge cases.
 * @returns {string}
 */
export function resolve7zaPath() {
    if (process.env.USE_SYSTEM_7ZA === 'true') {
        return '7za';
    }

    const binaryPath = applyAsarUnpack(path7za);

    if (fs.existsSync(binaryPath)) {
        return binaryPath;
    }

    if (process.platform === 'win32' && process.arch === 'arm64') {
        const archDir = path.dirname(binaryPath);
        const fallback = path.join(path.dirname(archDir), 'x64', '7za.exe');
        if (fs.existsSync(fallback)) {
            return fallback;
        }
    }

    return binaryPath;
}

/** Configures 7zip-min with the resolved binary path (idempotent). */
export function ensureZip7Configured() {
    if (configured) { return; }
    zip7.config({ binaryPath: resolve7zaPath() });
    configured = true;
}

ensureZip7Configured();