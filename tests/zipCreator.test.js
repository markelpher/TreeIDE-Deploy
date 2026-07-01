import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { collectZipEntries, buildZipBuffer, buildZipEntries, exportTreeZip, zipPasswordArg } from '../src/main/project/zipCreator.js';
import { resolve7zaPath } from '../src/main/project/zip7Config.js';

describe('resolve7zaPath', () => {
    it('resolves an existing 7za binary on this platform', () => {
        const binaryPath = resolve7zaPath();
        if (process.env.USE_SYSTEM_7ZA === 'true') {
            expect(binaryPath).toBe('7za');
            return;
        }
        expect(fs.existsSync(binaryPath)).toBe(true);
    });
});

describe('collectZipEntries', () => {
    it('collects files and folders', () => {
        const tree = { 'src/': { 'index.js': {} }, 'README.md': {} };
        const entries = collectZipEntries(tree);
        expect(entries).toHaveLength(3);
        const folderEntry = entries.find(e => e.isFolder);
        expect(folderEntry.name).toMatch(/src\/$/);
        const fileEntries = entries.filter(e => !e.isFolder);
        expect(fileEntries).toHaveLength(2);
    });

    it('includes file content when provided', () => {
        const tree = { 'file.txt': {} };
        const entries = collectZipEntries(tree, { fileContents: { 'file.txt': 'hello' } });
        const entry = entries.find(e => !e.isFolder);
        expect(entry.content.toString()).toBe('hello');
    });

    it('uses empty content for files without content', () => {
        const tree = { 'empty.txt': {} };
        const entries = collectZipEntries(tree);
        const entry = entries.find(e => !e.isFolder);
        expect(entry.content.toString()).toBe('');
    });
});

describe('buildZipEntries', () => {
    it('adds tree file entry when requested', () => {
        const tree = { 'file.txt': {} };
        const entries = buildZipEntries(tree, {
            includeTreeContent: 'src/\n    file.txt',
            treeFileName: 'project.tree'
        });
        const treeEntry = entries.find((entry) => entry.name === 'project.tree');
        expect(treeEntry).toBeTruthy();
        expect(treeEntry.content.toString()).toBe('src/\n    file.txt');
    });
});

describe('zipPasswordArg', () => {
    it('quotes passwords with spaces', () => {
        expect(zipPasswordArg('hello world')).toBe('-p"hello world"');
    });

    it('returns null for empty password', () => {
        expect(zipPasswordArg('')).toBeNull();
    });
});

describe('exportTreeZip', () => {
    it('writes encrypted zip archives when 7zip is available', async () => {
        const tree = { 'src/': { 'index.js': {} } };
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'treeide-test-zip-'));
        const zipPath = path.join(dir, 'encrypted.zip');
        try {
            const result = await exportTreeZip(tree, zipPath, {
                fileContents: { 'src/index.js': 'hello' },
                password: 'secret123'
            });
            expect(result.entries).toBeGreaterThan(0);
            expect(fs.statSync(zipPath).size).toBeGreaterThan(0);
        } catch (err) {
            if (String(err.message).includes('7-zip')) {
                return;
            }
            throw err;
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('buildZipBuffer', () => {
    it('produces a valid ZIP buffer', () => {
        const entries = [
            { name: 'file.txt', content: Buffer.from('hello'), isFolder: false }
        ];
        const buffer = buildZipBuffer(entries);
        expect(Buffer.isBuffer(buffer)).toBe(true);
        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer.toString('utf8', 0, 4)).toBe('PK\u0003\u0004');
    });

    it('includes end-of-central-directory record', () => {
        const entries = [
            { name: 'a.txt', content: Buffer.from('a'), isFolder: false }
        ];
        const buffer = buildZipBuffer(entries);
        const eocd = buffer.slice(-22);
        expect(eocd.toString('utf8', 0, 4)).toBe('PK\u0005\u0006');
    });

    it('handles multiple entries', () => {
        const entries = [
            { name: 'a.txt', content: Buffer.from('aaa'), isFolder: false },
            { name: 'b.txt', content: Buffer.from('bbb'), isFolder: false },
            { name: 'dir/', content: Buffer.alloc(0), isFolder: true }
        ];
        const buffer = buildZipBuffer(entries);
        const eocdOffset = buffer.length - 22;
        const numEntries = buffer.readUInt16LE(eocdOffset + 8);
        expect(numEntries).toBe(3);
    });
});
