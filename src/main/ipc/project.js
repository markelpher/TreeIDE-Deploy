/**
 * TreeIDE - Project IPC: load, save, build, export
 */

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ipcMain, dialog, app } from 'electron';
import log from 'electron-log';
import { createExtractorFromData } from 'node-unrar-js';
import zip7 from '../project/zip7Client.js';
import { mainT } from '../../shared/i18n.js';
import {
    isTreeTemplatePath,
    sanitizeTemplateFileName
} from '../../shared/templateFile.js';
import { parseTreeContent } from '../project/treeParser.js';
import { createStructure, inspectBuildOutput } from '../project/treeCreator.js';
import { exportTreeZip } from '../project/zipCreator.js';
import { decryptTreeContent, encryptTreeContent, isEncryptedTreeContent } from '../project/treeCrypto.js';
import {
    extractZipEntries,
    isEncryptedZip,
    readZipEntriesWithAdmZip
} from '../project/zipLoader.js';

const require = createRequire(import.meta.url);

function treeToText(node, indent = 0) {
    const lines = [];
    const prefix = indent === 0 ? '' : '    '.repeat(indent);
    for (const key in node) {
        lines.push(prefix + key);
        const children = node[key];
        if (Object.keys(children).length > 0) {
            lines.push(...treeToText(children, indent + 1));
        }
    }
    return lines;
}

function sanitizeProjectName(name) {
    return String(name || '')
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') // eslint-disable-line no-control-regex
        .replace(/^\.+/, '')
        .slice(0, 200) || 'project';
}

function resolveZipLoadResult(fileEntries, selectedPath, baseName, password) {
    const { treeContent, fileContentsMap } = buildTreeFromEntries(fileEntries);
    const treeFileKey = Object.keys(fileContentsMap).find((f) => /\.tree$/i.test(f));

    if (!treeFileKey) {
        return {
            canceled: false,
            content: treeContent,
            name: baseName,
            fileContents: fileContentsMap,
            filePath: selectedPath
        };
    }

    let treeFileContent = fileContentsMap[treeFileKey];
    if (isEncryptedTreeContent(treeFileContent)) {
        if (!password) {
            return {
                canceled: false,
                needsPassword: true,
                kind: 'tree',
                name: baseName,
                filePath: selectedPath
            };
        }
        try {
            treeFileContent = decryptTreeContent(treeFileContent, password);
        } catch {
            return { canceled: false, wrongPassword: true, kind: 'tree', name: baseName, filePath: selectedPath };
        }
    }

    const fileContents = { ...fileContentsMap };
    delete fileContents[treeFileKey];

    return {
        canceled: false,
        content: treeFileContent,
        name: baseName,
        fileContents,
        filePath: selectedPath,
        treeData: parseTreeContent(treeFileContent)
    };
}

function buildTreeFromEntries(entries) {
    const tree = {};
    const fileContentsMap = {};
    for (const { entryPath: rawEntryPath, content } of entries) {
        const entryPath = String(rawEntryPath || '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');
        const parts = entryPath.split('/').filter(p => p);
        let current = tree;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;
            if (isLast && content !== null) {
                current[part] = {};
                fileContentsMap[entryPath] = content;
            } else {
                if (!current[part + '/']) { current[part + '/'] = {}; }
                current = current[part + '/'];
            }
        }
    }
    const treeContent = treeToText(tree).join('\n');
    return { treeContent, fileContentsMap };
}

const MAX_ENTRY_SIZE = 50 * 1024 * 1024;
const MAX_PROJECT_SIZE = 500 * 1024 * 1024;

