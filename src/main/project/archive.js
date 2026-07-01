/**
 * TreeIDE - Archive/tree conversion helpers for main process
 */

export function treeToText(node, indent = 0) {
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

export function buildTreeFromEntries(entries) {
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