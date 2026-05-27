const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseTreeContent } = require('../src/main/treeParser');
const { createStructure, inspectStructure, resolveTreePath } = require('../src/main/treeCreator');
const { collectZipEntries, buildZipBuffer } = require('../src/main/zipCreator');

function makeTempDir() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'treeide-'));
}

const tree = parseTreeContent(`root/
    src/
        main.js
    README
`);

assert(tree['root/']['src/']['main.js']);
assert(tree['root/']['README']);

assert.throws(() => resolveTreePath(process.cwd(), '../escape.txt'));

const tempDir = makeTempDir();
const summary = createStructure(tree, tempDir, {
    conflictMode: 'skip',
    fileContents: { 'root/src/main.js': 'print("hello")\n' }
});
assert.strictEqual(summary.filesCreated, 2);
assert.strictEqual(fs.readFileSync(path.join(tempDir, 'root', 'src', 'main.js'), 'utf8'), 'print("hello")\n');

const inspection = inspectStructure(tree, tempDir);
assert.strictEqual(inspection.files, 2);
assert.strictEqual(inspection.folders, 2);
assert.strictEqual(inspection.existingFiles.length, 2);

const skipped = createStructure(tree, tempDir, { conflictMode: 'skip' });
assert.strictEqual(skipped.filesSkipped, 2);
assert.strictEqual(fs.readFileSync(path.join(tempDir, 'root', 'src', 'main.js'), 'utf8'), 'print("hello")\n');

fs.writeFileSync(path.join(tempDir, 'root', 'src', 'main.js'), 'existing');
const overwritten = createStructure(tree, tempDir, {
    conflictMode: 'overwrite',
    fileContents: { 'root/src/main.js': 'updated\n' }
});
assert.strictEqual(overwritten.filesOverwritten, 2);
assert.strictEqual(fs.readFileSync(path.join(tempDir, 'root', 'src', 'main.js'), 'utf8'), 'updated\n');

const entries = collectZipEntries(tree, { fileContents: { 'root/src/main.js': 'zip content\n' } });
assert(entries.some(entry => entry.name === 'root/src/main.js'));
assert(buildZipBuffer(entries).length > 22);

console.log('tree core tests passed');