async function processLoadPath(selectedPath, lang, lastSaveDirectoryRef, options = {}) {
    const password = options.password || '';
    const stat = fs.statSync(selectedPath);

    if (!stat.isDirectory() && stat.size > MAX_PROJECT_SIZE) {
        return { canceled: false, error: mainT(lang, 'error_file_too_large') };
    }

    if (stat.isDirectory()) {
        const rootName = path.basename(selectedPath);

        function scanDir(dirPath) {
            const result = {};
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            entries.sort((a, b) => {
                if (a.isDirectory() && !b.isDirectory()) { return -1; }
                if (!a.isDirectory() && b.isDirectory()) { return 1; }
                return a.name.localeCompare(b.name);
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    result[entry.name + '/'] = scanDir(path.join(dirPath, entry.name));
                } else {
                    result[entry.name] = {};
                }
            }
            return result;
        }

        const tree = {};
        tree[rootName + '/'] = scanDir(selectedPath);
        const content = treeToText(tree).join('\n');
        return { canceled: false, content, name: rootName };
    }

    const ext = path.extname(selectedPath).toLowerCase();
    const baseName = path.basename(selectedPath, ext);

    if (isTreeTemplatePath(selectedPath)) {
        return { canceled: false, error: mainT(lang, 'error_template_use_templates') };
    }

    if (ext === '.tree') {
        const rawContent = fs.readFileSync(selectedPath, 'utf-8');
        let content = rawContent;
        if (isEncryptedTreeContent(rawContent)) {
            if (!password) {
                return {
                    canceled: false,
                    needsPassword: true,
                    kind: 'tree',
                    name: baseName,
                    filePath: selectedPath
                };
            }
            try {
                content = decryptTreeContent(rawContent, password);
            } catch {
                return { canceled: false, wrongPassword: true, kind: 'tree', name: baseName, filePath: selectedPath };
            }
        }
        const treeData = parseTreeContent(content);
        lastSaveDirectoryRef.value = path.dirname(selectedPath);
        return { canceled: false, treeData, content, filePath: selectedPath, name: baseName };
    }

    if (selectedPath.endsWith('.tar.gz') || selectedPath.endsWith('.tgz') || ext === '.gz' || ext === '.tgz' || ext === '.tar') {
        const archiveData = fs.readFileSync(selectedPath);
        const tarData = ext === '.tar' ? archiveData : zlib.gunzipSync(archiveData);

        const fileEntries = [];
        let offset = 0;
        const BLOCK_SIZE = 512;

        while (offset < tarData.length - BLOCK_SIZE) {
            const isEnd = tarData.slice(offset, offset + BLOCK_SIZE).every(b => b === 0);
            if (isEnd) { break; }

            let nameRaw = tarData.toString('utf8', offset, offset + 100).replace(/\0/g, '');
            const prefixRaw = tarData.toString('utf8', offset + 345, offset + 500).replace(/\0/g, '').trim();
            const sizeOctal = tarData.toString('utf8', offset + 124, offset + 136).trim();
            const typeFlag = tarData[offset + 156];

            if (!nameRaw) { offset += BLOCK_SIZE; continue; }
            if (prefixRaw) { nameRaw = prefixRaw + '/' + nameRaw; }
            nameRaw = nameRaw.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');

            const size = parseInt(sizeOctal, 8) || 0;
            if (size > MAX_ENTRY_SIZE) {
                offset += BLOCK_SIZE + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
                continue;
            }
            const isDirectory = typeFlag === 53 || nameRaw.endsWith('/');

            if (!isDirectory) {
                let content = '';
                if (size > 0) {
                    const contentStart = offset + BLOCK_SIZE;
                    const contentEnd = contentStart + size;
                    if (contentEnd <= tarData.length) {
                        content = tarData.toString('utf8', contentStart, contentEnd);
                    }
                }
                fileEntries.push({ entryPath: nameRaw, content });
            }

            offset += BLOCK_SIZE + Math.ceil(size / BLOCK_SIZE) * BLOCK_SIZE;
        }

        const { treeContent, fileContentsMap } = buildTreeFromEntries(fileEntries);
        return { canceled: false, content: treeContent, name: baseName, fileContents: fileContentsMap };
    }

    if (ext === '.zip') {
        const encrypted = await isEncryptedZip(selectedPath);
        if (encrypted && !password) {
            return {
                canceled: false,
                needsPassword: true,
                kind: 'both',
                name: baseName,
                filePath: selectedPath
            };
        }

        let fileEntries = [];
        try {
            if (encrypted) {
                fileEntries = await extractZipEntries(selectedPath, password);
            } else {
                fileEntries = readZipEntriesWithAdmZip(selectedPath);
            }
        } catch (err) {
            log.warn('ZIP extraction failed:', err);
            if (encrypted) {
                return { canceled: false, wrongPassword: true, kind: 'zip', name: baseName, filePath: selectedPath };
            }
            return { canceled: false, error: err.message };
        }

        return resolveZipLoadResult(fileEntries, selectedPath, baseName, password);
    }

    if (ext === '.rar') {
        const rarData = fs.readFileSync(selectedPath);
        const wasmPath = path.join(path.dirname(require.resolve('node-unrar-js')), 'js', 'unrar.wasm');
        const wasmBinary = fs.readFileSync(wasmPath);
        const extractor = await createExtractorFromData({ wasmBinary, data: rarData });
        const extracted = extractor.extract();
        const entries = [];
        for (const file of extracted.files) {
            if (!file.fileHeader.flags.directory) {
                const extraction = file.extraction || new Uint8Array(0);
                if (extraction.length > MAX_ENTRY_SIZE) { continue; }
                const name = String(file.fileHeader.name || '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');
                entries.push({ entryPath: name, content: Buffer.from(extraction).toString('utf8') });
            }
        }
        const { treeContent, fileContentsMap } = buildTreeFromEntries(entries);
        return { canceled: false, content: treeContent, name: baseName, fileContents: fileContentsMap };
    }

    if (ext === '.7z') {
        const entries = await new Promise((resolve, reject) => {
            zip7.list(selectedPath, (err, result) => {
                if (err) { return reject(err); }
                resolve(result.filter(e => !e.attr?.includes('D')));
            });
        });
        const tmpDir = path.join(app.getPath('temp'), 'treeide-7z-' + Date.now());
        fs.mkdirSync(tmpDir, { recursive: true });
        try {
            await new Promise((resolve, reject) => {
                zip7.extract(selectedPath, tmpDir, err => {
                    if (err) { return reject(err); }
                    resolve();
                });
            });
            const fileEntries = [];
            for (const entry of entries) {
                const filePath = path.join(tmpDir, entry.name);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                    const entryStat = fs.statSync(filePath);
                    if (entryStat.size > MAX_ENTRY_SIZE) { continue; }
                    const name = String(entry.name || '').replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/+/, '');
                    fileEntries.push({ entryPath: name, content: fs.readFileSync(filePath, 'utf8') });
                }
            }
            const { treeContent, fileContentsMap } = buildTreeFromEntries(fileEntries);
            return { canceled: false, content: treeContent, name: baseName, fileContents: fileContentsMap };
        } catch (err) {
            log.error('7z extraction failed:', err);
            throw err;
        } finally {
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                log.warn('Failed to cleanup 7z temp directory:', cleanupErr);
            }
        }
    }

    return { canceled: false, error: `Unsupported file type: ${ext}` };
}

