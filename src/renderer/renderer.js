let editor, editorShell, treeView, filePreviewPanel, filePreviewEditor, filePreviewName, filePreviewMode, markdownPreview;
const fileIcons = {};
const folderIcons = {};
const defaultProjectNames = ['Untitled', 'Sem Título'];

let currentFilePath = '';
let currentTree = {};
let lastSavedProjectName = '';
let isModified = false;
let installationId = localStorage.getItem('installation_id');
let buildFolderPath = localStorage.getItem('build_folder_path') || '';
let fileContents = {};
let activePreviewPath = '';

function updateEditorExampleVisibility() {
    if (editorShell && editor) {
        editorShell.classList.toggle('has-content', editor.value.length > 0);
    }
}

function insertTabInTextarea(textarea, e) {
    if (e.key !== 'Tab') return;

    e.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.slice(start, end);

    if (selected.includes('\n')) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const blockEnd = value.indexOf('\n', end);
        const actualEnd = blockEnd === -1 ? value.length : blockEnd;
        const block = value.slice(lineStart, actualEnd);
        const lines = block.split('\n');
        const updatedLines = e.shiftKey
            ? lines.map(line => line.startsWith('\t') ? line.slice(1) : line.replace(/^ {1,4}/, ''))
            : lines.map(line => `\t${line}`);

        textarea.value = value.slice(0, lineStart) + updatedLines.join('\n') + value.slice(actualEnd);
        textarea.selectionStart = lineStart;
        textarea.selectionEnd = lineStart + updatedLines.join('\n').length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }

    if (e.shiftKey) return;

    textarea.value = value.slice(0, start) + '\t' + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function normalizeTreeName(key) {
    return key.trim().replace(/[\\/]+$/, '');
}

function joinTreePath(parentPath, key) {
    const name = normalizeTreeName(key);
    return parentPath ? `${parentPath}/${name}` : name;
}

function renderTree(tree, prefix = '', parentPath = '') {
    let result = '';
    const keys = Object.keys(tree);
    
    keys.forEach((key, i) => {
        const isLast = i === keys.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        const isFolder = key.endsWith('/') || Object.keys(tree[key]).length > 0;
        const details = getIconDetails(key, isFolder);
        const itemPath = joinTreePath(parentPath, key);
        const displayName = normalizeTreeName(key);
        const canPreview = isFolder || isPreviewableFile(itemPath);
        const safeKey = escapeHtml(displayName);
        const safePrefix = escapeHtml(prefix + connector);
        const safePath = escapeHtml(itemPath);
        
        const icon = `<i data-lucide="${details.icon}" class="tree-icon ${details.class}"></i>`;
        
        result += `<div class="tree-item ${isFolder ? 'folder-node' : 'file-node'}${canPreview ? '' : ' no-preview'}" data-path="${safePath}" data-type="${isFolder ? 'folder' : 'file'}" data-preview="${canPreview ? 'enabled' : 'disabled'}">` +
                  `<span class="tree-connector">${safePrefix}</span>` +
                  `${icon}<span class="tree-item-name">${safeKey}</span>` +
                  `</div>`;

        if (isFolder) {
            result += renderTree(tree[key], prefix + (isLast ? '    ' : '│   '), itemPath);
        }
    });

    return result;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function isPreviewableFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const nonPreviewableExtensions = new Set([
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp', 'tiff',
        'psd', 'ai', 'xd', 'fig', 'sketch', 'mp3', 'wav', 'flac', 'm4a',
        'ogg', 'aac', 'mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv'
    ]);

    return !nonPreviewableExtensions.has(ext);
}

