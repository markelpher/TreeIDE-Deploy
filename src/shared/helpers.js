/**
 * Shared helpers (text + tree parsing).
 */

export function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

export function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => {
        return message.replaceAll(`{${key}}`, String(value));
    }, template);
}

/** Localized default tab titles — not valid save/export names on their own. */
export const DEFAULT_PROJECT_NAME_KEYS = ['Untitled', 'Sem Título', 'Sin título'];

export function isPlaceholderProjectName(name, extraNames = []) {
    const trimmed = String(name || '').trim();
    if (!trimmed) { return true; }
    const placeholders = new Set([
        ...DEFAULT_PROJECT_NAME_KEYS,
        ...extraNames.map((entry) => String(entry).trim()).filter(Boolean)
    ]);
    return placeholders.has(trimmed);
}

/**
 * Resolves the project name used for save dialogs, placeholders, and exports.
 * Prefers the active tab title, then the last saved name, then the .tree path.
 */
export function resolveProjectName({
    tabName = '',
    lastSavedName = '',
    filePath = '',
    untitledLabel = 'Untitled'
} = {}) {
    const placeholders = [untitledLabel];

    const trimmedTab = String(tabName || '').trim();
    if (trimmedTab && !isPlaceholderProjectName(trimmedTab, placeholders)) {
        return trimmedTab;
    }

    const trimmedSaved = String(lastSavedName || '').trim();
    if (trimmedSaved && !isPlaceholderProjectName(trimmedSaved, placeholders)) {
        return trimmedSaved;
    }

    if (filePath) {
        const fromPath = String(filePath).split(/[\\/]/).pop().replace(/\.tree$/i, '').trim();
        if (fromPath && !isPlaceholderProjectName(fromPath, placeholders)) {
            return fromPath;
        }
    }

    return untitledLabel;
}

export function sanitizeProjectFileName(name) {
    return String(name || '')
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') // eslint-disable-line no-control-regex
        .replace(/^\.+/, '')
        .slice(0, 200) || 'project';
}

export function resolveUserMessage(input, fallback = '') {
    if (input === null || input === undefined || input === '') { return fallback; }
    if (typeof input === 'string') { return input.trim() || fallback; }
    if (typeof input === 'number' || typeof input === 'boolean') { return String(input); }
    if (typeof input === 'object') {
        if (typeof input.message === 'string' && input.message.trim()) {
            return input.message.trim();
        }
        if (typeof input.error === 'string' && input.error.trim()) {
            return input.error.trim();
        }
    }
    return fallback;
}
export function getLineBlockBounds(value, start, end) {
    const blockStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const endLineStart = value.lastIndexOf('\n', Math.max(0, end - 1)) + 1;
    let blockEnd = value.indexOf('\n', endLineStart);
    if (blockEnd === -1) {
        blockEnd = value.length;
    }
    return { blockStart, blockEnd };
}

/**
 * One logical indent level for Tab / Shift+Tab.
 * Parser treats one tab or four spaces as one level (see getLineIndent).
 */
export const INDENT_UNIT = '    ';

/** True when Tab should indent/outdent whole lines instead of inserting at the cursor. */
export function shouldUseBlockIndent(value, start, end, shiftKey) {
    if (shiftKey) { return true; }
    if (start !== end) { return true; }
    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const beforeCursor = value.slice(lineStart, start);
    return beforeCursor.length === 0 || /^[\t ]*$/.test(beforeCursor);
}

export function transformLineIndent(line, outdent) {
    if (!outdent) {
        return `${INDENT_UNIT}${line}`;
    }
    if (line.startsWith('\t')) {
        return line.slice(1);
    }
    if (line.startsWith('    ')) {
        return line.slice(4);
    }
    const match = line.match(/^( +)/);
    if (match) {
        return line.slice(Math.min(4, match[1].length));
    }
    return line;
}

export function remapOffsetInBlock(blockStart, oldBlock, newBlock, offset) {
    if (offset <= blockStart) {
        return blockStart;
    }
    const rel = Math.min(offset - blockStart, oldBlock.length);
    const oldLines = oldBlock.split('\n');
    const newLines = newBlock.split('\n');
    let oldPos = 0;
    let newPos = blockStart;
    for (let i = 0; i < oldLines.length; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];
        const lineEnd = oldPos + oldLine.length;
        if (rel <= lineEnd) {
            const col = rel - oldPos;
            const delta = newLine.length - oldLine.length;
            return newPos + Math.max(0, col + delta);
        }
        oldPos += oldLine.length + (i < oldLines.length - 1 ? 1 : 0);
        newPos += newLine.length + (i < oldLines.length - 1 ? 1 : 0);
    }
    return blockStart + newBlock.length;
}

/** How many characters to delete with Backspace when the cursor is in leading whitespace. */
export function getBackspaceIndentDeleteLength(beforeCursor) {
    if (!beforeCursor || !/^[\t ]+$/.test(beforeCursor)) {
        return 0;
    }
    if (beforeCursor.endsWith('\t')) {
        return 1;
    }
    const match = beforeCursor.match(/( +)$/);
    return Math.min(4, match ? match[1].length : 0);
}

