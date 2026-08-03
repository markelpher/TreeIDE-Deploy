import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildZipBuffer, buildZipEntries } from '../src/main/project/zipCreator.js';
import { encryptTreeContent } from '../src/main/project/treeCrypto.js';
import { processLoadPath } from '../src/main/ipc/project.js';

const lastSaveDirectoryRef = { value: null };

describe('ZIP load with embedded .tree', () => {
    it('keeps file contents and uses .tree as structure source', async () => {
        const tree = { 'src/': { 'index.js': {} } };
        const treeContent = 'src/\n    index.js';
        const entries = buildZipEntries(tree, {
            includeTreeContent: treeContent,
            treeFileName: 'project.tree',
            fileContents: { 'src/index.js': 'console.log(1)' }
        });
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'treeide-zip-load-'));
        const zipPath = path.join(dir, 'bundle.zip');
        fs.writeFileSync(zipPath, buildZipBuffer(entries));

        try {
            const result = await processLoadPath(zipPath, 'en', lastSaveDirectoryRef, {});
            expect(result.content).toBe(treeContent);
            expect(result.fileContents['src/index.js']).toBe('console.log(1)');
            expect(Object.keys(result.fileContents)).not.toContain('project.tree');

        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });

    it('prompts for password when embedded .tree is encrypted', async () => {
        const tree = { 'README.md': {} };
        const encryptedTree = await encryptTreeContent('README.md', 'secret');
        const entries = buildZipEntries(tree, {
            includeTreeContent: encryptedTree,
            treeFileName: 'project.tree',
            fileContents: { 'README.md': '# Hi' }
        });
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'treeide-zip-enc-'));
        const zipPath = path.join(dir, 'secure.zip');
        fs.writeFileSync(zipPath, buildZipBuffer(entries));

        try {
            const needsPassword = await processLoadPath(zipPath, 'en', lastSaveDirectoryRef, {});
            expect(needsPassword.needsPassword).toBe(true);
            expect(needsPassword.kind).toBe('tree');

            const loaded = await processLoadPath(zipPath, 'en', lastSaveDirectoryRef, { password: 'secret' });
            expect(loaded.content).toBe('README.md');
            expect(loaded.fileContents['README.md']).toBe('# Hi');
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});