function renderMarkdown(markdown) {
    const lines = escapeHtml(markdown).split(/\r?\n/);
    let html = '';
    let inList = false;
    let inCode = false;
    let codeLines = [];

    const flushList = () => {
        if (inList) {
            html += '</ul>';
            inList = false;
        }
    };

    lines.forEach((line) => {
        if (line.trim().startsWith('```')) {
            if (inCode) {
                html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
                codeLines = [];
                inCode = false;
            } else {
                flushList();
                inCode = true;
            }
            return;
        }

        if (inCode) {
            codeLines.push(line);
            return;
        }

        if (line.startsWith('# ')) {
            flushList();
            html += `<h1>${line.slice(2)}</h1>`;
        } else if (line.startsWith('## ')) {
            flushList();
            html += `<h2>${line.slice(3)}</h2>`;
        } else if (line.startsWith('### ')) {
            flushList();
            html += `<h3>${line.slice(4)}</h3>`;
        } else if (/^[-*] /.test(line)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.slice(2)}</li>`;
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            html += `<p>${line.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`;
        }
    });

    flushList();
    if (inCode) html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
    return html;
}


let toastTimer = null;
let pathMessageTimer = null;

function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (toast) {
        if (toastTimer) clearTimeout(toastTimer);
        const messageKey = String(message || '').trim();
        const translatedMessage = messageKey && window.i18n ? window.i18n.t(messageKey) : messageKey;
        const text = String(translatedMessage || '').replace(/\s+/g, ' ').trim();
        toast.textContent = text.length > 180 ? `${text.slice(0, 177)}...` : text;
        toast.style.display = 'block';
        toastTimer = setTimeout(() => {
            toast.style.display = 'none';
            toastTimer = null;
        }, duration);
    }
}

function showPathMessage(path, duration = 4000) {
    const pathMsg = document.getElementById('pathMessage');
    if (pathMsg) {
        if (pathMessageTimer) clearTimeout(pathMessageTimer);
        pathMsg.textContent = path;
        pathMsg.classList.add('show');
        pathMessageTimer = setTimeout(() => {
            pathMsg.classList.remove('show');
            pathMessageTimer = null;
        }, duration);
    }
}

function refreshCurrentView() {
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    treeView.innerHTML = renderTree(currentTree);
    refreshIcons();
    updateMarkdownPreview();
    updateValidationPanel();
}

function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => {
        return message.replaceAll(`{${key}}`, value);
    }, template);
}


function updateFileNameDisplay(forceName = null) {
    const nameSpan = document.getElementById('fileName');
    if (forceName) {
        nameSpan.textContent = forceName;
    } else if (currentFilePath) {
        const parts = currentFilePath.split(/[\\/]/);
        nameSpan.textContent = parts[parts.length - 1].replace('.tree', '');
    } else if (!nameSpan.textContent.trim() || defaultProjectNames.includes(nameSpan.textContent.trim())) {
        nameSpan.textContent = window.i18n.t('untitled');
    }
    // Persist the name
    localStorage.setItem('autosave_project_name', nameSpan.textContent);
}

document.getElementById('fileName').addEventListener('input', () => {
    isModified = true;
    localStorage.setItem('autosave_project_name', document.getElementById('fileName').textContent);
});



document.getElementById('fileName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
        showToast(window.i18n.t('project_updated'));
    }
});

async function saveProject(askPath = false) {
    const currentName = document.getElementById('fileName').textContent.trim();
    // Trigger Save As if no path yet, manual request, OR if the project name has changed from the last save
    if (!currentFilePath || askPath || (currentName !== lastSavedProjectName)) {
        const projectName = currentName || 'project';
        const result = await window.electronAPI.saveTreeAs(editor.value, projectName);
        if (!result.canceled) {
            currentFilePath = result.filePath;
            lastSavedProjectName = currentName;
            isModified = false;
            showToast(window.i18n.t('saved'));
            showPathMessage(currentFilePath);
            return true;
        }
        return false;
    } else {
        await window.electronAPI.saveTree(currentFilePath, editor.value);
        isModified = false;
        showToast(window.i18n.t('saved'));
        showPathMessage(currentFilePath);
        lastSavedProjectName = currentName;
        return true;
    }
}




document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
            saveProject(true);
        } else {
            saveProject();
        }
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.getElementById('menu-new').click();
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        document.getElementById('menu-open').click();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        const focusedEl = document.activeElement;
        const isEditable = focusedEl === editor || focusedEl === filePreviewEditor || focusedEl === document.getElementById('fileName');
        
        if (isEditable) {
            return;
        }
    }

    
    if (e.ctrlKey && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault();
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        if (e.key === '=' || e.key === '+') {
            document.body.style.zoom = currentZoom + 0.1;
        } else {
            document.body.style.zoom = Math.max(0.5, currentZoom - 0.1);
        }
    }
    if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        document.body.style.zoom = 1;
    }

    if (e.key === 'F11') {
        e.preventDefault();
        document.getElementById('menu-fullscreen').click();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        document.getElementById('menu-reload').click();
    }

});

async function exportCurrentTreeAsZip(options = {}) {
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    const validation = validateEditorContent(editor.value);
    updateValidationPanel(validation);

    if (validation.errors.length > 0 || !validation.hasItems) {
        showToast(validation.errors[0] || window.i18n.t('empty_structure_error'), 4000);
        return false;
    }

    const projectName = document.getElementById('fileName').textContent.trim() || 'project';
    const result = await window.electronAPI.exportZip(currentTree, projectName, { fileContents });

    if (result.error) {
        showToast(result.error, 4000);
        return false;
    }

    if (!result.canceled) {
        if (!options.silent) {
            showToast(window.i18n.t('zip_exported'));
        }
        return true;
    }

    return false;
}

function parseEditorContent(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    const root = {};
    const stack = [{ indent: -1, node: root }];

    for (let line of lines) {
        const parsedLine = getLineIndent(line);
        const indent = parsedLine.indent;
        line = parsedLine.value.trim();
        const node = {};

        while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].node;
        parent[line] = node;
        stack.push({ indent, node });
    }

    return root;
}

function hasTreeItems(tree) {
    return tree && Object.keys(tree).length > 0;
}

function getFilePathsFromTree(tree, parentPath = '') {
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

function getDefaultContentForFile(filePath) {
    const fileName = filePath.split('/').pop().toLowerCase();
    const ext = fileName.includes('.') ? fileName.split('.').pop() : '';

    if (fileName === 'package.json') return defaultFileContentsByExtension.json;
    if (fileName === 'readme.md') return `# ${filePath.split('/')[0] || 'Project'}\n\nGenerated with Tree IDE.\n`;
    if (fileName === '.gitignore') return `node_modules/\ndist/\n.env\n`;

    if (ext === 'md' || ext === 'markdown') {
        const t = window.i18n ? window.i18n.t : (k) => k;
        return `# ${t('new_document')}\n\n${t('write_content_here')}\n`;
    }

    return defaultFileContentsByExtension[ext] || '';
}

function syncFileContentsWithTree(tree) {
    const filePaths = new Set(getFilePathsFromTree(tree));
    const nextContents = {};

    filePaths.forEach((filePath) => {
        nextContents[filePath] = Object.prototype.hasOwnProperty.call(fileContents, filePath)
            ? fileContents[filePath]
            : getDefaultContentForFile(filePath);
    });

    fileContents = nextContents;
    persistFileContents();

    if (activePreviewPath && !filePaths.has(activePreviewPath)) {
        closeFilePreview();
    }
}

function persistFileContents() {
    localStorage.setItem('autosave_file_contents', JSON.stringify(fileContents));
}

function loadSavedFileContents() {
    try {
        fileContents = JSON.parse(localStorage.getItem('autosave_file_contents') || '{}');
    } catch {
        fileContents = {};
    }
}

function isMarkdownFile(filePath) {
    return /\.(md|markdown)$/i.test(filePath);
}

function updateMarkdownPreview() {
    if (!activePreviewPath || !isMarkdownFile(activePreviewPath)) {
        markdownPreview.innerHTML = '';
        return;
    }

    markdownPreview.innerHTML = renderMarkdown(filePreviewEditor.value);
}

function getFileTypeLabel(filePath) {
    const name = filePath.split('/').pop().toLowerCase();
    const ext = name.includes('.') ? name.split('.').pop() : '';

    const typeMap = {
        js: 'JavaScript', mjs: 'JavaScript', cjs: 'JavaScript',
        ts: 'TypeScript', mts: 'TypeScript', cts: 'TypeScript',
        jsx: 'JSX', tsx: 'TSX',
        py: 'Python',
        rb: 'Ruby',
        java: 'Java',
        kt: 'Kotlin', kts: 'Kotlin',
        c: 'C', h: 'C',
        cpp: 'C++', cxx: 'C++', cc: 'C++', hpp: 'C++',
        cs: 'C#',
        go: 'Go',
        rs: 'Rust',
        swift: 'Swift',
        php: 'PHP',
        lua: 'Lua',
        r: 'R',
        dart: 'Dart',
        scala: 'Scala',
        sh: 'Shell', bash: 'Shell', zsh: 'Shell',
        ps1: 'PowerShell', psm1: 'PowerShell',
        bat: 'Batch', cmd: 'Batch',
        html: 'HTML', htm: 'HTML',
        css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less',
        json: 'JSON', jsonc: 'JSON',
        xml: 'XML',
        yaml: 'YAML', yml: 'YAML',
        toml: 'TOML',
        ini: 'INI', cfg: 'INI',
        sql: 'SQL',
        graphql: 'GraphQL', gql: 'GraphQL',
        md: 'Markdown', markdown: 'Markdown',
        txt: 'Text',
        csv: 'CSV',
        env: 'Env',
        dockerfile: 'Dockerfile',
        makefile: 'Makefile',
        vue: 'Vue',
        svelte: 'Svelte',
    };

    if (name === 'dockerfile') return 'Dockerfile';
    if (name === 'makefile') return 'Makefile';
    if (name === '.gitignore' || name === '.gitkeep') return 'Git';
    if (name === '.env' || name.startsWith('.env.')) return 'Env';

    return typeMap[ext] || ext.toUpperCase() || '';
}

function openFilePreview(filePath) {
    activePreviewPath = filePath;
    filePreviewPanel.classList.add('show');
    filePreviewPanel.classList.toggle('markdown-file', isMarkdownFile(filePath));
    filePreviewName.textContent = filePath;
    filePreviewName.title = filePath;
    filePreviewMode.textContent = getFileTypeLabel(filePath);
    filePreviewEditor.value = fileContents[filePath] || '';
    updateMarkdownPreview();

    document.querySelectorAll('.tree-item.active-file').forEach(item => item.classList.remove('active-file'));
    const activeItem = Array.from(treeView.querySelectorAll('[data-type="file"]'))
        .find(item => item.dataset.path === filePath);
    if (activeItem) activeItem.classList.add('active-file');
}

function closeFilePreview() {
    activePreviewPath = '';
    filePreviewPanel.classList.remove('show');
    filePreviewPanel.classList.remove('markdown-file');
    filePreviewEditor.value = '';
    filePreviewMode.textContent = '';
    markdownPreview.innerHTML = '';
    filePreviewName.textContent = window.i18n.t('file_preview_empty');
    document.querySelectorAll('.tree-item.active-file').forEach(item => item.classList.remove('active-file'));
}

function validateEditorContent(content) {
    const errors = [];
    const lines = content.split(/\r?\n/);
    const stack = [{ indent: -1, names: new Set() }];
    let hasItems = false;

    lines.forEach((rawLine, index) => {
        if (rawLine.trim() === '') return;

        hasItems = true;
        const lineNumber = index + 1;
        const parsedLine = getLineIndent(rawLine);
        const name = parsedLine.value.trim();
        const leadingWhitespace = rawLine.match(/^[\t ]*/)[0];
        const spaces = (leadingWhitespace.match(/ /g) || []).length;
        const tabs = (leadingWhitespace.match(/\t/g) || []).length;
        const cleanName = name.replace(/[\\/]+$/, '');
        const nameParts = cleanName.split(/[\\/]+/);

        if (!rawLine.startsWith('...') && tabs > 0 && spaces > 0) {
            errors.push(formatMessage(window.i18n.t('validation_bad_indent'), { line: lineNumber }));
        } else if (!rawLine.startsWith('...') && spaces % 4 !== 0) {
            errors.push(formatMessage(window.i18n.t('validation_bad_indent'), { line: lineNumber }));
        }

        if (!cleanName || cleanName === '.' || cleanName === '..' || cleanName.includes('\0') || /[<>:"|?*]/.test(cleanName)) {
            errors.push(formatMessage(window.i18n.t('validation_bad_name'), { line: lineNumber }));
        }

        if (pathLooksUnsafe(cleanName, nameParts)) {
            errors.push(formatMessage(window.i18n.t('validation_escape'), { line: lineNumber }));
        }

        while (stack.length && stack[stack.length - 1].indent >= parsedLine.indent) stack.pop();
        const parent = stack[stack.length - 1];
        const duplicateKey = cleanName.toLowerCase();

        if (parent.names.has(duplicateKey)) {
            errors.push(formatMessage(window.i18n.t('validation_duplicate'), { line: lineNumber }));
        }

        parent.names.add(duplicateKey);
        stack.push({ indent: parsedLine.indent, names: new Set() });
    });

    if (!hasItems) errors.push(window.i18n.t('validation_empty'));

    return { errors: [...new Set(errors)], hasItems };
}

function pathLooksUnsafe(name, parts) {
    return /^[a-zA-Z]:/.test(name) || name.startsWith('/') || name.startsWith('\\') || parts.includes('..');
}

function updateValidationPanel(validation = null) {
    const panel = document.getElementById('validationPanel');
    if (!panel) return;

    if (!validation && editor.value.trim() === '') {
        panel.classList.remove('show');
        panel.innerHTML = '';
        return;
    }

    validation = validation || validateEditorContent(editor.value);

    if (validation.errors.length === 0) {
        panel.classList.remove('show');
        panel.innerHTML = '';
        return;
    }

    panel.innerHTML = `<strong>${escapeHtml(window.i18n.t('validation_title'))}</strong><ul>` +
        validation.errors.slice(0, 4).map(error => `<li>${escapeHtml(error)}</li>`).join('') +
        `</ul>`;
    panel.classList.add('show');
}

function getLineIndent(line) {
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

// Theme Management
const handleThemeChange = (val) => {
    if (val === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', val);
    document.getElementById('themeSelect').value = val;
    document.getElementById('welcomeThemeSelect').value = val;
};

function setBuildFolderPath(path) {
    buildFolderPath = path || '';

    if (buildFolderPath) {
        localStorage.setItem('build_folder_path', buildFolderPath);
    } else {
        localStorage.removeItem('build_folder_path');
    }

    updateBuildFolderDisplay();
}

function updateBuildFolderDisplay() {
    const label = buildFolderPath || window.i18n.t('no_folder_selected');
    const settingsPath = document.getElementById('buildFolderPath');
    const welcomePath = document.getElementById('welcomeBuildFolderPath');

    if (settingsPath) {
        settingsPath.textContent = label;
        settingsPath.title = buildFolderPath;
    }

    if (welcomePath) {
        welcomePath.textContent = label;
        welcomePath.title = buildFolderPath;
    }
}

async function chooseBuildFolder() {
    const result = await window.electronAPI.selectBuildFolder();
    if (result.canceled) return;
    setBuildFolderPath(result.path);
    showPathMessage(result.path);
}

async function ensureBuildFolderPath() {
    if (buildFolderPath) return buildFolderPath;

    const result = await window.electronAPI.selectBuildFolder();
    if (result.canceled) return '';

    setBuildFolderPath(result.path);
    return result.path;
}

function applyTemplate(templateName) {
    const template = templates[templateName];
    if (!template) return;

    editor.value = template.tree;
    updateEditorExampleVisibility();
    fileContents = { ...template.files };
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    treeView.innerHTML = renderTree(currentTree);
    refreshIcons();
    updateValidationPanel();
    isModified = true;
    localStorage.setItem('autosave_content', editor.value);
    persistFileContents();
}

let selectedTemplateName = 'node';

function renderTemplateModal() {
    const list = document.getElementById('templatesList');
    const select = document.getElementById('templateSelect');
    const template = templates[selectedTemplateName];
    if (!template) return;

    if (list) {
        list.innerHTML = Object.keys(templates).map((key) => {
            const active = key === selectedTemplateName ? ' active' : '';
            return `<button class="template-option${active}" data-template="${key}">${escapeHtml(templates[key].label || key)}</button>`;
        }).join('');
    }

    if (select) {
        select.innerHTML = Object.keys(templates).map((key) => {
            const label = escapeHtml(templates[key].label || key);
            return `<option value="${escapeHtml(key)}">${label}</option>`;
        }).join('');
        select.value = selectedTemplateName;
    }

    document.getElementById('templateTreePreview').innerHTML = renderTree(parseEditorContent(template.tree));
    const firstFile = Object.keys(template.files)[0] || '';
    renderTemplateFilePreview(firstFile);
    refreshIcons();
}

function renderTemplateFilePreview(filePath) {
    const template = templates[selectedTemplateName];
    const content = template?.files[filePath] || '';
    document.getElementById('templateFileName').textContent = filePath || window.i18n.t('file_preview_empty');
    document.getElementById('templateFileContent').textContent = content;
}

function openTemplatesModal() {
    document.getElementById('templatesModal').style.display = 'flex';
    renderTemplateModal();
}

let debounceTimer;




window.addEventListener('DOMContentLoaded', () => {
    // Initialize elements
    editor = document.getElementById('editor');
    editorShell = document.querySelector('.editor-shell');
    treeView = document.getElementById('treeView');
    filePreviewPanel = document.getElementById('filePreviewPanel');
    filePreviewEditor = document.getElementById('filePreviewEditor');
    filePreviewName = document.getElementById('filePreviewName');
    filePreviewMode = document.getElementById('filePreviewMode');
    markdownPreview = document.getElementById('markdownPreview');

    // Initialize Editor Event Listeners
    if (editor) {
        editor.addEventListener('keydown', function(e) {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const value = this.value;
                const startLineIndex = value.lastIndexOf('\n', start - 1) + 1;
                const endLineIndex = value.indexOf('\n', end);
                const actualEnd = endLineIndex === -1 ? value.length : endLineIndex;
                const selectionBefore = value.substring(0, startLineIndex);
                const selectionContent = value.substring(startLineIndex, actualEnd);
                const selectionAfter = value.substring(actualEnd);
                const lines = selectionContent.split('\n');
                let newLines = [];
                let totalOffsetStart = 0;
                let totalOffsetEnd = 0;

                if (e.shiftKey) {
                    newLines = lines.map((line, index) => {
                        let removed = 0;
                        let newLine = line;
                        if (line.startsWith('\t')) {
                            newLine = line.slice(1);
                            removed = 1;
                        } else if (line.startsWith('    ')) {
                            newLine = line.slice(4);
                            removed = 4;
                        }
                        if (index === 0) totalOffsetStart -= removed;
                        totalOffsetEnd -= removed;
                        return newLine;
                    });
                } else {
                    newLines = lines.map((line, index) => {
                        if (index === 0) totalOffsetStart += 1;
                        totalOffsetEnd += 1;
                        return '\t' + line;
                    });
                }

                this.value = selectionBefore + newLines.join('\n') + selectionAfter;
                this.selectionStart = Math.max(startLineIndex, start + totalOffsetStart);
                this.selectionEnd = end + totalOffsetEnd;
                isModified = true;
                currentTree = parseEditorContent(this.value);
                syncFileContentsWithTree(currentTree);
                treeView.innerHTML = renderTree(currentTree);
                refreshIcons();
                updateValidationPanel();
            }
        });

        editor.addEventListener('input', () => {
            updateEditorExampleVisibility();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentTree = parseEditorContent(editor.value);
                syncFileContentsWithTree(currentTree);
                treeView.innerHTML = renderTree(currentTree);
                refreshIcons();
                updateValidationPanel();
                isModified = true;
                localStorage.setItem('autosave_content', editor.value);
                localStorage.setItem('autosave_path', currentFilePath);
                localStorage.setItem('autosave_project_name', document.getElementById('fileName').textContent);
                persistFileContents();
            }, 150);
        });
    }

    // Initialize Onboarding & State
    if (!localStorage.getItem('onboarding_done')) {
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal) welcomeModal.style.display = 'flex';
    }

    const savedContent = localStorage.getItem('temp_content') || localStorage.getItem('autosave_content');
    const savedPath = localStorage.getItem('temp_path') || localStorage.getItem('autosave_path');
    const savedProjectName = localStorage.getItem('autosave_project_name');
    loadSavedFileContents();
    
    if (savedContent !== null && editor) {
        editor.value = savedContent;
        updateEditorExampleVisibility();
        currentFilePath = savedPath || '';
        currentTree = parseEditorContent(editor.value);
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        if (savedProjectName) {
            document.getElementById('fileName').textContent = savedProjectName;
            lastSavedProjectName = savedProjectName;
        } else {
            updateFileNameDisplay();
            lastSavedProjectName = document.getElementById('fileName').textContent.trim();
        }
        isModified = false;
        localStorage.removeItem('temp_content');
        localStorage.removeItem('temp_path');
    } else if (savedProjectName) {
        document.getElementById('fileName').textContent = savedProjectName;
        lastSavedProjectName = savedProjectName;
    } else {
        updateFileNameDisplay(window.i18n.t('untitled'));
    }

    updateEditorExampleVisibility();

    // Sync Controls
    syncLanguageControls();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    handleThemeChange(savedTheme);
    const themeSelectElement = document.getElementById('themeSelect');
    if (themeSelectElement) themeSelectElement.value = savedTheme;

    refreshIcons();
    if (window.i18n) window.i18n.updateUI();
    updateBuildFolderDisplay();
    updateValidationPanel();
    
    // IPC Bindings
    if (window.electronAPI) {
        initializeAppInfo();
        bindReleaseUpdateEvents();
        setTimeout(checkReleaseUpdateOnStartup, 1200);

        // Window Controls
        const minBtn = document.getElementById('minBtn');
        const maxBtn = document.getElementById('maxBtn');
        const closeBtn = document.getElementById('closeBtn');
        
        if (minBtn) minBtn.addEventListener('click', () => window.electronAPI.windowMinimize());
        if (maxBtn) maxBtn.addEventListener('click', () => window.electronAPI.windowMaximize());
        if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI.windowClose());

        window.electronAPI.onWindowStateChanged((isMaximized) => {
            const maxBtn = document.getElementById('maxBtn');
            if (maxBtn) {
                maxBtn.innerHTML = isMaximized 
                    ? '<i data-lucide="restore"></i>'
                    : '<i data-lucide="square"></i>';
                refreshIcons();
            }
        });

        window.electronAPI.onAttemptClose(async () => {
            if (isModified) {
                const unsavedModal = document.getElementById('unsavedModal');
                if (unsavedModal) unsavedModal.style.display = 'flex';
            } else {
                window.electronAPI.forceClose();
            }
        });
    }

    // Menu Bar & Buttons
    const menuItems = document.querySelectorAll('.menu-item');
    const dropdowns = document.querySelectorAll('.dropdown-content');

    menuItems.forEach(item => {
        const label = item.querySelector('.menu-label');
        const dropdown = item.querySelector('.dropdown-content');
        if (label && dropdown) {
            label.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdowns.forEach(d => { if (d !== dropdown) d.classList.remove('show'); });
                menuItems.forEach(i => { if (i !== item) i.classList.remove('active'); });
                dropdown.classList.toggle('show');
                item.classList.toggle('active');
            });
        }
    });

    window.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('show'));
        menuItems.forEach(i => i.classList.remove('active'));
    });

    // Menu Actions
    const menuNew = document.getElementById('menu-new');
    if (menuNew) menuNew.addEventListener('click', () => {
        editor.value = '';
        currentFilePath = '';
        currentTree = {};
        fileContents = {};
        updateEditorExampleVisibility();
        treeView.innerHTML = '';
        updateFileNameDisplay(window.i18n.t('untitled'));
        lastSavedProjectName = '';
        isModified = false;
        localStorage.removeItem('autosave_content');
        localStorage.removeItem('autosave_path');
        localStorage.removeItem('autosave_project_name');
        closeFilePreview();
    });

    const menuOpen = document.getElementById('menu-open');
    if (menuOpen) menuOpen.addEventListener('click', async () => {
        const result = await window.electronAPI.loadTree();
        if (result.canceled) return;
        currentFilePath = result.filePath;
        currentTree = result.treeData;
        editor.value = result.content;
        updateEditorExampleVisibility();
        fileContents = {};
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        refreshIcons();
        updateValidationPanel();
        updateFileNameDisplay();
        lastSavedProjectName = document.getElementById('fileName').textContent.trim();
        isModified = false;
    });

    const menuSave = document.getElementById('menu-save');
    if (menuSave) menuSave.addEventListener('click', async () => await saveProject());

    const menuSaveAs = document.getElementById('menu-save-as');
    if (menuSaveAs) menuSaveAs.addEventListener('click', async () => await saveProject(true));

    const menuUndo = document.getElementById('menu-undo');
    if (menuUndo) menuUndo.addEventListener('click', () => document.execCommand('undo'));

    const menuRedo = document.getElementById('menu-redo');
    if (menuRedo) menuRedo.addEventListener('click', () => document.execCommand('redo'));

    const menuCut = document.getElementById('menu-cut');
    if (menuCut) menuCut.addEventListener('click', () => document.execCommand('cut'));

    const menuCopy = document.getElementById('menu-copy');
    if (menuCopy) menuCopy.addEventListener('click', () => document.execCommand('copy'));

    const menuPaste = document.getElementById('menu-paste');
    if (menuPaste) menuPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            const el = document.activeElement;
            if (el && (el.tagName === 'TEXTAREA' || el.contentEditable === 'true')) {
                const start = el.selectionStart;
                const end = el.selectionEnd;
                el.value = el.value.substring(0, start) + text + el.value.substring(end);
                el.selectionStart = el.selectionEnd = start + text.length;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        } catch {}
    });

    const menuReload = document.getElementById('menu-reload');
    if (menuReload) menuReload.addEventListener('click', () => window.electronAPI?.windowReload());

    const menuZoomIn = document.getElementById('menu-zoom-in');
    if (menuZoomIn) menuZoomIn.addEventListener('click', () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        document.body.style.zoom = currentZoom + 0.1;
    });

    const menuZoomOut = document.getElementById('menu-zoom-out');
    if (menuZoomOut) menuZoomOut.addEventListener('click', () => {
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        document.body.style.zoom = Math.max(0.5, currentZoom - 0.1);
    });

    const menuZoomReset = document.getElementById('menu-zoom-reset');
    if (menuZoomReset) menuZoomReset.addEventListener('click', () => { document.body.style.zoom = 1; });

    const menuFullscreen = document.getElementById('menu-fullscreen');
    if (menuFullscreen) menuFullscreen.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    });

    const menuMinimize = document.getElementById('menu-minimize');
    if (menuMinimize) menuMinimize.addEventListener('click', () => window.electronAPI?.windowMinimize());

    const menuCloseWin = document.getElementById('menu-close-win');
    if (menuCloseWin) menuCloseWin.addEventListener('click', () => window.electronAPI?.windowClose());

    const menuExit = document.getElementById('menu-exit');
    if (menuExit) menuExit.addEventListener('click', () => window.electronAPI?.windowClose());

    // Action Buttons
    const templatesBtn = document.getElementById('templatesBtn');
    if (templatesBtn) templatesBtn.addEventListener('click', openTemplatesModal);

    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) loadBtn.addEventListener('click', async () => {
        const result = await window.electronAPI.loadTree();
        if (result.canceled) return;
        currentFilePath = result.filePath;
        currentTree = result.treeData;
        editor.value = result.content;
        updateEditorExampleVisibility();
        fileContents = {};
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        refreshIcons();
        updateValidationPanel();
        updateFileNameDisplay();
        lastSavedProjectName = document.getElementById('fileName').textContent.trim();
        isModified = false;
    });

    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.addEventListener('click', async () => await saveProject());

    const createBtn = document.getElementById('createBtn');
    if (createBtn) createBtn.addEventListener('click', async () => {
        currentTree = parseEditorContent(editor.value);
        syncFileContentsWithTree(currentTree);
        const validation = validateEditorContent(editor.value);
        updateValidationPanel(validation);

        if (validation.errors.length > 0) {
            showToast(validation.errors[0], 4000);
            return;
        }

        if (!validation.hasItems) {
            showToast(window.i18n.t('empty_structure_error'), 4000);
            return;
        }

        const targetPath = await ensureBuildFolderPath();
        if (!targetPath) return;

        const inspection = await window.electronAPI.inspectStructure(currentTree, targetPath);
        if (inspection.error) {
            showToast(inspection.error, 4000);
            return;
        }

        const confirmed = await showConfirmAsync(
            formatMessage(window.i18n.t('build_confirm_msg'), {
                files: inspection.files,
                folders: inspection.folders,
                path: targetPath,
                existing: inspection.existingFiles.length
            }),
            window.i18n.t('build_confirm_title')
        );

        if (!confirmed) return;

        let conflictMode = 'skip';
        if (inspection.existingFiles.length > 0) {
            const shouldOverwrite = await showConfirmAsync(
                formatMessage(window.i18n.t('conflict_prompt_msg'), {
                    count: inspection.existingFiles.length
                }),
                window.i18n.t('conflict_prompt_title')
            );
            conflictMode = shouldOverwrite ? 'overwrite' : 'skip';
        }

        const result = await window.electronAPI.createStructure(currentTree, targetPath, { conflictMode, fileContents });
        if (result.error) {
            showToast(result.error, 4000);
            return;
        }
        if (!result.canceled) {
            const shouldExportZip = await showConfirmAsync(
                window.i18n.t('export_zip_after_build_msg'),
                window.i18n.t('export_zip_after_build_title')
            );

            if (shouldExportZip) {
                const zipExported = await exportCurrentTreeAsZip({ silent: true });
                showToast(zipExported ? window.i18n.t('zip_exported') : window.i18n.t('structure_created'));
            } else {
                showToast(window.i18n.t('structure_created'));
            }

            setBuildFolderPath(result.path);
        }
    });

    // Settings Listeners
    const langSelectMenu = document.getElementById('langSelect');
    if (langSelectMenu) langSelectMenu.addEventListener('change', (e) => handleLangChange(e.target.value));

    const welcomeLangSelect = document.getElementById('welcomeLangSelect');
    if (welcomeLangSelect) welcomeLangSelect.addEventListener('change', (e) => handleLangChange(e.target.value));

    if (themeSelectElement) themeSelectElement.addEventListener('change', (e) => handleThemeChange(e.target.value));

    const welcomeThemeSelect = document.getElementById('welcomeThemeSelect');
    if (welcomeThemeSelect) welcomeThemeSelect.addEventListener('change', (e) => handleThemeChange(e.target.value));

    const chooseBuildFolderBtn = document.getElementById('chooseBuildFolderBtn');
    if (chooseBuildFolderBtn) chooseBuildFolderBtn.addEventListener('click', chooseBuildFolder);

    const welcomeChooseBuildFolderBtn = document.getElementById('welcomeChooseBuildFolderBtn');
    if (welcomeChooseBuildFolderBtn) welcomeChooseBuildFolderBtn.addEventListener('click', chooseBuildFolder);

    const clearBuildFolderBtn = document.getElementById('clearBuildFolderBtn');
    if (clearBuildFolderBtn) clearBuildFolderBtn.addEventListener('click', () => setBuildFolderPath(''));

    // Confirmation Modal Buttons
    const agreeConfirmBtn = document.getElementById('agreeConfirmBtn');
    if (agreeConfirmBtn) {
        agreeConfirmBtn.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            confirmCallback = null;
            if (confirmResolver) confirmResolver(true);
            confirmResolver = null;
            if (confirmModal) confirmModal.style.display = 'none';
        });
    }

    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', () => {
            confirmCallback = null;
            if (confirmResolver) confirmResolver(false);
            confirmResolver = null;
            if (confirmModal) confirmModal.style.display = 'none';
        });
    }

    const closeConfirmModal = document.getElementById('closeConfirmModal');
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', () => {
            confirmCallback = null;
            if (confirmResolver) confirmResolver(false);
            confirmResolver = null;
            if (confirmModal) confirmModal.style.display = 'none';
        });
    }

    // Modal & Other Buttons
    const closeTemplatesModal = document.getElementById('closeTemplatesModal');
    if (closeTemplatesModal) closeTemplatesModal.addEventListener('click', () => { document.getElementById('templatesModal').style.display = 'none'; });

    const useTemplateBtn = document.getElementById('useTemplateBtn');
    if (useTemplateBtn) useTemplateBtn.addEventListener('click', () => {
        applyTemplate(selectedTemplateName);
        document.getElementById('templatesModal').style.display = 'none';
    });

    const templatesList = document.getElementById('templatesList');
    if (templatesList) templatesList.addEventListener('click', (e) => {
        const btn = e.target.closest('.template-option');
        if (!btn) return;
        selectedTemplateName = btn.dataset.template;
        renderTemplateModal();
    });

    const templateSelect = document.getElementById('templateSelect');
    if (templateSelect) templateSelect.addEventListener('change', (e) => {
        selectedTemplateName = e.target.value;
        renderTemplateModal();
    });

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.addEventListener('click', () => {
        document.getElementById('welcomeModal').style.display = 'none';
        localStorage.setItem('onboarding_done', 'true');
        if (latestReleaseUpdate && latestReleaseUpdate.latestVersion !== dismissedReleaseVersion) {
            showReleaseUpdateModal(latestReleaseUpdate);
        }
    });

    const menuSettings = document.getElementById('menu-settings');
    if (menuSettings) menuSettings.addEventListener('click', () => {
        const firstTab = document.querySelector('.sidebar-tab');
        if (firstTab) firstTab.click();
        document.getElementById('settingsModal').style.display = 'flex';
    });

    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) closeSettings.addEventListener('click', () => { document.getElementById('settingsModal').style.display = 'none'; });

    const menuCredits = document.getElementById('menu-credits');
    if (menuCredits) menuCredits.addEventListener('click', () => { document.getElementById('aboutModal').style.display = 'flex'; });

    const closeAbout = document.getElementById('closeAbout');
    if (closeAbout) closeAbout.addEventListener('click', () => { document.getElementById('aboutModal').style.display = 'none'; });

    const closeUnsavedModal = document.getElementById('closeUnsavedModal');
    if (closeUnsavedModal) closeUnsavedModal.addEventListener('click', () => { document.getElementById('unsavedModal').style.display = 'none'; });

    const saveUnsavedBtn = document.getElementById('saveUnsavedBtn');
    if (saveUnsavedBtn) saveUnsavedBtn.addEventListener('click', async () => {
        const saved = await saveProject();
        if (saved) window.electronAPI.forceClose();
    });

    const dontSaveUnsavedBtn = document.getElementById('dontSaveUnsavedBtn');
    if (dontSaveUnsavedBtn) dontSaveUnsavedBtn.addEventListener('click', () => {
        localStorage.removeItem('autosave_content');
        localStorage.removeItem('autosave_path');
        localStorage.removeItem('autosave_project_name');
        window.electronAPI.forceClose();
    });

    // Tree View Clicks
    if (treeView) {
        treeView.addEventListener('click', (e) => {
            const item = e.target.closest('.tree-item');
            if (!item || item.dataset.type !== 'file') return;
            if (item.dataset.preview === 'disabled') {
                closeFilePreview();
                return;
            }
            openFilePreview(item.dataset.path);
        });
    }

    // Preview Editor
    if (filePreviewEditor) {
        filePreviewEditor.addEventListener('input', () => {
            if (!activePreviewPath) return;
            fileContents[activePreviewPath] = filePreviewEditor.value;
            persistFileContents();
            updateMarkdownPreview();
            isModified = true;
        });
        filePreviewEditor.addEventListener('keydown', (e) => insertTabInTextarea(filePreviewEditor, e));
    }

    const closeFilePreviewBtn = document.getElementById('closeFilePreviewBtn');
    if (closeFilePreviewBtn) closeFilePreviewBtn.addEventListener('click', closeFilePreview);
});