function registerLoadHandlers(lastSaveDirectoryRef) {
    ipcMain.handle('load-unified', async (event, lang) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [
                { name: mainT(lang, 'load_dialog_title'), extensions: ['tree', 'zip', 'tar.gz', 'tgz', 'rar', '7z'] },
                { name: mainT(lang, 'load_dialog_tree'), extensions: ['tree'] },
                { name: mainT(lang, 'load_dialog_archives'), extensions: ['zip', 'tar.gz', 'tgz', 'rar', '7z'] }
            ],
            properties: ['openFile']
        });

        if (canceled || !filePaths[0]) { return { canceled: true }; }

        try {
            return await processLoadPath(filePaths[0], lang, lastSaveDirectoryRef, {});
        } catch (err) {
            return { canceled: false, error: err.message };
        }
    });

    ipcMain.handle('load-dropped-file', async (event, filePath, lang = 'en', options = {}) => {
        if (isTreeTemplatePath(filePath)) {
            return { error: mainT(lang, 'error_template_use_templates') };
        }

        const archiveExtensions = ['.zip', '.tar', '.gz', '.tgz', '.rar', '.7z', '.bz2', '.xz', '.tbz2', '.txz', '.zst', '.cab', '.iso', '.dmg', '.lz', '.lzma', '.z'];
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.tree' || !archiveExtensions.includes(ext)) {
            if (ext !== '.tree') {
                return { error: mainT(lang, 'error_unsupported_file_type').replace('{ext}', ext) };
            }
        }
        try {
            return await processLoadPath(filePath, lang, lastSaveDirectoryRef, options);
        } catch (err) {
            log.error('Error loading dropped file:', err);
            return { error: err.message };
        }
    });
}

function isPathInsideDir(filePath, dirPath) {
    const resolved = path.resolve(filePath);
    const resolvedDir = path.resolve(dirPath);
    return resolved.startsWith(resolvedDir + path.sep) || resolved === resolvedDir;
}

