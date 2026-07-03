import { DEFAULT_PROJECT_NAME_KEYS } from '../../shared/helpers.js';

export function createEditor(app) {
const DEFAULT_PROJECT_NAMES = DEFAULT_PROJECT_NAME_KEYS;

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 4;

let _measureCanvas = null;
let _measureFont = '';
let _editorKeysBound = false;

function getEditor() {
    return app.state.editor;
}

function commitTextareaEdit(textarea, result, afterChange) {
    textarea.value = result.value;
    textarea.setSelectionRange(result.start, result.end);
    afterChange?.(textarea);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function applyTabKeyToTextarea(textarea, e, afterChange) {
    if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey) { return false; }
    e.preventDefault();

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const result = app.helpers.applyTabKey(textarea.value, start, end, e.shiftKey);
    if (!result.changed) { return true; }

    commitTextareaEdit(textarea, result, afterChange);
    return true;
}

function applyBackspaceKeyToTextarea(textarea, e, afterChange) {
    if (e.key !== 'Backspace' || e.ctrlKey || e.altKey || e.metaKey) { return false; }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const result = app.helpers.applyBackspaceKey(textarea.value, start, end);
    if (!result.changed) { return false; }

    e.preventDefault();
    commitTextareaEdit(textarea, result, afterChange);
    return true;
}

function bindEditorKeys() {
    if (_editorKeysBound) { return; }
    _editorKeysBound = true;

    document.addEventListener('keydown', (e) => {
        const treeEditor = getEditor();
        const previewEditor = app.state.filePreviewEditor;
        const templateStructureEditor = document.getElementById('templateTreeEditor');
        const templateFileEditor = document.getElementById('templateFileEditor');
        const target = e.target;
        const isTreeEditor = target === treeEditor;
        const isPreviewEditor = target === previewEditor;
        const isTemplateStructureEditor = target === templateStructureEditor;
        const isTemplateFileEditor = target === templateFileEditor && !templateFileEditor?.readOnly;
        if (!isTreeEditor && !isPreviewEditor && !isTemplateStructureEditor && !isTemplateFileEditor) { return; }
        if (e.ctrlKey || e.altKey || e.metaKey) { return; }

        const afterChange = isTreeEditor
            ? syncMainEditorAfterTabChange
            : (isTemplateStructureEditor || isTemplateFileEditor)
                ? (textarea) => { textarea.dispatchEvent(new Event('input', { bubbles: true })); }
                : null;

        if (e.key === 'Tab') {
            if (applyTabKeyToTextarea(target, e, afterChange)) {
                e.stopImmediatePropagation();
            }
            return;
        }

        if (e.key === 'Backspace') {
            if (applyBackspaceKeyToTextarea(target, e, afterChange)) {
                e.stopImmediatePropagation();
            }
        }
    }, true);
}

function applyEditorKeyToTextarea(textarea, e, afterChange) {
    if (e.key === 'Tab') {
        return applyTabKeyToTextarea(textarea, e, afterChange);
    }
    if (e.key === 'Backspace') {
        return applyBackspaceKeyToTextarea(textarea, e, afterChange);
    }
    return false;
}

function insertTabInTextarea(textarea, e) {
    const afterChange = (textarea.id === 'templateTreeEditor' || textarea.id === 'templateFileEditor')
        ? (el) => { el.dispatchEvent(new Event('input', { bubbles: true })); }
        : null;
    return applyEditorKeyToTextarea(textarea, e, afterChange);
}

function syncMainEditorAfterTabChange(editor) {
    const S = app.state;
    S.isModified = true;
    S.currentTree = app.tree.parseEditorContent(editor.value);
    app.fileops.syncFileContentsWithTree(S.currentTree);
    paintTreeView();
    app.validation.updateValidationPanel();
    const activeTab = app.tabs.getActiveTab();
    if (activeTab) {
        activeTab.editorContent = editor.value;
        activeTab.treeData = S.currentTree;
        app.tabs.syncActiveTabDirty(editor.value, S.fileContents);
    }
}

function setTreeEditorContent(content) {
    const editor = getEditor();
    if (editor) { editor.value = content; }
}

function getTreeEditorContent() {
    const editor = getEditor();
    return editor ? editor.value : '';
}

function applyEditorIndent(outdent) {
    const editor = getEditor();
    if (!editor) { return; }
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const result = app.helpers.applyTabKey(editor.value, start, end, outdent);
    if (!result.changed) { return; }

    editor.value = result.value;
    editor.setSelectionRange(result.start, result.end);
    syncMainEditorAfterTabChange(editor);
    editor.dispatchEvent(new Event('input', { bubbles: true }));
}

function paintTreeView() {
    const S = app.state;
    const treeView = S.treeView;
    if (!treeView) { return; }
    treeView.innerHTML = app.tree.renderTree(S.currentTree, '', '', 1, {
        collapsedPaths: app.tree.previewCollapsedPaths,
        collapsible: true,
        activeFilePath: S.activePreviewPath || ''
    });
    app.tree.initTreeKeyboard(treeView);
    app.icons.refreshIcons(treeView);
}

function refreshTreeView() {
    const S = app.state;
    const editor = getEditor();
    S.currentTree = app.tree.parseEditorContent(editor.value);
    app.fileops.syncFileContentsWithTree(S.currentTree);
    paintTreeView();
    app.validation.updateValidationPanel();
    app.fileops.persistFileContents();
}

function autoResizeFileName() {
    const el = app.state.fileNameEl;
    if (!el || el.style.display === 'none') { return; }
    const style = getComputedStyle(el);
    const font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    if (!_measureCanvas || _measureFont !== font) {
        _measureCanvas = document.createElement('canvas').getContext('2d');
        _measureFont = font;
    }
    if (!_measureCanvas) { return; }
    _measureCanvas.font = font;
    const text = el.textContent || 'Untitled';
    const textWidth = _measureCanvas.measureText(text).width;
    const totalWidth = Math.ceil(textWidth) + 32;
    el.style.width = Math.max(totalWidth, 76) + 'px';
}

function updateFileNameDisplay(forceName = null) {
    const S = app.state;
    const nameSpan = S.fileNameEl;
    if (!nameSpan) { return; }
    if (forceName) {
        nameSpan.textContent = forceName;
    } else if (S.currentFilePath) {
        const parts = S.currentFilePath.split(/[\\/]/);
        nameSpan.textContent = parts[parts.length - 1].replace('.tree', '');
    } else if (!nameSpan.textContent.trim() || DEFAULT_PROJECT_NAMES.includes(nameSpan.textContent.trim())) {
        nameSpan.textContent = app.i18n.t('untitled');
    }
    localStorage.setItem('autosave_project_name', nameSpan.textContent);
    autoResizeFileName();
}

function applyZoom(level) {
    level = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
    document.documentElement.style.setProperty('--app-zoom', level);
    requestAnimationFrame(() => {
        app.panelResize?.applyLayout?.();
    });
}

function getCurrentZoom() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-zoom')) || 1;
}