const settingsModal = document.getElementById('settingsModal');
const aboutModal = document.getElementById('aboutModal');
const welcomeModal = document.getElementById('welcomeModal');
const templatesModal = document.getElementById('templatesModal');
const releaseUpdateModal = document.getElementById('releaseUpdateModal');
const unsavedModal = document.getElementById('unsavedModal');
let latestReleaseUpdate = null;
let dismissedReleaseVersion = '';

let isDownloadingUpdate = false;
let isUpdateDownloaded = false;

function resetReleaseUpdateButton() {
    const actions = document.querySelector('.release-update-actions');
    const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
    const downloadLabel = document.getElementById('updateDownloadLabel');
    const progressEl = document.getElementById('releaseUpdateProgress');
    const progressFill = document.getElementById('releaseUpdateProgressFill');
    const progressText = document.getElementById('releaseUpdateProgressText');

    if (actions) actions.classList.remove('is-primary-only');
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.style.display = '';
    }
    if (progressEl) {
        progressEl.classList.remove('show', 'downloading', 'complete');
    }
    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    if (downloadLabel) downloadLabel.textContent = window.i18n.t('update_download_release');
    isDownloadingUpdate = false;
    isUpdateDownloaded = false;
}

function showReleaseUpdateModal(info) {
    latestReleaseUpdate = info;
    const currentVer = document.getElementById('releaseUpdateCurrent');
    const latestVer = document.getElementById('releaseUpdateLatest');
    if (currentVer) currentVer.textContent = `v${info.currentVersion || '---'}`;
    if (latestVer) latestVer.textContent = `v${info.latestVersion || '---'}`;

    resetReleaseUpdateButton();
    if (releaseUpdateModal) releaseUpdateModal.style.display = 'flex';
    refreshIcons();
}

