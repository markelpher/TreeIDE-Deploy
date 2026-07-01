/**
 * @file TreeIDE - Main process tree structure creator
 */

import fs from 'node:fs';
import path from 'node:path';

/** @type {{ conflictMode: string }} */
const DEFAULT_OPTIONS = {
    conflictMode: 'skip'
};

/**
 * @param {string} parentPath
 * @param {string} childPath
 * @returns {boolean}
 */
function isPathInside(parentPath, childPath) {
    const relative = path.relative(parentPath, childPath);
    return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

/**
 * @param {string} basePath
 * @param {string} key
 * @returns {string}
 * @throws {Error}
 */
export function resolveTreePath(basePath, key) {
    const cleanKey = key.trim().replace(/[\\/]+$/, '');

    if (!cleanKey || cleanKey === '.' || cleanKey === '..' || cleanKey.includes('\0') || /[\\/]/.test(cleanKey)) {
        throw new Error(`Invalid tree item name: "${key}"`);
    }

    const resolvedBase = path.resolve(basePath);
    const resolvedPath = path.resolve(resolvedBase, cleanKey);

    if (!isPathInside(resolvedBase, resolvedPath)) {
        throw new Error(`Tree item escapes the target folder: "${key}"`);
    }

    return resolvedPath;
}

/** @returns {string} */
export function getDefaultFileContent() {
    return '';
}

/** @param {string} key @returns {string} */
export function normalizeTreeKey(key) {
    return key.trim().replace(/[\\/]+$/, '');
}

/** @param {Object<string, string>} fileContents @param {string} relativePath @returns {string} */
export function getContentForPath(fileContents, relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return Object.prototype.hasOwnProperty.call(fileContents || {}, normalizedPath)
        ? fileContents[normalizedPath]
        : getDefaultFileContent();
}

/**
 * @param {Object} tree
 * @param {string} basePath
 * @param {function} visitor
 */
export function walkTree(tree, basePath, visitor) {
    for (const key in tree) {
        const fullPath = resolveTreePath(basePath, key);
        const hasChildren = Object.keys(tree[key]).length > 0;
        const isFolder = key.endsWith('/') || hasChildren;

        visitor({ key, fullPath, isFolder, children: tree[key] });

        if (isFolder) {
            walkTree(tree[key], fullPath, visitor);
        }
    }
}

/**
 * @param {Object} tree
 * @param {string} basePath
 * @returns {{ files: number, folders: number, existingFiles: Array, existingFolders: Array }}
 */
export function inspectStructure(tree, basePath) {
    const summary = {
        files: 0,
        folders: 0,
        existingFiles: [],
        existingFolders: []
    };

    walkTree(tree, basePath, ({ key, fullPath, isFolder }) => {
        if (isFolder) {
            summary.folders++;
            if (fs.existsSync(fullPath)) {summary.existingFolders.push({ key, path: fullPath });}
        } else {
            summary.files++;
            if (fs.existsSync(fullPath)) {summary.existingFiles.push({ key, path: fullPath });}
        }
    });

    return summary;
}

/** @param {string} name @returns {string} */
function sanitizeProjectFileName(name) {
    return String(name || '')
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') // eslint-disable-line no-control-regex
        .replace(/^\.+/, '')
        .slice(0, 200) || 'project';
}

/**
 * @param {Object} tree
 * @param {string} basePath
 * @param {{ projectName?: string, checkStructure?: boolean, checkTree?: boolean, checkZip?: boolean }} [options]
 */
export function inspectBuildOutput(tree, basePath, options = {}) {
    const {
        projectName = 'project',
        checkStructure = true,
        checkTree = false,
        checkZip = false
    } = options;

    const summary = checkStructure
        ? inspectStructure(tree, basePath)
        : { files: 0, folders: 0, existingFiles: [], existingFolders: [] };

    const safeName = sanitizeProjectFileName(projectName);
    let existingTree = null;
    let existingZip = null;

    if (checkTree) {
        const treePath = path.join(basePath, `${safeName}.tree`);
        if (fs.existsSync(treePath)) {
            existingTree = { path: treePath, name: `${safeName}.tree` };
        }
    }

    if (checkZip) {
        const zipPath = path.join(basePath, `${safeName}.zip`);
        if (fs.existsSync(zipPath)) {
            existingZip = { path: zipPath, name: `${safeName}.zip` };
        }
    }

    return { ...summary, existingTree, existingZip };
}

/**
 * @param {Object} tree
 * @param {string} basePath
 * @param {{ conflictMode?: string, fileContents?: Object<string, string> }} [options]
 * @returns {{ filesCreated: number, filesSkipped: number, filesOverwritten: number, foldersCreated: number }}
 */
export function createStructure(tree, basePath, options = {}) {
    const finalOptions = { ...DEFAULT_OPTIONS, ...options };
    const fileContents = finalOptions.fileContents || {};
    const summary = {
        filesCreated: 0,
        filesSkipped: 0,
        filesOverwritten: 0,
        foldersCreated: 0
    };

    walkTree(tree, basePath, ({ fullPath, isFolder }) => {
        if (isFolder) {
            if (!fs.existsSync(fullPath)) {summary.foldersCreated++;}
            fs.mkdirSync(fullPath, { recursive: true });
            return;
        }

        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        const relativePath = path.relative(basePath, fullPath);
        const content = getContentForPath(fileContents, relativePath);

        if (fs.existsSync(fullPath)) {
            if (finalOptions.conflictMode === 'overwrite') {
                fs.writeFileSync(fullPath, content);
                summary.filesOverwritten++;
            } else {
                summary.filesSkipped++;
            }
            return;
        }

        fs.writeFileSync(fullPath, content);
        summary.filesCreated++;
    });

    return summary;
}