function setZoomLevel(level) {
    applyZoom(level);
    localStorage.setItem('zoom_level', level.toString());
}

function updateMarkdownPreview() {
    const S = app.state;
    if (!S.markdownPreview) { return; }
    if (!S.activePreviewPath || !app.fileops.isMarkdownFile(S.activePreviewPath)) {
        S.markdownPreview.textContent = '';
        return;
    }
    const content = S.filePreviewEditor.value;
    S.markdownPreview.innerHTML = app.markdown.renderMarkdown(content);
}

function openFilePreview(filePath) {
    const S = app.state;
    if (!S.filePreviewPanel) { return; }
    S.activePreviewPath = filePath;
    S.filePreviewPanel.classList.add('show');
    S.filePreviewPanel.classList.toggle('markdown-file', app.fileops.isMarkdownFile(filePath));
    S.filePreviewMode.textContent = app.fileops.getFileTypeLabel(filePath);

    let content = S.fileContents[filePath];
    if (content === undefined) {
        content = app.fileops.getDefaultContentForFile(filePath);
        app.fileops.getDefaultFileLangs()[filePath] = app.i18n.getCurrentLang();
    }
    S.fileContents[filePath] = content;
    S.filePreviewEditor.value = content;
    S.filePreviewEditor.style.display = '';
    updateMarkdownPreview();
    paintTreeView();
    app.panelResize?.applyLayout();
}

function closeFilePreview() {
    const S = app.state;
    S.activePreviewPath = '';
    if (S.filePreviewPanel) { S.filePreviewPanel.classList.remove('show'); }
    if (S.filePreviewPanel) { S.filePreviewPanel.classList.remove('markdown-file'); }
    if (S.filePreviewEditor) { S.filePreviewEditor.value = ''; S.filePreviewEditor.style.display = ''; }
    if (S.filePreviewMode) { S.filePreviewMode.textContent = ''; }
    if (S.markdownPreview) { S.markdownPreview.textContent = ''; }
    paintTreeView();
    app.panelResize?.applyLayout();
}

function switchAdjacentTab(prev) {
    const tabs = app.tabs.projectTabs;
    const currentIndex = tabs.findIndex(t => t.id === app.tabs.activeProjectTabId);
    if (currentIndex === -1) { return; }
    const len = tabs.length;
    const nextIndex = prev
        ? (currentIndex - 1 + len) % len
        : (currentIndex + 1) % len;
    app.tabs.switchToTab(tabs[nextIndex].id);
}