function queueOrShowReleaseUpdate(info) {
    if (info.latestVersion === dismissedReleaseVersion) return;
    if (welcomeModal && welcomeModal.style.display === 'flex') {
        latestReleaseUpdate = info;
        return;
    }
    showReleaseUpdateModal(info);
}

async function checkReleaseUpdateOnStartup() {
    if (!window.electronAPI || !window.electronAPI.checkReleaseUpdate) return;
    try {
        // Only trigger the check - the update-available event will handle showing the modal.
        // Do NOT call queueOrShowReleaseUpdate here or the modal appears twice.
        const result = await window.electronAPI.checkReleaseUpdate();
        if (result?.ok === false) {
            console.warn('Release update check failed:', result.error);
            showToast(window.i18n.t(result.error || 'update_failed'), 4000);
        }
    } catch (err) {
        console.warn('Release update check failed:', err);
    }
}

function bindReleaseUpdateEvents() {
    if (!window.electronAPI) return;

    if (window.electronAPI.onReleaseUpdateAvailable) {
        window.electronAPI.onReleaseUpdateAvailable((info) => queueOrShowReleaseUpdate(info));
    }
    if (window.electronAPI.onReleaseUpdateError) {
        window.electronAPI.onReleaseUpdateError((message) => {
            isDownloadingUpdate = false;
            resetReleaseUpdateButton();
            showToast(window.i18n.t(message || 'update_failed'), 4000);
        });
    }
    if (window.electronAPI.onUpdateDownloadProgress) {
        window.electronAPI.onUpdateDownloadProgress((progress) => {
            const progressEl = document.getElementById('releaseUpdateProgress');
            const progressFill = document.getElementById('releaseUpdateProgressFill');
            const progressText = document.getElementById('releaseUpdateProgressText');

            if (progressEl) progressEl.classList.add('show', 'downloading');
            if (progressFill) progressFill.style.width = `${progress.percent}%`;
            if (progressText) progressText.textContent = `${Math.round(progress.percent)}%`;
        });
    }
    if (window.electronAPI.onUpdateDownloaded) {
        window.electronAPI.onUpdateDownloaded((info) => {
            isDownloadingUpdate = false;
            isUpdateDownloaded = true;
            const actions = document.querySelector('.release-update-actions');
            const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
            const downloadLabel = document.getElementById('updateDownloadLabel');
            const progressEl = document.getElementById('releaseUpdateProgress');
            const progressFill = document.getElementById('releaseUpdateProgressFill');
            const progressText = document.getElementById('releaseUpdateProgressText');

            if (actions) actions.classList.add('is-primary-only');
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
            if (progressEl) {
                progressEl.classList.remove('downloading');
                progressEl.classList.add('show', 'complete');
            }
            if (progressFill) progressFill.style.width = '100%';
            if (progressText) progressText.textContent = '100%';
            if (downloadLabel) downloadLabel.textContent = window.i18n.t('update_install_restart');
        });
    }
}

