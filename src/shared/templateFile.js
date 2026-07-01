export const TEMPLATE_FILE_FORMAT = 'treeide-template';
export const TEMPLATE_FILE_VERSION = 1;
export const TEMPLATE_FILE_EXTENSION = 'tree-template';

export function isTreeTemplatePath(filePathOrName) {
    return String(filePathOrName || '').toLowerCase().endsWith(`.${TEMPLATE_FILE_EXTENSION}`);
}

export function isProjectTreePath(filePathOrName) {
    const lower = String(filePathOrName || '').toLowerCase();
    return lower.endsWith('.tree') && !isTreeTemplatePath(lower);
}

export function buildTemplateFilePayload(template) {
    return {
        format: TEMPLATE_FILE_FORMAT,
        version: TEMPLATE_FILE_VERSION,
        label: String(template?.label || '').trim(),
        tree: String(template?.tree || ''),
        files: template?.files && typeof template.files === 'object' ? template.files : {}
    };
}

export function serializeTemplateFile(template) {
    return `${JSON.stringify(buildTemplateFilePayload(template), null, 2)}\n`;
}

export function parseTemplateFile(content) {
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('template_import_invalid');
    }

    let data;
    try {
        data = JSON.parse(content);
    } catch {
        throw new Error('template_import_invalid');
    }

    if (!data || typeof data !== 'object') {
        throw new Error('template_import_invalid');
    }
    if (data.format !== TEMPLATE_FILE_FORMAT) {
        throw new Error('template_import_invalid');
    }
    if (typeof data.tree !== 'string') {
        throw new Error('template_import_invalid');
    }
    if (!data.files || typeof data.files !== 'object' || Array.isArray(data.files)) {
        throw new Error('template_import_invalid');
    }

    const label = String(data.label || '').trim();
    if (!label) {
        throw new Error('template_import_invalid');
    }

    const files = {};
    for (const [filePath, fileContent] of Object.entries(data.files)) {
        if (typeof filePath !== 'string' || typeof fileContent !== 'string') {
            throw new Error('template_import_invalid');
        }
        files[filePath] = fileContent;
    }

    return { label, tree: data.tree, files };
}

export function sanitizeTemplateFileName(name) {
    return String(name)
        .replace(/[\\/:*?"<>|\x00-\x1f]/g, '_') // eslint-disable-line no-control-regex
        .replace(/^\.+/, '')
        .slice(0, 200) || 'template';
}