function bindEditorInput() {
    const editor = getEditor();
    const S = app.state;
    if (!editor) { return; }

    bindEditorKeys();

    editor.addEventListener('input', () => {
        app.undoredo.pushUndoState();
        clearTimeout(app.dom.debounceTimer);
        clearTimeout(app.dom.autoSaveTimer);
        app.dom.debounceTimer = setTimeout(() => {
            refreshTreeView();
            const hasTreeItems = Object.keys(S.currentTree).length > 0;
            const treePaths = app.tree.getFilePathsFromTree(S.currentTree);
            const activeTab = app.tabs.getActiveTab();
            const previewPath = S.activePreviewPath || activeTab?.activeFileTabPath || '';
            if (previewPath && !treePaths.includes(previewPath)) {
                if (activeTab?.openFileTabs.length) {
                    const staleIndex = activeTab.openFileTabs.findIndex((ft) => ft.path === previewPath);
                    if (staleIndex !== -1) {
                        activeTab.openFileTabs.splice(staleIndex, 1);
                        if (activeTab.activeFileTabPath === previewPath) {
                            if (activeTab.openFileTabs.length === 0) {
                                activeTab.activeFileTabPath = null;
                                closeFilePreview();
                            } else {
                                const nextIndex = Math.min(staleIndex, activeTab.openFileTabs.length - 1);
                                activeTab.activeFileTabPath = activeTab.openFileTabs[nextIndex].path;
                                openFilePreview(activeTab.activeFileTabPath);
                            }
                        }
                        app.tabs.renderCodeTabBar(activeTab);
                    } else {
                        closeFilePreview();
                    }
                } else {
                    closeFilePreview();
                }
            }
            app.fileops.persistFileContents();
            if (activeTab) {
                activeTab.editorContent = editor.value;
                activeTab.treeData = S.currentTree;
                if (!hasTreeItems) {
                    activeTab.openFileTabs = [];
                    activeTab.activeFileTabPath = null;
                }
                app.tabs.syncActiveTabDirty(editor.value, S.fileContents);
                app.tabs.saveTabsToStorage();
            }
        }, 150);
        app.dom.autoSaveTimer = setTimeout(() => {
            app.fileops.autoSaveToDisk();
        }, 2000);
    });
}

function bindPreviewEditor() {
    const S = app.state;
    const filePreviewEditor = S.filePreviewEditor;
    if (!filePreviewEditor) { return; }

    if (!filePreviewEditor.dataset.boundEditorKeys) {
        filePreviewEditor.dataset.boundEditorKeys = '1';
        filePreviewEditor.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' && e.key !== 'Backspace') { return; }
            if (e.ctrlKey || e.metaKey || e.altKey) { return; }
            if (applyEditorKeyToTextarea(filePreviewEditor, e)) {
                e.stopImmediatePropagation();
            }
        }, true);
    }

    let filePreviewDebounceTimer = null;
    filePreviewEditor.addEventListener('input', () => {
        if (!S.activePreviewPath) { return; }
        delete app.fileops.getDefaultFileLangs()[S.activePreviewPath];
        S.fileContents[S.activePreviewPath] = filePreviewEditor.value;
        clearTimeout(filePreviewDebounceTimer);
        filePreviewDebounceTimer = setTimeout(() => {
            updateMarkdownPreview();
            app.fileops.persistFileContents();
            const activeTab = app.tabs.getActiveTab();
            if (activeTab) {
                activeTab.fileContents = { ...S.fileContents };
                app.tabs.syncActiveTabDirty(activeTab.editorContent, S.fileContents);
                app.tabs.saveTabsToStorage();
            }
        }, 150);
    });
    const closeFilePreviewBtn = document.getElementById('closeFilePreviewBtn');
    if (closeFilePreviewBtn) {
        closeFilePreviewBtn.addEventListener('click', () => {
            if (S.activePreviewPath) {
                app.tabs.closeFileTab(S.activePreviewPath);
            } else {
                closeFilePreview();
            }
        });
    }
}

function bindTreeViewClicks() {
    const treeView = app.state.treeView;
    if (!treeView) { return; }

    treeView.addEventListener('click', (e) => {
        const item = e.target.closest('.tree-item');
        if (!item) { return; }
        treeView.querySelectorAll('.tree-item').forEach((el) => el.tabIndex = -1);
        item.tabIndex = 0;
        item.focus();

        if (item.dataset.type === 'folder') {
            app.tree.toggleFolderCollapsed(item.dataset.path);
            paintTreeView();
            return;
        }

        if (item.dataset.preview === 'disabled') { closeFilePreview(); return; }
        app.tabs.openFileInTab(item.dataset.path);
    });
}

function bindZoomWheel() {
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = Math.sign(e.deltaY);
            setZoomLevel(getCurrentZoom() - delta * ZOOM_STEP);
        }
    }, { passive: false });
}

return {
    DEFAULT_PROJECT_NAMES,
    ZOOM_STEP,
    insertTabInTextarea,
    setTreeEditorContent,
    getTreeEditorContent,
    applyEditorIndent,
    paintTreeView,
    refreshTreeView,
    updateFileNameDisplay,
    applyZoom,
    getCurrentZoom,
    setZoomLevel,
    updateMarkdownPreview,
    openFilePreview,
    closeFilePreview,
    switchAdjacentTab,
    bindEditorInput,
    bindPreviewEditor,
    bindTreeViewClicks,
    bindZoomWheel
};


}