function registerSaveHandlers(lastSaveDirectoryRef) {
    ipcMain.handle('save-tree', async (event, filePath, content, lang = 'en') => {
        if (typeof filePath !== 'string' || !filePath) {
            throw new Error(mainT(lang, 'error_invalid_file_path'));
        }
        if (typeof content !== 'string') {
            throw new Error(mainT(lang, 'error_invalid_content'));
        }
        if (Buffer.byteLength(content, 'utf8') > MAX_ENTRY_SIZE) {
            throw new Error(mainT(lang, 'error_file_content_too_large'));
        }
        const resolved = path.resolve(filePath);
        if (lastSaveDirectoryRef.value && !isPathInsideDir(resolved, lastSaveDirectoryRef.value)) {
            throw new Error(mainT(lang, 'error_path_outside_allowed'));
        }
        fs.writeFileSync(resolved, content, 'utf-8');
        lastSaveDirectoryRef.value = path.dirname(resolved);
        return true;
    });

    ipcMain.handle('save-tree-as', async (event, content, defaultName = 'project', lang = 'en', options = {}) => {
        if (typeof content !== 'string') {
            return { canceled: false, error: mainT(lang, 'error_invalid_content') };
        }
        const encryptPassword = options.encryptPassword || '';
        const finalContent = encryptPassword ? encryptTreeContent(content, encryptPassword) : content;
        if (Buffer.byteLength(finalContent, 'utf8') > MAX_ENTRY_SIZE) {
            return { canceled: false, error: mainT(lang, 'error_file_content_too_large') };
        }
        const safeName = String(defaultName)
            .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') // eslint-disable-line no-control-regex
            .replace(/^\.+/, '')
            .slice(0, 200) || 'project';

        const outputDirectory = options.outputDirectory || '';
        const conflictMode = options.conflictMode === 'overwrite' ? 'overwrite' : 'skip';
        let filePath = '';

        if (outputDirectory) {
            filePath = path.join(outputDirectory, `${safeName}.tree`);
            if (fs.existsSync(filePath) && conflictMode !== 'overwrite') {
                return { canceled: false, skipped: true, filePath };
            }
        } else {
            const dialogResult = await dialog.showSaveDialog({
                title: mainT(lang, 'save_tree_title'),
                defaultPath: `${safeName}.tree`,
                filters: [{ name: mainT(lang, 'save_tree_filter'), extensions: ['tree'] }]
            });
            if (dialogResult.canceled || !dialogResult.filePath) { return { canceled: true }; }
            filePath = dialogResult.filePath;
        }

        try {
            fs.writeFileSync(filePath, finalContent, 'utf-8');
        } catch (err) {
            return { canceled: false, error: err.message };
        }
        lastSaveDirectoryRef.value = path.dirname(filePath);
        return { canceled: false, filePath, encrypted: Boolean(encryptPassword) };
    });
}

function registerStructureHandlers() {
    ipcMain.handle('select-build-folder', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (canceled || !filePaths[0]) { return { canceled: true }; }
        return { canceled: false, path: filePaths[0] };
    });

    ipcMain.handle('inspect-structure', async (event, treeData, targetPath = '', options = {}) => {
        if (!targetPath) { return { canceled: true }; }
        try {
            return {
                canceled: false,
                ...inspectBuildOutput(treeData, targetPath, {
                    projectName: options.projectName || 'project',
                    checkStructure: options.checkStructure !== false,
                    checkTree: Boolean(options.checkTree),
                    checkZip: Boolean(options.checkZip)
                })
            };
        } catch (err) {
            return { canceled: false, error: err.message };
        }
    });

    ipcMain.handle('create-structure', async (event, treeData, targetPath = '', options = {}) => {
        let selectedPath = targetPath;
        if (!selectedPath) {
            const { canceled, filePaths } = await dialog.showOpenDialog({
                properties: ['openDirectory']
            });
            if (!canceled) { selectedPath = filePaths[0]; }
        }
        if (!selectedPath) { return { canceled: true }; }
        try {
            const summary = createStructure(treeData, selectedPath, options);
            return { canceled: false, path: selectedPath, summary };
        } catch (err) {
            return { canceled: false, error: err.message };
        }
    });

    ipcMain.handle('export-zip', async (event, treeData, defaultName = 'project', options = {}, lang = 'en') => {
        const safeName = sanitizeProjectName(defaultName);
        const outputDirectory = options.outputDirectory || '';
        const conflictMode = options.conflictMode === 'overwrite' ? 'overwrite' : 'skip';
        let filePath = '';

        if (outputDirectory) {
            filePath = path.join(outputDirectory, `${safeName}.zip`);
            if (fs.existsSync(filePath) && conflictMode !== 'overwrite') {
                return { canceled: false, skipped: true, filePath };
            }
        } else {
            const dialogResult = await dialog.showSaveDialog({
                title: mainT(lang, 'export_zip_title'),
                defaultPath: `${safeName}.zip`,
                filters: [{ name: mainT(lang, 'export_zip_filter'), extensions: ['zip'] }]
            });
            if (dialogResult.canceled || !dialogResult.filePath) { return { canceled: true }; }
            filePath = dialogResult.filePath;
        }

        try {
            const fileContents = options.fileContents || {};
            let totalSize = 0;
            for (const content of Object.values(fileContents)) {
                totalSize += Buffer.byteLength(content, 'utf8');
            }
            const exportOptions = { ...options };
            if (exportOptions.includeTreeContent && exportOptions.encryptTreePassword) {
                exportOptions.includeTreeContent = encryptTreeContent(
                    exportOptions.includeTreeContent,
                    exportOptions.encryptTreePassword
                );
                delete exportOptions.encryptTreePassword;
            }
            if (exportOptions.includeTreeContent) {
                totalSize += Buffer.byteLength(exportOptions.includeTreeContent, 'utf8');
            }
            if (totalSize > MAX_PROJECT_SIZE) {
                return { canceled: false, error: mainT(lang, 'error_zip_content_too_large') };
            }
            const result = await exportTreeZip(treeData, filePath, exportOptions);
            return { canceled: false, ...result };
        } catch (err) {
            return { canceled: false, error: err.message };
        }
    });
}

