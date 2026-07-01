export function createTemplatesUi(app) {

const CUSTOM_TEMPLATES_KEY = 'custom_templates';
    let selectedTemplateName = 'node';
    let selectedTemplateFile = '';

    function loadCustomTemplates() {
        try {
            const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function saveCustomTemplates(map) {
        localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(map));
    }

    function getAllTemplates() {
        return { ...app.templatesData, ...loadCustomTemplates() };
    }

    function isCustomTemplate(key) {
        return key.startsWith('custom-') || Object.prototype.hasOwnProperty.call(loadCustomTemplates(), key);
    }

    function getSortedTemplateKeys(templates) {
        return Object.keys(templates).sort((a, b) => {
            const labelA = (templates[a]?.label || a).trim();
            const labelB = (templates[b]?.label || b).trim();
            return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
        });
    }

    /** Resolve {projectName} and other placeholders for preview (same as apply). */
    function resolveTemplateSnapshot(template) {
        const replace = app.fileops.replaceTemplatePlaceholders;
        const treeText = replace(template?.tree || '');
        const files = {};
        Object.entries(template?.files || {}).forEach(([path, content]) => {
            files[replace(path)] = replace(content);
        });
        return { treeText, files };
    }

    function ensureSelectedTemplate() {
        const allTemplates = getAllTemplates();
        if (allTemplates[selectedTemplateName]) {return allTemplates[selectedTemplateName];}
        const keys = getSortedTemplateKeys(allTemplates);
        selectedTemplateName = keys[0] || 'node';
        selectedTemplateFile = '';
        return allTemplates[selectedTemplateName] || null;
    }

    function getPreviewablePaths(paths) {
        const isPreviewable = app.tree.isPreviewableFile;
        return paths.filter((p) => isPreviewable(p)).sort();
    }

    function getDefaultTemplateFile(files) {
        const paths = Object.keys(files || {});
        if (!paths.length) {return '';}
        const treePaths = app.tree.getFilePathsFromTree(
            app.helpers.parseEditorContent(
                app.fileops.replaceTemplatePlaceholders(
                    getAllTemplates()[selectedTemplateName]?.tree || ''
                )
            )
        );
        const treeSet = new Set(treePaths);
        const inTree = paths.filter((p) => treeSet.has(p));
        const previewableInTree = getPreviewablePaths(inTree);
        if (previewableInTree.length) {return previewableInTree[0];}
        const previewableAll = getPreviewablePaths(paths);
        if (previewableAll.length) {return previewableAll[0];}
        return paths.sort()[0] || '';
    }

    function paintTemplateTree(snapshot) {
        const preview = document.getElementById('templateTreePreview');
        if (!preview || !snapshot) {return;}
        preview.innerHTML = app.tree.renderTree(
            app.helpers.parseEditorContent(snapshot.treeText),
            '', '', 1, {
                collapsible: false,
                activeFilePath: selectedTemplateFile
            }
        );
        app.icons.refreshIcons(preview);
    }

    function applyTemplate(templateName) {
        const template = getAllTemplates()[templateName];
        if (!template) {return;}

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

    function renderTemplateModal() {
        const list = document.getElementById('templatesList');
        const allTemplates = getAllTemplates();
        const template = ensureSelectedTemplate();
        if (!template) {return;}

        const escapeHtml = app.helpers.escapeHtml;
        const customLabel = app.i18n.t('template_custom_badge');
        const snapshot = resolveTemplateSnapshot(template);

        if (list) {
            list.innerHTML = getSortedTemplateKeys(allTemplates).map((key) => {
                const active = key === selectedTemplateName ? ' active' : '';
                const label = allTemplates[key].label || key;
                const badge = isCustomTemplate(key)
                    ? `<span class="template-custom-badge">${escapeHtml(customLabel)}</span>`
                    : '';
                return `<button class="template-option${active}" data-template="${escapeHtml(key)}" role="option" aria-selected="${key === selectedTemplateName}"><span class="template-option-label">${escapeHtml(label)}</span>${badge}</button>`;
            }).join('');
        }

        if (!selectedTemplateFile || !Object.prototype.hasOwnProperty.call(snapshot.files, selectedTemplateFile)) {
            selectedTemplateFile = getDefaultTemplateFile(snapshot.files);
        }

        paintTemplateTree(snapshot);
        renderTemplateFilePreview(snapshot, selectedTemplateFile);
    }

    function renderTemplateFilePreview(snapshot, filePath) {
        if (!snapshot) {
            const template = getAllTemplates()[selectedTemplateName];
            snapshot = template ? resolveTemplateSnapshot(template) : null;
        }
        const content = snapshot?.files[filePath] ?? '';
        const fileNameEl = document.getElementById('templateFileName');
        const fileContentEl = document.getElementById('templateFileContent');
        if (fileNameEl) {
            fileNameEl.textContent = filePath || app.i18n.t('file_preview_empty');
        }
        if (fileContentEl) {
            fileContentEl.textContent = content;
        }
        selectedTemplateFile = filePath || '';
        if (snapshot) {paintTemplateTree(snapshot);}
    }

    function handleTemplateTreeClick(e) {
        const preview = document.getElementById('templateTreePreview');
        if (!preview) {return;}
        const item = e.target.closest('.tree-item');
        if (!item || item.dataset.type !== 'file') {return;}
        if (item.dataset.preview === 'disabled' || item.classList.contains('no-preview')) {return;}

        const template = getAllTemplates()[selectedTemplateName];
        if (!template) {return;}
        const snapshot = resolveTemplateSnapshot(template);
        const filePath = item.dataset.path;
        if (!Object.prototype.hasOwnProperty.call(snapshot.files, filePath)) {return;}
        renderTemplateFilePreview(snapshot, filePath);
    }

    function bindTemplateTreePreview() {
        const preview = document.getElementById('templateTreePreview');
        if (!preview || preview.dataset.boundClicks) {return;}
        preview.dataset.boundClicks = '1';
        preview.addEventListener('click', handleTemplateTreeClick);
    }

    function openTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        bindTemplateTreePreview();
        modal.style.display = 'flex';
        app.modals.trapFocus(modal);
        renderTemplateModal();
    }

    function slugifyTemplateName(name) {
        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return slug ? `custom-${slug}` : `custom-${Date.now()}`;
    }

    async function saveCurrentAsTemplate() {
        const S = app.state;
        if (!S?.editor || !S.editor.value.trim()) {
            app.toast.showToast(app.i18n.t('template_save_empty'), 3000);
            return;
        }

        const tree = app.tree.parseEditorContent(S.editor.value);
        app.fileops.syncFileContentsWithTree(tree);

        const defaultName = app.i18n.t('untitled');
        const name = await app.modals.showPromptAsync(
            app.i18n.t('template_name_prompt'),
            defaultName,
            app.i18n.t('save_as_template')
        );
        if (!name || !name.trim()) {return;}

        const label = name.trim();
        const key = slugifyTemplateName(label);
        const custom = loadCustomTemplates();
        const builtIn = app.templatesData;

        if (custom[key] || builtIn[key]) {
            const overwrite = await app.modals.showConfirmAsync(
                app.i18n.t('template_overwrite_msg'),
                app.i18n.t('confirm_title')
            );
            if (!overwrite) {return;}
        }

        custom[key] = {
            label,
            tree: S.editor.value,
            files: { ...S.fileContents }
        };
        saveCustomTemplates(custom);
        selectedTemplateName = key;
        const snapshot = resolveTemplateSnapshot(custom[key]);
        selectedTemplateFile = getDefaultTemplateFile(snapshot.files);
        renderTemplateModal();
        app.toast.showToast(app.i18n.t('template_saved'));
    }

    return {
        get selectedTemplateName() { return selectedTemplateName; },
        set selectedTemplateName(val) {
            selectedTemplateName = val;
            selectedTemplateFile = '';
        },
        getAllTemplates,
        resolveTemplateSnapshot,
        applyTemplate,
        renderTemplateModal,
        renderTemplateFilePreview,
        openTemplatesModal,
        saveCurrentAsTemplate,
        bindTemplateTreePreview
    };

}
