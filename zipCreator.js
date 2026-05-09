const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { getContentForPath, resolveTreePath, walkTree } = require('./treeCreator');

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
});

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function dateToDosTime(date = new Date()) {
    const year = Math.max(date.getFullYear(), 1980);
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
    return { dosTime, dosDate };
}

function normalizeZipName(name) {
    return name.replace(/\\/g, '/').replace(/^\/+/, '');
}

function collectZipEntries(tree, options = {}) {
    const entries = [];
    const virtualBase = process.cwd();
    const fileContents = options.fileContents || {};

    walkTree(tree, virtualBase, ({ key, fullPath, isFolder }) => {
        const relativePath = normalizeZipName(path.relative(virtualBase, fullPath));
        if (isFolder) {
            entries.push({ name: `${relativePath}/`, content: Buffer.alloc(0), isFolder: true });
        } else {
            entries.push({
                name: relativePath,
                content: Buffer.from(getContentForPath(fileContents, relativePath), 'utf8'),
                isFolder: false
            });
        }
    });

    return entries;
}

function buildZipBuffer(entries) {
    const fileRecords = [];
    const centralRecords = [];
    let offset = 0;
    const { dosTime, dosDate } = dateToDosTime();

    for (const entry of entries) {
        const nameBuffer = Buffer.from(entry.name, 'utf8');
        const compressed = entry.isFolder ? Buffer.alloc(0) : zlib.deflateRawSync(entry.content);
        const checksum = crc32(entry.content);

        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0x0800, 6);
        localHeader.writeUInt16LE(entry.isFolder ? 0 : 8, 8);
        localHeader.writeUInt16LE(dosTime, 10);
        localHeader.writeUInt16LE(dosDate, 12);
        localHeader.writeUInt32LE(checksum, 14);
        localHeader.writeUInt32LE(compressed.length, 18);
        localHeader.writeUInt32LE(entry.content.length, 22);
        localHeader.writeUInt16LE(nameBuffer.length, 26);
        localHeader.writeUInt16LE(0, 28);

        fileRecords.push(localHeader, nameBuffer, compressed);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0x0800, 8);
        centralHeader.writeUInt16LE(entry.isFolder ? 0 : 8, 10);
        centralHeader.writeUInt16LE(dosTime, 12);
        centralHeader.writeUInt16LE(dosDate, 14);
        centralHeader.writeUInt32LE(checksum, 16);
        centralHeader.writeUInt32LE(compressed.length, 20);
        centralHeader.writeUInt32LE(entry.content.length, 24);
        centralHeader.writeUInt16LE(nameBuffer.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(entry.isFolder ? 0x10 : 0, 38);
        centralHeader.writeUInt32LE(offset, 42);

        centralRecords.push(centralHeader, nameBuffer);
        offset += localHeader.length + nameBuffer.length + compressed.length;
    }

    const centralDirectory = Buffer.concat(centralRecords);
    const endRecord = Buffer.alloc(22);
    endRecord.writeUInt32LE(0x06054b50, 0);
    endRecord.writeUInt16LE(0, 4);
    endRecord.writeUInt16LE(0, 6);
    endRecord.writeUInt16LE(entries.length, 8);
    endRecord.writeUInt16LE(entries.length, 10);
    endRecord.writeUInt32LE(centralDirectory.length, 12);
    endRecord.writeUInt32LE(offset, 16);
    endRecord.writeUInt16LE(0, 20);

    return Buffer.concat([...fileRecords, centralDirectory, endRecord]);
}

function exportTreeZip(tree, zipPath, options = {}) {
    const resolvedZipPath = path.resolve(zipPath);
    resolveTreePath(path.dirname(resolvedZipPath), path.basename(resolvedZipPath));
    const entries = collectZipEntries(tree, options);
    fs.writeFileSync(resolvedZipPath, buildZipBuffer(entries));
    return { entries: entries.length, path: resolvedZipPath };
}

module.exports = { collectZipEntries, buildZipBuffer, exportTreeZip };
