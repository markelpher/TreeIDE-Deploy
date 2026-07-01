import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { app } from 'electron';
import zip7 from './zip7Client.js';

const require = createRequire(import.meta.url);

/**
 * @param {string} zipPath
 * @returns {Promise<boolean>}
 */
export async function isEncryptedZip(zipPath) {
    try {
        const items = await zip7.list(zipPath);
        return items.some((item) => item.encrypted === '+' || item.encrypted === 'E');
    } catch {
        try {
            const AdmZip = require('adm-zip');
            const zip = new AdmZip(zipPath);
            return zip.getEntries().some((entry) => {
                if (entry.isDirectory) { return false; }
                const flags = entry.header?.flags ?? 0;
                return (flags & 0x1) === 1;
            });
        } catch {
            return false;
        }
    }
}

/**
 * @param {string} dirPath
 * @param {string} [basePath]
 * @returns {Array<{ entryPath: string, content: string }>}
 */
export function collectFilesFromDirectory(dirPath, basePath = dirPath) {
    const entries = [];
    const dirEntries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of dirEntries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            entries.push(...collectFilesFromDirectory(fullPath, basePath));
        } else if (entry.isFile()) {
            const stat = fs.statSync(fullPath);
            if (stat.size > 50 * 1024 * 1024) { continue; }
            const entryPath = path.relative(basePath, fullPath).replace(/\\/g, '/');
            entries.push({
                entryPath,
                content: fs.readFileSync(fullPath, 'utf8')
            });
        }
    }
    return entries;
}

/**
 * @param {string} zipPath
 * @param {string} [password]
 * @returns {Promise<Array<{ entryPath: string, content: string }>>}
 */
export async function extractZipEntries(zipPath, password = '') {
    const tmpDir = path.join(app.getPath('temp'), `treeide-load-${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
    try {
        const args = ['x', path.resolve(zipPath), `-o${tmpDir}`, '-y'];
        if (password) {
            args.splice(2, 0, `-p${password}`);
        }
        await zip7.cmd(args);
        return collectFilesFromDirectory(tmpDir);
    } finally {
        try {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch {
            // ignore cleanup errors
        }
    }
}

/**
 * @param {string} zipPath
 * @returns {Array<{ entryPath: string, content: string }>}
 */
export function readZipEntriesWithAdmZip(zipPath) {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipPath);
    const fileEntries = [];
    zip.getEntries().forEach((entry) => {
        if (entry.entryName.startsWith('__MACOSX/') || entry.entryName.includes('.DS_Store')) { return; }
        if (entry.header?.size > 50 * 1024 * 1024) { return; }
        if (!entry.isDirectory) {
            const name = String(entry.entryName || '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');
            fileEntries.push({ entryPath: name, content: entry.getData().toString('utf8') });
        }
    });
    return fileEntries;
}