/** Backspace in leading whitespace removes one indent level (up to 4 spaces). */
export function applyBackspaceKey(value, start, end) {
    if (start !== end || start === 0) {
        return { value, start, end, changed: false };
    }

    const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const beforeCursor = value.slice(lineStart, start);
    const deleteLen = getBackspaceIndentDeleteLength(beforeCursor);
    if (deleteLen === 0) {
        return { value, start, end, changed: false };
    }

    const newStart = start - deleteLen;
    return {
        value: value.slice(0, newStart) + value.slice(end),
        start: newStart,
        end: newStart,
        changed: true
    };
}

/** Tab always inserts 4 spaces at the cursor; Shift+Tab outdents the line(s). */
export function applyTabKey(value, start, end, shiftKey) {
    if (shiftKey) {
        return applyBlockIndent(value, start, end, true);
    }

    const newValue = value.slice(0, start) + INDENT_UNIT + value.slice(end);
    const newPos = start + INDENT_UNIT.length;
    return { value: newValue, start: newPos, end: newPos, changed: true };
}

export function applyBlockIndent(value, start, end, outdent) {
    const { blockStart, blockEnd } = getLineBlockBounds(value, start, end);
    const block = value.slice(blockStart, blockEnd);
    const newBlock = block.split('\n').map((line) => transformLineIndent(line, outdent)).join('\n');
    if (newBlock === block) {
        return { value, start, end, changed: false };
    }
    const newValue = value.slice(0, blockStart) + newBlock + value.slice(blockEnd);
    return {
        value: newValue,
        start: remapOffsetInBlock(blockStart, block, newBlock, start),
        end: remapOffsetInBlock(blockStart, block, newBlock, end),
        changed: true
    };
}

export function getLineIndent(line) {
    if (line.startsWith('...')) {
        let indent = 0;
        while (line.startsWith('...')) {
            indent++;
            line = line.slice(3);
        }
        return { indent, value: line };
    }

    const leadingWhitespace = line.match(/^[\t ]*/)[0];
    const tabs = (leadingWhitespace.match(/\t/g) || []).length;
    const spaces = (leadingWhitespace.match(/ /g) || []).length;

    return {
        indent: tabs + Math.floor(spaces / 4),
        value: line.slice(leadingWhitespace.length)
    };
}

export function joinTreePath(parentPath, key) {
    const cleanKey = String(key || '').replace(/[\\/]+$/, '');
    const cleanParent = parentPath ? String(parentPath).replace(/\/+$/, '') : '';
    return cleanParent ? cleanParent + '/' + cleanKey : cleanKey;
}

export function parseEditorContent(content) {
    const lines = content.split(/\r\n|\r|\n/).filter(l => l.trim() !== '');
    const root = {};
    const stack = [{ indent: -1, node: root }];

    for (let line of lines) {
        const parsedLine = getLineIndent(line);
        const indent = parsedLine.indent;
        line = parsedLine.value.trim();
        const node = {};

        while (stack.length && stack[stack.length - 1].indent >= indent) { stack.pop(); }
        const parent = stack[stack.length - 1].node;
        parent[line] = node;
        stack.push({ indent, node });
    }

    return root;
}

export function getFilePathsFromTree(tree, parentPath = '') {
    const paths = [];

    Object.keys(tree).forEach((key) => {
        const itemPath = joinTreePath(parentPath, key);
        const isFolder = key.endsWith('/') || Object.keys(tree[key]).length > 0;

        if (isFolder) {
            paths.push(...getFilePathsFromTree(tree[key], itemPath));
        } else {
            paths.push(itemPath);
        }
    });

    return paths;
}

export function pathLooksUnsafe(name, parts) {
    return /^[a-zA-Z]:/.test(name) || name.startsWith('/') || name.startsWith('\\') || parts.includes('..');
}

export function parseFilePathParts(filePath) {
    const name = filePath.split('/').pop() || '';
    const slashIdx = filePath.lastIndexOf('/');
    const dir = slashIdx >= 0 ? filePath.slice(0, slashIdx + 1) : '';
    const dotIdx = name.lastIndexOf('.');
    const base = dotIdx > 0 ? name.slice(0, dotIdx) : name;
    const ext = dotIdx > 0 ? name.slice(dotIdx + 1).toLowerCase() : '';
    return { dir, name, base, ext };
}

/** Pair a removed tree path with its renamed successor when the tree editor changes file names. */
export function findRenameMatch(oldPath, addedPaths, usedAdded) {
    const old = parseFilePathParts(oldPath);
    const isUnused = (p) => !usedAdded.has(p);

    let match = addedPaths.find((p) => {
        if (!isUnused(p)) { return false; }
        const next = parseFilePathParts(p);
        return next.dir === old.dir && next.base === old.base;
    });
    if (match) { return match; }

    if (old.ext) {
        match = addedPaths.find((p) => {
            if (!isUnused(p)) { return false; }
            const next = parseFilePathParts(p);
            return next.dir === old.dir && next.ext === old.ext;
        });
        if (match) { return match; }
    }

    match = addedPaths.find((p) => {
        if (!isUnused(p)) { return false; }
        return parseFilePathParts(p).dir === old.dir;
    });
    if (match) { return match; }

    match = addedPaths.find((p) => {
        if (!isUnused(p)) { return false; }
        return parseFilePathParts(p).name === old.name;
    });
    if (match) { return match; }

    return addedPaths.find(isUnused) || null;
}