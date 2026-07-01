import {
    isTreeTemplatePath,
    parseTemplateFile,
    serializeTemplateFile
} from '../../shared/templateFile.js';
import { findRenameMatch } from '../../shared/helpers.js';

export function createTemplatesUi(app) {

    let templateDropCounter = 0;

    const CUSTOM_TEMPLATES_KEY = 'custom_templates';
    const STRUCTURE_SAVE_DEBOUNCE_MS = 150;
    const FILE_SAVE_DEBOUNCE_MS = 150;
    const CUSTOM_TEMPLATES_AUTOSAVE_MS = 5000;
    let selectedTemplateName = 'node';
    let selectedTemplateFile = '';
    let selectedTemplateSource = 'builtin';
    let modalListenersBound = false;
    let structureSaveTimer = null;
    let fileSaveTimer = null;
    let customTemplatesHydrated = false;
    let customTemplatesAutosaveTimer = null;
    let pendingCustomTemplatesDbWrite = null;

    function isCustomEditMode() {
        return selectedTemplateSource === 'custom'
            && isCustomTemplate(selectedTemplateName);
    }

    function loadCustomTemplates() {
        try {
            const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function queueCustomTemplatesDbWrite(json) {
        if (!app.dbStorage) { return; }
        if (pendingCustomTemplatesDbWrite) { return; }
        pendingCustomTemplatesDbWrite = app.dbStorage.set(CUSTOM_TEMPLATES_KEY, json)
            .catch((err) => {
                console.warn('IndexedDB custom templates write failed:', err);
            })
            .finally(() => {
                pendingCustomTemplatesDbWrite = null;
            });
    }

    async function flushCustomTemplatesPersisted() {
        if (pendingCustomTemplatesDbWrite) {
            try {
                await pendingCustomTemplatesDbWrite;
            } catch { /* already logged */ }
        }
    }

    function saveCustomTemplates(map) {
        const json = JSON.stringify(map);
        try {
            localStorage.setItem(CUSTOM_TEMPLATES_KEY, json);
        } catch (err) {
            console.warn('Failed to persist custom templates:', err);
            app.toast?.showToast(app.i18n.t('storage_error'), 3000);
        }
        queueCustomTemplatesDbWrite(json);
    }

    async function ensureCustomTemplatesHydrated() {
        if (customTemplatesHydrated) { return; }
        customTemplatesHydrated = true;

        const local = loadCustomTemplates();
        if (Object.keys(local).length > 0 || !app.dbStorage) { return; }

        try {
            const raw = await app.dbStorage.get(CUSTOM_TEMPLATES_KEY);
            if (!raw) { return; }
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') { return; }
            localStorage.setItem(CUSTOM_TEMPLATES_KEY, raw);
        } catch (err) {
            console.warn('Failed to hydrate custom templates from IndexedDB:', err);
        }
    }

    function startCustomTemplatesAutosave() {
        stopCustomTemplatesAutosave();
        customTemplatesAutosaveTimer = setInterval(() => {
            if (!document.body.classList.contains('templates-active')) { return; }
            flushTemplateEdits();
        }, CUSTOM_TEMPLATES_AUTOSAVE_MS);
    }

    function stopCustomTemplatesAutosave() {
        if (customTemplatesAutosaveTimer) {
            clearInterval(customTemplatesAutosaveTimer);
            customTemplatesAutosaveTimer = null;
        }
    }

    function getBuiltInTemplates() {
        return app.templatesData;
    }

    function getAllTemplates() {
        return { ...getBuiltInTemplates(), ...loadCustomTemplates() };
    }

    function isCustomTemplate(key) {
        return Object.prototype.hasOwnProperty.call(loadCustomTemplates(), key);
    }

    function getTemplatesForSource(source = selectedTemplateSource) {
        return source === 'custom' ? loadCustomTemplates() : getBuiltInTemplates();
    }

    function getSortedTemplateKeys(templates) {
        return Object.keys(templates).sort((a, b) => {
            const labelA = (templates[a]?.label || a).trim();
            const labelB = (templates[b]?.label || b).trim();
            return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
        });
    }

    function buildBlankTemplate(label) {
        return {
            label,
            tree: `{projectName}/
    README.md`,
            files: {
                '{projectName}/README.md': `# {projectName}\n\n{start_editing}\n`
            }
        };
    }

    function resolveTemplateSnapshot(template) {
        const replace = app.fileops.replaceTemplatePlaceholders;
        const treeText = replace(template?.tree || '');
        const files = {};
        Object.entries(template?.files || {}).forEach(([path, content]) => {
            files[replace(path)] = replace(content);
        });
        return { treeText, files };
    }

    function findTemplateFileKey(template, resolvedPath) {
        const replace = app.fileops.replaceTemplatePlaceholders;
        for (const key of Object.keys(template?.files || {})) {
            if (replace(key) === resolvedPath) { return key; }
        }
        return resolvedPath;
    }

    function ensureSelectedTemplate() {
        const templates = getTemplatesForSource();
        const keys = getSortedTemplateKeys(templates);
        if (templates[selectedTemplateName]) {
            return templates[selectedTemplateName];
        }
        selectedTemplateName = keys[0] || '';
        selectedTemplateFile = '';
        return templates[selectedTemplateName] || null;
    }

    function getPreviewablePaths(paths) {
        return paths.filter((p) => app.tree.isPreviewableFile(p)).sort();
    }

    function getDefaultTemplateFile(files, treeText = '') {
        const paths = Object.keys(files || {});
        if (!paths.length) { return ''; }
        const treePaths = app.tree.getFilePathsFromTree(
            app.helpers.parseEditorContent(
                app.fileops.replaceTemplatePlaceholders(treeText)
            )
        );
        const treeSet = new Set(treePaths);
        const inTree = paths.filter((p) => treeSet.has(p));
        const previewableInTree = getPreviewablePaths(inTree);
        if (previewableInTree.length) { return previewableInTree[0]; }
        const previewableAll = getPreviewablePaths(paths);
        if (previewableAll.length) { return previewableAll[0]; }
        return paths.sort()[0] || '';
    }

    function paintTemplateTree(snapshot, previewEl = document.getElementById('templateTreePreview')) {
        if (!previewEl || !snapshot) { return; }
        previewEl.innerHTML = app.tree.renderTree(
            app.helpers.parseEditorContent(snapshot.treeText),
            '', '', 1, {
                collapsible: false,
                focusable: false,
                activeFilePath: selectedTemplateFile
            }
        );
        app.icons.refreshIcons(previewEl);
    }

    function resolveTemplateFileContent(entry, filePath, fileEditor) {
        if (selectedTemplateFile === filePath && fileEditor && !fileEditor.readOnly) {
            return fileEditor.value;
        }
        const key = findTemplateFileKey(entry, filePath);
        if (Object.prototype.hasOwnProperty.call(entry.files || {}, key)) {
            return entry.files[key];
        }
        return undefined;
    }

    function syncTemplateFilesWithTree(entry, treeText) {
        const tree = app.helpers.parseEditorContent(treeText || '');
        const filePaths = new Set(app.tree.getFilePathsFromTree(tree));
        const fileEditor = document.getElementById('templateFileEditor');
        const fileContents = { ...(entry.files || {}) };

        if (isCustomEditMode() && selectedTemplateFile && fileEditor) {
            const key = findTemplateFileKey(entry, selectedTemplateFile);
            fileContents[key] = fileEditor.value;
        }

        const trackedPaths = new Set(Object.keys(fileContents));
        if (selectedTemplateFile) { trackedPaths.add(selectedTemplateFile); }

        const removedPaths = [...trackedPaths].filter((path) => !filePaths.has(path));
        const addedPaths = [];
        const nextContents = {};

        filePaths.forEach((filePath) => {
            if (Object.prototype.hasOwnProperty.call(fileContents, filePath)) {
                nextContents[filePath] = fileContents[filePath];
            } else {
                addedPaths.push(filePath);
                nextContents[filePath] = '';
            }
        });

        const renames = [];
        if (removedPaths.length > 0 && addedPaths.length > 0) {
            const usedAdded = new Set();
            removedPaths.forEach((oldPath) => {
                const oldContent = resolveTemplateFileContent({ files: fileContents }, oldPath, fileEditor);
                if (oldContent === undefined) { return; }
                const match = findRenameMatch(oldPath, addedPaths, usedAdded);
                if (match) {
                    usedAdded.add(match);
                    renames.push({ oldPath, newPath: match, oldContent });
                }
            });
        }

        renames.forEach(({ oldPath, newPath, oldContent }) => {
            nextContents[newPath] = oldContent;
            if (selectedTemplateFile === oldPath) {
                selectedTemplateFile = newPath;
            }
        });

        entry.files = nextContents;
    }

    function getCustomTemplateDraft() {
        const template = loadCustomTemplates()[selectedTemplateName];
        const treeEditor = document.getElementById('templateTreeEditor');
        const fileEditor = document.getElementById('templateFileEditor');
        if (!template) { return null; }
        if (!isCustomEditMode()) { return template; }

        const draft = {
            ...template,
            tree: treeEditor?.value ?? template.tree,
            files: { ...(template.files || {}) }
        };

        if (selectedTemplateFile && fileEditor) {
            const key = findTemplateFileKey(draft, selectedTemplateFile);
            draft.files[key] = fileEditor.value;
        }

        return draft;
    }

    function updateLiveStructurePreview() {
        if (!isCustomEditMode()) { return; }
        const treeEditor = document.getElementById('templateTreeEditor');
        if (!treeEditor) { return; }
        const replace = app.fileops.replaceTemplatePlaceholders;
        const treeText = replace(treeEditor.value || '');
        paintTemplateTree({ treeText, files: {} });
    }

    function clearTemplateFilePanel() {
        const filePanel = document.getElementById('templateFilePanel');
        const fileNameEl = document.getElementById('templateFileName');
        const fileModeEl = document.getElementById('templateFileMode');
        const fileEditor = document.getElementById('templateFileEditor');
        filePanel?.classList.remove('has-file');
        if (fileNameEl) { fileNameEl.textContent = ''; }
        if (fileModeEl) { fileModeEl.textContent = ''; }
        if (fileEditor) {
            fileEditor.value = '';
            fileEditor.readOnly = true;
            fileEditor.tabIndex = -1;
            delete fileEditor.dataset.templateFile;
        }
        selectedTemplateFile = '';
    }

    function refreshFilePanelFromEditorDraft() {
        const draft = getCustomTemplateDraft();
        if (!draft) { return; }

        const treeEditor = document.getElementById('templateTreeEditor');
        const rawTree = isCustomEditMode() && treeEditor ? treeEditor.value : (draft.tree || '');
        if (!rawTree.trim()) {
            clearTemplateFilePanel();
            return;
        }

        const snapshot = resolveTemplateSnapshot(draft);
        if (!selectedTemplateFile || !Object.prototype.hasOwnProperty.call(snapshot.files, selectedTemplateFile)) {
            selectedTemplateFile = getDefaultTemplateFile(snapshot.files, draft.tree || '');
        }
        if (!selectedTemplateFile) {
            clearTemplateFilePanel();
            return;
        }
        renderTemplateFilePreview(snapshot, selectedTemplateFile);
    }

    function onStructureEditorInput() {
        updateLiveStructurePreview();
        refreshFilePanelFromEditorDraft();
        scheduleStructureSave();
    }

    function onFileEditorInput() {
        if (!isCustomEditMode() || !selectedTemplateFile) { return; }
        scheduleFileSave();
    }

    function clearTemplatePreview() {
        const preview = document.getElementById('templateTreePreview');
        const treeEditor = document.getElementById('templateTreeEditor');
        if (preview) { preview.innerHTML = ''; }
        if (treeEditor) {
            treeEditor.value = '';
            delete treeEditor.dataset.templateKey;
        }
        clearTemplateFilePanel();
        setStructureMode(false);
    }

    function setStructureMode(editable) {
        const body = document.getElementById('templateStructureBody');
        const preview = document.getElementById('templateTreePreview');
        const editor = document.getElementById('templateTreeEditor');
        const previewLabel = document.getElementById('templateStructurePreviewLabel');
        const label = document.getElementById('templateStructureLabel');
        body?.classList.toggle('is-editing', editable);
        editor?.classList.toggle('hidden', !editable);
        preview?.classList.toggle('is-live-preview', editable);
        previewLabel?.classList.toggle('hidden', !editable);
        label?.classList.toggle('is-editable', editable);
        if (label) {
            label.textContent = editable
                ? app.i18n.t('template_panel_structure_edit')
                : app.i18n.t('template_panel_structure');
        }
    }

    function flushStructureEdits() {
        if (!isCustomEditMode()) { return; }
        const treeEditor = document.getElementById('templateTreeEditor');
        const custom = loadCustomTemplates();
        const entry = custom[selectedTemplateName];
        if (!entry || !treeEditor) { return; }
        entry.tree = treeEditor.value;
        syncTemplateFilesWithTree(entry, treeEditor.value);
        saveCustomTemplates(custom);
    }

    function flushFileEdits() {
        if (!isCustomEditMode() || !selectedTemplateFile) { return; }
        const fileEditor = document.getElementById('templateFileEditor');
        const custom = loadCustomTemplates();
        const entry = custom[selectedTemplateName];
        if (!entry || !fileEditor) { return; }
        const originalKey = findTemplateFileKey(entry, selectedTemplateFile);
        entry.files[originalKey] = fileEditor.value;
        saveCustomTemplates(custom);
    }

    function flushTemplateEdits() {
        flushStructureEdits();
        flushFileEdits();
    }

    function scheduleStructureSave() {
        clearTimeout(structureSaveTimer);
        structureSaveTimer = setTimeout(() => {
            flushStructureEdits();
        }, STRUCTURE_SAVE_DEBOUNCE_MS);
    }

    function scheduleFileSave() {
        clearTimeout(fileSaveTimer);
        fileSaveTimer = setTimeout(() => {
            flushFileEdits();
        }, FILE_SAVE_DEBOUNCE_MS);
    }

    function refreshFilePanelForSelectedTemplate() {
        const template = getAllTemplates()[selectedTemplateName];
        if (!template) { return; }
        const snapshot = resolveTemplateSnapshot(template);
        if (!selectedTemplateFile || !Object.prototype.hasOwnProperty.call(snapshot.files, selectedTemplateFile)) {
            selectedTemplateFile = getDefaultTemplateFile(snapshot.files, template.tree || '');
        }
        renderTemplateFilePreview(snapshot, selectedTemplateFile);
    }

    function renderStructurePanel(template) {
        const treeEditor = document.getElementById('templateTreeEditor');
        const isTypingStructure = document.activeElement === treeEditor;

        if (isCustomEditMode()) {
            setStructureMode(true);
            if (!treeEditor) { return; }
            if (!isTypingStructure || treeEditor.dataset.templateKey !== selectedTemplateName) {
                treeEditor.value = template.tree || '';
                treeEditor.dataset.templateKey = selectedTemplateName;
            }
            updateLiveStructurePreview();
            if (!isTypingStructure) {
                treeEditor.focus({ preventScroll: true });
            }
            return;
        }

        setStructureMode(false);
        if (treeEditor) {
            delete treeEditor.dataset.templateKey;
        }
        paintTemplateTree(resolveTemplateSnapshot(template));
    }

    function updateTemplateSourceTabs() {
        document.querySelectorAll('.templates-source-tab').forEach((btn) => {
            const active = btn.dataset.source === selectedTemplateSource;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', String(active));
        });
    }

    function updateTemplateChrome(hasSelection) {
        const useBtn = document.getElementById('useTemplateBtn');
        if (useBtn) { useBtn.disabled = !hasSelection; }
    }

    function applyTemplate(templateName) {
        const template = getAllTemplates()[templateName];
        if (!template) { return; }

        const S = app.state;
        const editor = S.editor;

        app.undoredo.pushUndoState();

        editor.value = app.fileops.replaceTemplatePlaceholders(template.tree);
        S.fileContents = {};
        Object.entries(template.files).forEach(([path, content]) => {
            const resolvedPath = app.fileops.replaceTemplatePlaceholders(path);
            S.fileContents[resolvedPath] = app.fileops.replaceTemplatePlaceholders(content);
        });
        app.editor.refreshTreeView();
        S.isModified = true;

        const activeTab = app.tabs.getActiveTab();
        if (activeTab) {
            activeTab.editorContent = editor.value;
            activeTab.treeData = app.tree.parseEditorContent(editor.value);
            activeTab.fileContents = { ...S.fileContents };
            activeTab.openFileTabs = [];
            activeTab.activeFileTabPath = null;
            app.tabs.markTabLoaded(activeTab, editor.value, S.fileContents, true);
            app.tabs.renderProjectTabBar();
            app.tabs.renderCodeTabBar(activeTab);
            app.tabs.saveTabsToStorage();
        }
    }

    function renderTemplatePreview(template) {
        renderStructurePanel(template);
        refreshFilePanelForSelectedTemplate();
    }

    function renderTemplateModal() {
        const list = document.getElementById('templatesList');
        const emptyState = document.getElementById('templatesEmptyState');
        const escapeHtml = app.helpers.escapeHtml;
        const t = (key) => app.i18n.t(key);
        const customTemplates = loadCustomTemplates();
        const customKeys = getSortedTemplateKeys(customTemplates);
        const isCustomTab = selectedTemplateSource === 'custom';
        const hasCustomTemplates = customKeys.length > 0;
        const showEmptyState = isCustomTab && !hasCustomTemplates;

        const customFooter = document.getElementById('templatesCustomFooter');
        const listPanel = document.querySelector('.templates-panel-list');
        const showCustomFooter = isCustomTab && hasCustomTemplates;

        updateTemplateSourceTabs();
        list?.classList.toggle('hidden', showEmptyState);
        emptyState?.classList.toggle('hidden', !showEmptyState);
        customFooter?.classList.toggle('hidden', !showCustomFooter);
        listPanel?.classList.toggle('has-custom-footer', showCustomFooter);

        if (showEmptyState) {
            if (list) { list.innerHTML = ''; }
            listPanel?.classList.remove('has-custom-footer');
            clearTemplatePreview();
            updateTemplateChrome(false);
            return;
        }

        const templates = getTemplatesForSource();
        const template = ensureSelectedTemplate();
        const hasSelection = !!template;

        if (list) {
            list.innerHTML = getSortedTemplateKeys(templates).map((key) => {
                const isActive = key === selectedTemplateName;
                const label = templates[key].label || key;
                const actions = isCustomTab
                    ? `<div class="template-icon-group" role="group" aria-label="${escapeHtml(t('template_row_actions'))}">
                        <button type="button" class="template-icon-btn" data-template-rename="${escapeHtml(key)}" title="${escapeHtml(t('template_rename'))}" aria-label="${escapeHtml(t('template_rename'))}">
                            <i data-lucide="type" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="template-icon-btn" data-template-edit="${escapeHtml(key)}" title="${escapeHtml(t('template_edit_in_editor'))}" aria-label="${escapeHtml(t('template_edit_in_editor'))}">
                            <i data-lucide="file-code" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="template-icon-btn" data-template-export="${escapeHtml(key)}" title="${escapeHtml(t('template_export'))}" aria-label="${escapeHtml(t('template_export'))}">
                            <i data-lucide="download" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="template-icon-btn template-icon-btn-danger" data-template-delete="${escapeHtml(key)}" title="${escapeHtml(t('template_delete'))}" aria-label="${escapeHtml(t('template_delete'))}">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>`
                    : '';
                return `<div class="template-option-wrap${isActive ? ' active' : ''}">
                    <button type="button" class="template-option${isActive ? ' active' : ''}" data-template="${escapeHtml(key)}" role="option" aria-selected="${isActive}">
                        <span class="template-option-label">${escapeHtml(label)}</span>
                    </button>
                    ${actions}
                </div>`;
            }).join('');
            app.icons.refreshIcons(list);
        }
        if (showCustomFooter && customFooter) {
            app.icons.refreshIcons(customFooter);
        }

        updateTemplateChrome(hasSelection);

        if (!hasSelection) {
            clearTemplatePreview();
            return;
        }

        renderTemplatePreview(template);
    }

    function renderTemplateFilePreview(snapshot, filePath) {
        if (!snapshot) {
            const template = getAllTemplates()[selectedTemplateName];
            snapshot = template ? resolveTemplateSnapshot(template) : null;
        }

        const filePanel = document.getElementById('templateFilePanel');
        const fileNameEl = document.getElementById('templateFileName');
        const fileModeEl = document.getElementById('templateFileMode');
        const fileEditor = document.getElementById('templateFileEditor');
        const hasFile = !!filePath && !!snapshot && Object.prototype.hasOwnProperty.call(snapshot.files, filePath);
        const content = hasFile ? snapshot.files[filePath] : '';
        const isEditable = isCustomEditMode() && hasFile;
        const isTypingFile = document.activeElement === fileEditor;

        filePanel?.classList.toggle('has-file', hasFile);

        if (fileNameEl) {
            fileNameEl.textContent = hasFile ? filePath : '';
        }
        if (fileModeEl) {
            fileModeEl.textContent = hasFile ? app.fileops.getFileTypeLabel(filePath) : '';
        }
        if (fileEditor) {
            if (!isTypingFile || fileEditor.dataset.templateFile !== filePath) {
                fileEditor.value = content;
                fileEditor.dataset.templateFile = filePath || '';
            }
            fileEditor.readOnly = !isEditable;
            fileEditor.setAttribute('aria-readonly', String(!isEditable));
            fileEditor.tabIndex = hasFile ? (isEditable ? 0 : -1) : -1;
        }
        selectedTemplateFile = filePath || '';
        if (isCustomEditMode()) {
            updateLiveStructurePreview();
        } else if (snapshot) {
            paintTemplateTree(snapshot);
        }
    }

    function handleTemplateTreeClick(e) {
        const preview = document.getElementById('templateTreePreview');
        if (!preview) { return; }
        const item = e.target.closest('.tree-item');
        if (!item || item.dataset.type !== 'file') { return; }
        if (item.dataset.preview === 'disabled' || item.classList.contains('no-preview')) { return; }

        flushFileEdits();

        const draft = getCustomTemplateDraft() || getAllTemplates()[selectedTemplateName];
        if (!draft) { return; }
        const snapshot = resolveTemplateSnapshot(draft);
        const filePath = item.dataset.path;
        if (!Object.prototype.hasOwnProperty.call(snapshot.files, filePath)) { return; }
        renderTemplateFilePreview(snapshot, filePath);
    }

    function bindTemplateTreePreview() {
        const preview = document.getElementById('templateTreePreview');
        if (!preview || preview.dataset.boundClicks) { return; }
        preview.dataset.boundClicks = '1';
        preview.addEventListener('click', handleTemplateTreeClick);
    }

    function bindTemplateEditors() {
        const treeEditor = document.getElementById('templateTreeEditor');
        if (treeEditor && treeEditor.dataset.boundEditors !== '1') {
            treeEditor.dataset.boundEditors = '1';
            treeEditor.addEventListener('input', onStructureEditorInput);
            treeEditor.addEventListener('blur', () => {
                clearTimeout(structureSaveTimer);
                flushStructureEdits();
            });
            treeEditor.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab' && e.key !== 'Backspace') { return; }
                if (e.ctrlKey || e.metaKey || e.altKey) { return; }
                if (app.editor.insertTabInTextarea(treeEditor, e)) {
                    e.stopImmediatePropagation();
                }
            }, true);
        }

        const fileEditor = document.getElementById('templateFileEditor');
        if (fileEditor && fileEditor.dataset.boundEditors !== '1') {
            fileEditor.dataset.boundEditors = '1';
            fileEditor.addEventListener('input', onFileEditorInput);
            fileEditor.addEventListener('blur', () => {
                clearTimeout(fileSaveTimer);
                flushFileEdits();
            });
            fileEditor.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab' && e.key !== 'Backspace') { return; }
                if (e.ctrlKey || e.metaKey || e.altKey) { return; }
                if (fileEditor.readOnly) { return; }
                if (app.editor.insertTabInTextarea(fileEditor, e)) {
                    e.stopImmediatePropagation();
                }
            }, true);
        }
    }

    function isTreeTemplateFileName(name) {
        return isTreeTemplatePath(name);
    }

    function isTemplateFileDrag(e) {
        const types = e.dataTransfer?.types;
        if (!types) { return false; }
        return Array.from(types).includes('Files');
    }

    function setTemplateDropActive(active) {
        const dropZone = document.getElementById('templatesListBody');
        const dropHint = document.getElementById('templatesDropHint');
        dropZone?.classList.toggle('is-drop-target', active);
        dropHint?.classList.toggle('hidden', !active);
        if (dropHint) {
            dropHint.setAttribute('aria-hidden', String(!active));
        }
        if (active) {
            app.icons.refreshIcons(dropHint);
        }
    }

    function bindTemplateFileDrop() {
        const dropZone = document.getElementById('templatesListBody');
        if (!dropZone || dropZone.dataset.boundTemplateDrop) { return; }
        dropZone.dataset.boundTemplateDrop = '1';

        dropZone.addEventListener('dragenter', (e) => {
            if (!document.body.classList.contains('templates-active') || !isTemplateFileDrag(e)) { return; }
            e.preventDefault();
            e.stopPropagation();
            templateDropCounter++;
            setTemplateDropActive(true);
        });

        dropZone.addEventListener('dragleave', (e) => {
            if (!document.body.classList.contains('templates-active') || !isTemplateFileDrag(e)) { return; }
            e.preventDefault();
            e.stopPropagation();
            templateDropCounter = Math.max(0, templateDropCounter - 1);
            if (templateDropCounter === 0) {
                setTemplateDropActive(false);
            }
        });

        dropZone.addEventListener('dragover', (e) => {
            if (!document.body.classList.contains('templates-active') || !isTemplateFileDrag(e)) { return; }
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
        });

        dropZone.addEventListener('drop', (e) => {
            if (!document.body.classList.contains('templates-active') || !isTemplateFileDrag(e)) { return; }
            e.preventDefault();
            e.stopPropagation();
            templateDropCounter = 0;
            setTemplateDropActive(false);

            const file = e.dataTransfer?.files?.[0];
            if (!file) { return; }
            if (!isTreeTemplateFileName(file.name)) {
                app.toast.showToast(app.i18n.t('template_import_invalid'), 3000);
                return;
            }
            if (!app.electronAPI?.getFilePath || !app.electronAPI?.readTemplateFileAtPath) { return; }

            const filePath = app.electronAPI.getFilePath(file);
            void importTemplateFromPath(filePath);
        });
    }

    function bindTemplateModal() {
        bindTemplateTreePreview();
        bindTemplateEditors();
        bindTemplateFileDrop();

        if (modalListenersBound) { return; }
        modalListenersBound = true;

        document.querySelectorAll('.templates-source-tab').forEach((tabBtn) => {
            tabBtn.addEventListener('click', () => {
                flushTemplateEdits();
                setTemplateSource(tabBtn.dataset.source);
            });
        });

        const listPanel = document.querySelector('.templates-panel-list');
        listPanel?.addEventListener('click', (e) => {
            const renameBtn = e.target.closest('[data-template-rename]');
            if (renameBtn) {
                e.preventDefault();
                e.stopPropagation();
                void renameCustomTemplate(renameBtn.dataset.templateRename);
                return;
            }
            const editBtn = e.target.closest('[data-template-edit]');
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                openCustomTemplateInEditor(editBtn.dataset.templateEdit);
                return;
            }
            const exportBtn = e.target.closest('[data-template-export]');
            if (exportBtn) {
                e.preventDefault();
                e.stopPropagation();
                void exportCustomTemplate(exportBtn.dataset.templateExport);
                return;
            }
            const deleteBtn = e.target.closest('[data-template-delete]');
            if (deleteBtn) {
                e.preventDefault();
                e.stopPropagation();
                void deleteCustomTemplate(deleteBtn.dataset.templateDelete);
                return;
            }
            const option = e.target.closest('.template-option');
            if (!option) { return; }
            flushTemplateEdits();
            selectedTemplateName = option.dataset.template;
            selectedTemplateFile = '';
            renderTemplateModal();
        });

        document.getElementById('createCustomTemplateBtn')?.addEventListener('click', () => {
            void createBlankCustomTemplate();
        });
        document.getElementById('createBlankTemplateBtn')?.addEventListener('click', () => {
            void createBlankCustomTemplate();
        });
        document.getElementById('importProjectTemplateBtn')?.addEventListener('click', () => {
            void importFromCurrentProject();
        });
        document.getElementById('importProjectTemplateFooterBtn')?.addEventListener('click', () => {
            void importFromCurrentProject();
        });
        document.getElementById('importTemplateFileBtn')?.addEventListener('click', () => {
            void importTemplateFile();
        });
        document.getElementById('importTemplateFileEmptyBtn')?.addEventListener('click', () => {
            void importTemplateFile();
        });
    }

    function setTemplateSource(source) {
        if (source !== 'builtin' && source !== 'custom') { return; }
        if (source === selectedTemplateSource) { return; }

        selectedTemplateSource = source;
        selectedTemplateFile = '';

        const templates = getTemplatesForSource();
        const keys = getSortedTemplateKeys(templates);
        if (!keys.includes(selectedTemplateName)) {
            selectedTemplateName = keys[0] || '';
        }

        renderTemplateModal();
    }

    function setTemplatesScreenActive(active) {
        document.body.classList.toggle('templates-active', active);
    }

    function closeTemplatesModal() {
        flushTemplateEdits();
        void flushCustomTemplatesPersisted();
        stopCustomTemplatesAutosave();
        templateDropCounter = 0;
        setTemplateDropActive(false);
        const modal = document.getElementById('templatesModal');
        setTemplatesScreenActive(false);
        app.modals.closeModalAnimated(modal);
    }

    async function openTemplatesModal() {
        await ensureCustomTemplatesHydrated();

        const modal = document.getElementById('templatesModal');
        bindTemplateModal();

        selectedTemplateSource = isCustomTemplate(selectedTemplateName) ? 'custom' : 'builtin';

        setTemplatesScreenActive(true);
        modal.style.display = 'flex';
        app.modals.trapFocus(modal);
        startCustomTemplatesAutosave();
        renderTemplateModal();
    }

    function openCustomTemplateInEditor(key) {
        if (!isCustomTemplate(key)) { return; }
        applyTemplate(key);
        closeTemplatesModal();
        app.toast.showToast(app.i18n.t('template_edit_in_editor_hint'), 4000);
    }

    function slugifyTemplateName(name) {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return slug ? `custom-${slug}` : `custom-${Date.now()}`;
    }

    async function promptTemplateName(defaultName, titleKey) {
        const name = await app.modals.showPromptAsync(
            app.i18n.t('template_name_prompt'),
            defaultName,
            app.i18n.t(titleKey)
        );
        return name?.trim() || '';
    }

    async function saveCustomTemplateEntry(label, payload) {
        const key = slugifyTemplateName(label);
        const custom = loadCustomTemplates();
        const builtIn = getBuiltInTemplates();

        if (custom[key] || builtIn[key]) {
            const overwrite = await app.modals.showConfirmAsync(
                app.i18n.t('template_overwrite_msg'),
                app.i18n.t('confirm_title')
            );
            if (!overwrite) { return null; }
        }

        custom[key] = { label, ...payload };
        saveCustomTemplates(custom);
        selectedTemplateSource = 'custom';
        selectedTemplateName = key;
        selectedTemplateFile = '';
        renderTemplateModal();
        return key;
    }

    async function createBlankCustomTemplate() {
        const label = await promptTemplateName(app.i18n.t('untitled'), 'template_create_new');
        if (!label) { return; }

        const key = await saveCustomTemplateEntry(label, buildBlankTemplate(label));
        if (key) {
            app.toast.showToast(app.i18n.t('template_saved'));
        }
    }

    async function exportCustomTemplate(key = selectedTemplateName) {
        if (!isCustomTemplate(key)) { return; }
        if (!app.electronAPI?.saveTemplateAs) { return; }

        if (key === selectedTemplateName) {
            flushTemplateEdits();
        }

        const entry = loadCustomTemplates()[key];
        if (!entry) { return; }

        const exportLabel = String(entry.label || entry.name || key).trim() || key;
        const result = await app.electronAPI.saveTemplateAs(
            serializeTemplateFile({ ...entry, label: exportLabel }),
            exportLabel,
            app.i18n.getCurrentLang()
        );
        if (result.canceled) { return; }
        if (result.error) {
            app.toast.showToast(result.error, 3000);
            return;
        }
        app.toast.showToast(app.i18n.t('template_export_saved'));
    }

    async function importTemplateFromContent(content) {
        let parsed;
        try {
            parsed = parseTemplateFile(content);
        } catch {
            app.toast.showToast(app.i18n.t('template_import_invalid'), 3000);
            return false;
        }

        const savedKey = await saveCustomTemplateEntry(parsed.label, {
            tree: parsed.tree,
            files: parsed.files
        });
        if (savedKey) {
            app.toast.showToast(app.i18n.t('template_import_success'));
            return true;
        }
        return false;
    }

    async function importTemplateFromPath(filePath) {
        if (!app.electronAPI?.readTemplateFileAtPath) { return false; }

        const result = await app.electronAPI.readTemplateFileAtPath(filePath, app.i18n.getCurrentLang());
        if (result.error) {
            app.toast.showToast(result.error, 3000);
            return false;
        }
        return importTemplateFromContent(result.content);
    }

    async function importTemplateFile() {
        if (!app.electronAPI?.loadTemplateFile) { return false; }

        const result = await app.electronAPI.loadTemplateFile(app.i18n.getCurrentLang());
        if (result.canceled) { return false; }
        if (result.error) {
            app.toast.showToast(result.error, 3000);
            return false;
        }
        return importTemplateFromContent(result.content);
    }

    async function importFromCurrentProject() {
        const S = app.state;
        if (!S?.editor || !S.editor.value.trim()) {
            app.toast.showToast(app.i18n.t('template_save_empty'), 3000);
            return;
        }

        const tree = app.tree.parseEditorContent(S.editor.value);
        app.fileops.syncFileContentsWithTree(tree);

        const label = await promptTemplateName(app.fileops.getProjectName(), 'template_import_project');
        if (!label) { return; }

        const key = await saveCustomTemplateEntry(label, {
            tree: S.editor.value,
            files: { ...S.fileContents }
        });
        if (key) {
            app.toast.showToast(app.i18n.t('template_saved'));
        }
    }

    async function renameCustomTemplate(key = selectedTemplateName) {
        if (!isCustomTemplate(key)) { return; }

        flushTemplateEdits();

        const custom = loadCustomTemplates();
        const existing = custom[key];
        if (!existing) { return; }

        const label = await promptTemplateName(existing.label, 'template_rename_title');
        if (!label) { return; }

        const newKey = slugifyTemplateName(label);
        if (newKey !== key && (custom[newKey] || getBuiltInTemplates()[newKey])) {
            const overwrite = await app.modals.showConfirmAsync(
                app.i18n.t('template_overwrite_msg'),
                app.i18n.t('confirm_title')
            );
            if (!overwrite) { return; }
        }

        const entry = { ...existing, label };
        delete custom[key];
        custom[newKey] = entry;
        saveCustomTemplates(custom);
        selectedTemplateSource = 'custom';
        selectedTemplateName = newKey;
        renderTemplateModal();
        app.toast.showToast(app.i18n.t('template_updated'));
    }

    async function deleteCustomTemplate(key = selectedTemplateName) {
        if (!isCustomTemplate(key)) { return; }

        const custom = loadCustomTemplates();
        const existing = custom[key];
        if (!existing) { return; }

        const confirmed = await app.modals.showConfirmAsync(
            app.helpers.formatMessage(app.i18n.t('template_delete_confirm'), { name: existing.label }),
            app.i18n.t('template_delete_confirm_title')
        );
        if (!confirmed) { return; }

        delete custom[key];
        saveCustomTemplates(custom);

        const remainingKeys = getSortedTemplateKeys(custom);
        if (remainingKeys.length) {
            selectedTemplateName = remainingKeys[0];
            selectedTemplateSource = 'custom';
        } else {
            selectedTemplateSource = 'builtin';
            selectedTemplateName = getSortedTemplateKeys(getBuiltInTemplates())[0] || 'node';
        }
        selectedTemplateFile = '';
        renderTemplateModal();
        app.toast.showToast(app.i18n.t('template_deleted'));
    }

    return {
        get selectedTemplateName() { return selectedTemplateName; },
        set selectedTemplateName(val) {
            selectedTemplateName = val;
            selectedTemplateFile = '';
        },
        get selectedTemplateSource() { return selectedTemplateSource; },
        getBuiltInTemplates,
        getTemplatesForSource,
        getAllTemplates,
        isCustomTemplate,
        resolveTemplateSnapshot,
        applyTemplate,
        renderTemplateModal,
        renderTemplateFilePreview,
        openTemplatesModal,
        closeTemplatesModal,
        setTemplateSource,
        createBlankCustomTemplate,
        importFromCurrentProject,
        importTemplateFile,
        importTemplateFromContent,
        importTemplateFromPath,
        isTreeTemplateFileName,
        exportCustomTemplate,
        openCustomTemplateInEditor,
        renameCustomTemplate,
        deleteCustomTemplate,
        bindTemplateTreePreview,
        bindTemplateModal,
        ensureCustomTemplatesHydrated,
        flushCustomTemplatesPersisted,
        flushTemplateEdits
    };

}