function registerTemplateFileHandlers(lastSaveDirectoryRef) {
    ipcMain.handle('save-template-as', async (event, content, defaultName = 'template', lang = 'en') => {
        if (typeof content !== 'string') {
            return { canceled: false, error: mainT(lang, 'error_invalid_content') };
        }
        if (Buffer.byteLength(content, 'utf8') > MAX_ENTRY_SIZE) {
            return { canceled: false, error: mainT(lang, 'error_file_content_too_large') };
        }

        const safeName = sanitizeTemplateFileName(defaultName);
        const dialogResult = await dialog.showSaveDialog({
            title: mainT(lang, 'save_template_title'),
            defaultPath: `${safeName}.tree-template`,
            filters: [{ name: mainT(lang, 'save_template_filter'), extensions: ['tree-template'] }]
        });
        if (dialogResult.canceled || !dialogResult.filePath) { return { canceled: true }; }

        try {
            fs.writeFileSync(dialogResult.filePath, content, 'utf-8');
        } catch (err) {
            return { canceled: false, error: err.message };
        }
        lastSaveDirectoryRef.value = path.dirname(dialogResult.filePath);
        return { canceled: false, filePath: dialogResult.filePath };
    });

    ipcMain.handle('load-template-file', async (event, lang = 'en') => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            title: mainT(lang, 'load_template_title'),
            filters: [{ name: mainT(lang, 'load_template_filter'), extensions: ['tree-template'] }],
            properties: ['openFile']
        });
        if (canceled || !filePaths[0]) { return { canceled: true }; }

        try {
            const content = fs.readFileSync(filePaths[0], 'utf-8');
            if (Buffer.byteLength(content, 'utf8') > MAX_ENTRY_SIZE) {
                return { canceled: false, error: mainT(lang, 'error_file_content_too_large') };
            }
            lastSaveDirectoryRef.value = path.dirname(filePaths[0]);
            return { canceled: false, content, filePath: filePaths[0] };
        } catch (err) {
            return { canceled: false, error: err.message };
        }
    });

    ipcMain.handle('read-template-file-at-path', async (event, filePath, lang = 'en') => {
        if (typeof filePath !== 'string' || !filePath.trim()) {
            return { error: mainT(lang, 'error_invalid_file_path') };
        }
        if (!filePath.toLowerCase().endsWith('.tree-template')) {
            const ext = path.extname(filePath) || path.basename(filePath);
            return { error: mainT(lang, 'error_unsupported_file_type').replace('{ext}', ext) };
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            if (Buffer.byteLength(content, 'utf8') > MAX_ENTRY_SIZE) {
                return { error: mainT(lang, 'error_file_content_too_large') };
            }
            lastSaveDirectoryRef.value = path.dirname(filePath);
            return { content, filePath };
        } catch (err) {
            return { error: err.message };
        }
    });
}

export function registerProjectIpc(lastSaveDirectoryRef) {
    registerLoadHandlers(lastSaveDirectoryRef);
    registerSaveHandlers(lastSaveDirectoryRef);
    registerStructureHandlers();
    registerTemplateFileHandlers(lastSaveDirectoryRef);
}

export { processLoadPath };