async function initializeAppInfo() {
    if (!window.electronAPI || !window.electronAPI.getAppInfo) return;
    try {
        const appInfo = await window.electronAPI.getAppInfo();
        const aboutVersion = document.getElementById('aboutVersion');
        if (aboutVersion) {
            aboutVersion.textContent = appInfo.isPackaged ? `v${appInfo.version}` : `v${appInfo.version} dev`;
        }
    } catch (err) {
        console.warn('App info unavailable:', err);
    }
}

const handleLangChange = (val) => {
    const nameSpan = document.getElementById('fileName');
    const shouldTranslateProjectName = !currentFilePath && nameSpan && defaultProjectNames.includes(nameSpan.textContent.trim());

    if (window.i18n) window.i18n.setLanguage(val);
    syncLanguageControls();

    if (shouldTranslateProjectName && nameSpan) {
        updateFileNameDisplay(window.i18n.t('untitled'));
    }

    updateBuildFolderDisplay();
    updateValidationPanel();
};

function syncLanguageControls() {
    if (!window.i18n) return;
    const currentLang = window.i18n.getCurrentLang();
    const langSelect = document.getElementById('langSelect');
    const welcomeLangSelect = document.getElementById('welcomeLangSelect');
    if (langSelect) langSelect.value = currentLang;
    if (welcomeLangSelect) welcomeLangSelect.value = currentLang;
}

