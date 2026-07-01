import fs from 'node:fs';
import os from 'node:os';
import path from 'path';
import {
    resolveTreePath,
    walkTree,
    getDefaultFileContent,
    getContentForPath,
    normalizeTreeKey,
    inspectBuildOutput
} from '../src/main/project/treeCreator.js';

const p = (p) => path.resolve(p);

describe('resolveTreePath', () => {
    it('resolves a simple key', () => {
        const result = resolveTreePath(p('/base'), 'file.js');
        expect(result).toBe(path.resolve(p('/base'), 'file.js'));
    });

    it('rejects path traversal', () => {
        // May be caught as invalid name (due to separators) or escape
        expect(() => resolveTreePath(p('/base'), '../etc/passwd')).toThrow();
    });

    it('rejects null byte', () => {
        expect(() => resolveTreePath(p('/base'), 'bad\0file')).toThrow('Invalid');
    });

    it('rejects dot as name', () => {
        expect(() => resolveTreePath(p('/base'), '.')).toThrow('Invalid');
    });

    it('rejects embedded separators in name', () => {
        expect(() => resolveTreePath(p('/base'), 'bad/name')).toThrow('Invalid');
        expect(() => resolveTreePath(p('/base'), 'bad\\name')).toThrow('Invalid');
    });
});

describe('normalizeTreeKey', () => {
    it('trims trailing slashes', () => {
        expect(normalizeTreeKey('src/')).toBe('src');
    });

    it('trims whitespace', () => {
        expect(normalizeTreeKey('  file.js  ')).toBe('file.js');
    });

    it('handles backslashes', () => {
        expect(normalizeTreeKey('folder\\')).toBe('folder');
    });
});

describe('getDefaultFileContent', () => {
    it('returns empty string', () => {
        expect(getDefaultFileContent()).toBe('');
    });
});

describe('getContentForPath', () => {
    it('returns content for matching path', () => {
        const contents = { 'src/file.js': 'console.log' };
        expect(getContentForPath(contents, 'src/file.js')).toBe('console.log');
    });

    it('returns empty string for missing path', () => {
        expect(getContentForPath({}, 'missing.js')).toBe('');
    });

    it('handles undefined fileContents', () => {
        expect(getContentForPath(undefined, 'file.js')).toBe('');
    });

    it('normalizes backslashes', () => {
        const contents = { 'src/file.js': 'content' };
        expect(getContentForPath(contents, 'src\\file.js')).toBe('content');
    });
});

describe('inspectBuildOutput', () => {
    it('detects existing structure files, tree and zip in the output folder', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'treeide-inspect-'));
        const tree = { 'src/': { 'index.js': {} } };
        fs.mkdirSync(path.join(dir, 'src'), { recursive: true });
        fs.writeFileSync(path.join(dir, 'src', 'index.js'), 'console.log(1)');
        fs.writeFileSync(path.join(dir, 'demo.tree'), 'src/\n    index.js');
        fs.writeFileSync(path.join(dir, 'demo.zip'), 'zip');

        try {
            const result = inspectBuildOutput(tree, dir, {
                projectName: 'demo',
                checkStructure: true,
                checkTree: true,
                checkZip: true
            });
            expect(result.existingFiles).toHaveLength(1);
            expect(result.existingTree?.name).toBe('demo.tree');
            expect(result.existingZip?.name).toBe('demo.zip');
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});

describe('walkTree', () => {
    it('visits all nodes in order', () => {
        const tree = { 'src/': { 'index.js': {} } };
        const visited = [];
        const base = p('/base');
        walkTree(tree, base, (info) => {
            visited.push({ key: info.key, isFolder: info.isFolder });
        });
        expect(visited).toHaveLength(2);
        expect(visited[0]).toEqual({ key: 'src/', isFolder: true });
        expect(visited[1]).toEqual({ key: 'index.js', isFolder: false });
    });

    it('visits nested structure', () => {
        const tree = { 'a/': { 'b/': { 'c.txt': {} } } };
        const visited = [];
        walkTree(tree, p('/base'), (info) => visited.push(info.key));
        expect(visited).toEqual(['a/', 'b/', 'c.txt']);
    });
});
