import fs from 'node:fs';
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

    return binaryPath;
}

/** Configures 7zip-min with the resolved binary path (idempotent). */
export function ensureZip7Configured() {
    if (configured) { return; }
    zip7.config({ binaryPath: resolve7zaPath() });
    configured = true;
}

ensureZip7Configured();
