const fs = require('fs');
const path = require('path');

const DEFAULT_OPTIONS = {
    conflictMode: 'skip'
};

function isPathInside(parentPath, childPath) {
    const relative = path.relative(parentPath, childPath);
    return relative === '' || (!!relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

function resolveTreePath(basePath, key) {
    const cleanKey = key.trim().replace(/[\\/]+$/, '');

    if (!cleanKey || cleanKey === '.' || cleanKey === '..' || cleanKey.includes('\0')) {
        throw new Error(`Invalid tree item name: "${key}"`);
    }

    const resolvedBase = path.resolve(basePath);
    const resolvedPath = path.resolve(resolvedBase, cleanKey);

    if (!isPathInside(resolvedBase, resolvedPath)) {
        throw new Error(`Tree item escapes the target folder: "${key}"`);
    }

    return resolvedPath;
}

function getDefaultFileContent() {
    return '';
}

function normalizeTreeKey(key) {
    return key.trim().replace(/[\\/]+$/, '');
}

function getContentForPath(fileContents, relativePath) {
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return Object.prototype.hasOwnProperty.call(fileContents || {}, normalizedPath)
        ? fileContents[normalizedPath]
        : getDefaultFileContent();
}

function walkTree(tree, basePath, visitor) {
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

function inspectStructure(tree, basePath) {
    const summary = {
        files: 0,
        folders: 0,
        existingFiles: [],
        existingFolders: []
    };

    walkTree(tree, basePath, ({ key, fullPath, isFolder }) => {
        if (isFolder) {
            summary.folders++;
            if (fs.existsSync(fullPath)) summary.existingFolders.push({ key, path: fullPath });
        } else {
            summary.files++;
            if (fs.existsSync(fullPath)) summary.existingFiles.push({ key, path: fullPath });
        }
    });

    return summary;
}

function createStructure(tree, basePath, options = {}) {
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
            if (!fs.existsSync(fullPath)) summary.foldersCreated++;
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

module.exports = {
    createStructure,
    inspectStructure,
    resolveTreePath,
    walkTree,
    getDefaultFileContent,
    getContentForPath,
    normalizeTreeKey
};
