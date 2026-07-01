export function createTree(app) {

const nonPreviewableExtensions = new Set([
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp', 'tiff',
        'psd', 'ai', 'xd', 'fig', 'sketch', 'mp3', 'wav', 'flac', 'm4a',
        'ogg', 'aac', 'mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv', 'pdf',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz', 'tgz', 'tbz2',
        'txz', 'zst', 'cab', 'iso', 'dmg', 'lz', 'lzma', 'z', 'jar'
    ]);

    const joinTreePath = app.helpers.joinTreePath;
    const normalizeTreeName = (key) => key.trim().replace(/[\\/]+$/, '');

    const previewCollapsedPaths = new Set();

    function toggleFolderCollapsed(path) {
        if (previewCollapsedPaths.has(path)) {
            previewCollapsedPaths.delete(path);
            return false;
        }
        previewCollapsedPaths.add(path);
        return true;
    }

    function isPreviewableFile(filePath) {
        const ext = filePath.split('.').pop().toLowerCase();
        return !nonPreviewableExtensions.has(ext);
    }

    function initTreeKeyboard(treeView) {
        if (!treeView || treeView.dataset.treeKeyboard) {return;}
        treeView.dataset.treeKeyboard = '1';
        treeView.addEventListener('keydown', (e) => {
            const items = treeView.querySelectorAll('.tree-item');
            if (!items.length) {return;}
            let index = Array.from(items).indexOf(document.activeElement);
            if (index === -1) {index = 0;}
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    index = Math.min(index + 1, items.length - 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    index = Math.max(index - 1, 0);
                    break;
                case 'Home':
                    e.preventDefault();
                    index = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    index = items.length - 1;
                    break;
                case 'Enter':
                    if (items[index]) {
                        e.preventDefault();
                        items[index].click();
                    }
                    return;
                default:
                    return;
            }
            if (items[index]) {
                items[index].tabIndex = 0;
                items[index].focus();
                items.forEach((el, i) => { if (i !== index) {el.tabIndex = -1;} });
            }
        });
    }

    function renderTree(tree, prefix = '', parentPath = '', depth = 1, options = {}) {
        const escapeHtml = app.helpers.escapeHtml;
        const collapsedPaths = options.collapsedPaths instanceof Set ? options.collapsedPaths : null;
        const collapsible = options.collapsible === true && collapsedPaths !== null;
        const activeFilePath = options.activeFilePath || '';
        let result = '';
        const keys = Object.keys(tree);

        keys.forEach((key, i) => {
            const isLast = i === keys.length - 1;
            const connector = isLast ? '└── ' : '├── ';
            const isFolder = key.endsWith('/') || Object.keys(tree[key]).length > 0;
            const details = app.icons.getIconDetails(key, isFolder);
            const itemPath = joinTreePath(parentPath, key);
            const displayName = normalizeTreeName(key);
            const canPreview = isFolder || isPreviewableFile(itemPath);
            const safeKey = escapeHtml(displayName);
            const safePrefix = escapeHtml(prefix + connector);
            const safePath = escapeHtml(itemPath);
            const isCollapsed = collapsible && collapsedPaths.has(itemPath);
            const isActiveFile = !isFolder && activeFilePath === itemPath;

            const icon = `<i data-lucide="${details.icon}" class="tree-icon ${details.class}"></i>`;
            const expandLabel = app.i18n ? app.i18n.t('tree_expand') : 'Expand';
            const collapseLabel = app.i18n ? app.i18n.t('tree_collapse') : 'Collapse';
            const foldLeading = collapsible
                ? (isFolder
                    ? `<button type="button" class="tree-fold-btn" aria-label="${isCollapsed ? expandLabel : collapseLabel}" aria-expanded="${!isCollapsed}"><i data-lucide="chevron-down" aria-hidden="true"></i></button>`
                    : '<span class="tree-fold-spacer" aria-hidden="true"></span>')
                : '';

            const expandedAttr = isFolder && collapsible ? ` aria-expanded="${!isCollapsed}"` : '';
            const focusable = options.focusable !== false;
            const tabIndex = focusable && parentPath === '' && i === 0 ? '0' : '-1';
            const activeClass = isActiveFile ? ' active-file' : '';

            result += `<div class="tree-item ${isFolder ? 'folder-node' : 'file-node'}${canPreview ? '' : ' no-preview'}${isCollapsed ? ' collapsed' : ''}${activeClass}" data-path="${safePath}" data-type="${isFolder ? 'folder' : 'file'}" data-preview="${canPreview ? 'enabled' : 'disabled'}" role="treeitem" tabindex="${tabIndex}" aria-level="${depth}"${expandedAttr}>` +
                      foldLeading +
                      `<span class="tree-connector">${safePrefix}</span>` +
                      `${icon}<span class="tree-item-name">${safeKey}</span>` +
                      `</div>`;

            if (isFolder && !isCollapsed) {
                const childPrefix = prefix + (isLast ? '    ' : '│   ');
                const childHtml = renderTree(tree[key], childPrefix, itemPath, depth + 1, options);
                if (collapsible) {
                    result += `<div class="tree-children" data-parent="${safePath}">${childHtml}</div>`;
                } else {
                    result += childHtml;
                }
            }
        });

        return result;
    }

    function parseEditorContent(content) {
        return app.helpers.parseEditorContent(content);
    }

    function getFilePathsFromTree(tree, parentPath = '') {
        return app.helpers.getFilePathsFromTree(tree, parentPath);
    }

    return {
        renderTree, parseEditorContent, getFilePathsFromTree,
        normalizeTreeName, joinTreePath, isPreviewableFile,
        nonPreviewableExtensions, initTreeKeyboard,
        get previewCollapsedPaths() { return previewCollapsedPaths; },
        toggleFolderCollapsed
    };

}