const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        sidebarTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `tab-${targetTab}`) pane.classList.add('active');
        });
        refreshIcons();
    });
});

let confirmCallback = null;
let confirmResolver = null;
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMsg = document.getElementById('confirmMsg');

function showConfirm(message, title, onConfirm) {
    if (confirmMsg) confirmMsg.textContent = message;
    if (confirmTitle) confirmTitle.textContent = title || window.i18n.t('confirm_title');
    confirmCallback = onConfirm;
    if (confirmModal) confirmModal.style.display = 'flex';
}

function showConfirmAsync(message, title) {
    showConfirm(message, title, null);
    return new Promise((resolve) => { confirmResolver = resolve; });
}

function closeReleaseUpdateModal() {
    if (latestReleaseUpdate?.latestVersion) dismissedReleaseVersion = latestReleaseUpdate.latestVersion;
    if (releaseUpdateModal) releaseUpdateModal.style.display = 'none';
}

const declineReleaseUpdateBtn = document.getElementById('declineReleaseUpdateBtn');
if (declineReleaseUpdateBtn) declineReleaseUpdateBtn.addEventListener('click', closeReleaseUpdateModal);

const closeReleaseUpdateModalBtn = document.getElementById('closeReleaseUpdateModal');
if (closeReleaseUpdateModalBtn) closeReleaseUpdateModalBtn.addEventListener('click', closeReleaseUpdateModal);

const downloadReleaseUpdateBtn = document.getElementById('downloadReleaseUpdateBtn');
if (downloadReleaseUpdateBtn) {
    downloadReleaseUpdateBtn.addEventListener('click', async () => {
        if (isUpdateDownloaded) {
            window.electronAPI.installUpdate();
            return;
        }
        if (isDownloadingUpdate) return;

        isDownloadingUpdate = true;
        const downloadLabel = document.getElementById('updateDownloadLabel');
        const progressEl = document.getElementById('releaseUpdateProgress');
        if (downloadLabel) downloadLabel.textContent = window.i18n.t('update_downloading');
        if (progressEl) progressEl.classList.add('show', 'downloading');
        downloadReleaseUpdateBtn.disabled = true;

        try {
            const result = await window.electronAPI.downloadUpdate();
            if (result && !result.ok) {
                isDownloadingUpdate = false;
                resetReleaseUpdateButton();
                showToast(window.i18n.t(result.error || 'update_failed'), 4000);
            }
        } catch (err) {
            isDownloadingUpdate = false;
            resetReleaseUpdateButton();
            showToast(window.i18n.t('update_failed'), 4000);
        }
    });
}

window.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('http') && window.electronAPI) {
        e.preventDefault();
        window.electronAPI.openExternal(e.target.href);
    }
    if (e.target === settingsModal) settingsModal.style.display = 'none';
    if (e.target === aboutModal) aboutModal.style.display = 'none';
    if (e.target === templatesModal) templatesModal.style.display = 'none';
    if (e.target === releaseUpdateModal) closeReleaseUpdateModal();
    if (e.target === unsavedModal) unsavedModal.style.display = 'none';
});
