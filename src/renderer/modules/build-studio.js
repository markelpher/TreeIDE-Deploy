/**
 * Option C — full-screen creation studio (preview + options).
 */

import {
    BUILD_OUTPUT_MODES,
    bindBuildOptionsUi,
    getBuildOptionsElements,
    readBuildOptions,
    syncBuildOptionsUi
} from './build-options.js';

export function createBuildStudio(app) {

    const shared = () => app.buildShared;

    let finishStudio = null;
    let activeCleanup = null;
    let studioHasConflict = false;
    let restoreActiveTabId = null;
    let previewTabId = null;
    let previewFilePath = null;
    let excludedTabIds = new Set();

    const els = () => ({
        root: document.getElementById('buildStudio'),
        projectList: document.getElementById('buildStudioProjectList'),
        treeView: document.getElementById('buildStudioTreeView'),
        filePanel: document.getElementById('buildStudioFilePanel'),
        filePath: document.getElementById('buildStudioFilePath'),
        fileMode: document.getElementById('buildStudioFileMode'),
        fileEditor: document.getElementById('buildStudioFileEditor'),
        markdownPreview: document.getElementById('buildStudioMarkdownPreview'),
        stats: document.getElementById('buildStudioStats'),
        folderPath: document.getElementById('buildStudioFolderPath'),
        existingWarning: document.getElementById('buildStudioExistingWarning'),
        conflictSection: document.getElementById('buildStudioConflictSection'),
        conflictSkip: document.getElementById('buildStudioConflictSkip'),
        conflictOverwrite: document.getElementById('buildStudioConflictOverwrite'),
        conflictSkipLabel: document.getElementById('buildStudioConflictSkipLabel'),
        conflictOverwriteLabel: document.getElementById('buildStudioConflictOverwriteLabel'),
        alsoExportZipLabel: document.getElementById('buildStudioAlsoExportZipLabel'),
        cancelBtn: document.getElementById('buildStudioCancel'),
        createBtn: document.getElementById('buildStudioCreate'),
        chooseFolderBtn: document.getElementById('buildStudioChooseFolder'),
        closeBtn: document.getElementById('closeBuildStudio')
    });

    const t = (key) => shared().t(key);
    const format = (template, values) => shared().format(template, values);
    const escapeHtml = (v) => app.helpers.escapeHtml(v);

    function isOpen() {
        const { root } = els();
        return root && !root.hidden;
    }

    function getIncludedTabs() {
        return shared().getProjectTabsForBuildUi()
            .filter((tab) => !excludedTabIds.has(tab.id));
    }

    function getSelectedTabIds() {
        return getIncludedTabs().map((tab) => tab.id);
    }

    function excludeFromBuild(tabId) {
        const included = getIncludedTabs();
        if (included.length <= 1 || !included.some((tab) => tab.id === tabId)) {
            return;
        }
        excludedTabIds.add(tabId);
        if (previewTabId === tabId) {
            previewTabId = getIncludedTabs()[0]?.id || null;
        }
        renderProjectList();
        renderPreview();
        void refreshInspection();
    }

    function getSelectedPayloads() {
        return getSelectedTabIds()
            .map((id) => app.tabs.projectTabs.find((tab) => tab.id === id))
            .filter(Boolean)
            .map((tab) => shared().getTabBuildPayload(tab));
    }

    function getPreviewTab() {
        const tabs = getIncludedTabs();
        if (!tabs.length) { return null; }
        if (previewTabId) {
            const found = tabs.find((tab) => tab.id === previewTabId);
            if (found) { return found; }
        }
        return tabs[0];
    }

    function canBuildSelected() {
        const payloads = getSelectedPayloads();
        if (payloads.length === 0) { return false; }
        return payloads.every((payload) => {
            const { structuralErrors, isEmpty } = shared().getPayloadDisplayMeta(payload);
            return !isEmpty && structuralErrors.length === 0;
        });
    }

    function setOptionDisabled(label, input, disabled) {
        if (input) { input.disabled = disabled; }
        if (label) { label.classList.toggle('is-disabled', disabled); }
    }

    function updateActionState() {
        const ui = els();
        const optionEls = getBuildOptionsElements('buildStudio');
        const buildable = canBuildSelected();
        const buildOptions = readBuildOptions(optionEls);
        const needsFolder = buildOptions.outputMode === BUILD_OUTPUT_MODES.STRUCTURE;
        const hasFolder = Boolean(app.state.buildFolderPath);
        const canSubmit = buildable && (!needsFolder || hasFolder);
        const showConflictOptions = hasFolder && studioHasConflict;

        if (ui.createBtn) {
            ui.createBtn.disabled = !canSubmit;
        }

        if (ui.conflictSection) {
            ui.conflictSection.hidden = !showConflictOptions;
        }

        const optionsLocked = !buildable;
        const conflictLocked = optionsLocked || !showConflictOptions;
        setOptionDisabled(ui.conflictSkipLabel, ui.conflictSkip, conflictLocked);
        setOptionDisabled(ui.conflictOverwriteLabel, ui.conflictOverwrite, conflictLocked);
        setOptionDisabled(
            ui.alsoExportZipLabel,
            optionEls.alsoExportZip,
            optionsLocked || buildOptions.outputMode !== BUILD_OUTPUT_MODES.STRUCTURE
        );
        syncBuildOptionsUi(optionEls, { t, optionsLocked });
    }

    function renderProjectList() {
        const { projectList } = els();
        const availableTabs = shared().getProjectTabsForBuildUi();
        const tabs = getIncludedTabs();
        const headerMeta = document.querySelector('.build-studio-header-meta');

        if (!projectList) { return; }

        const showTabBar = shared().shouldShowBuildTabBar(availableTabs, excludedTabIds);

        if (!showTabBar) {
            projectList.hidden = true;
            projectList.innerHTML = '';
            headerMeta?.classList.remove('has-project-tabs');
            previewTabId = tabs[0]?.id || availableTabs[0]?.id || null;
            return;
        }

        if (previewTabId && !tabs.some((tab) => tab.id === previewTabId)) {
            previewTabId = tabs[0]?.id || null;
        }

        projectList.hidden = false;
        headerMeta?.classList.add('has-project-tabs');
        projectList.innerHTML = shared().renderBuildProjectTabBar(tabs, previewTabId, { escapeHtml });
        app.icons.refreshIcons(projectList);
    }

    function getPreviewPayload() {
        const tab = getPreviewTab();
        if (!tab) { return null; }
        return shared().getTabBuildPayload(tab);
    }

    function resolveStudioFileContent(filePath, fileContents) {
        if (fileContents[filePath] !== undefined) {
            return fileContents[filePath];
        }
        return app.fileops.getDefaultContentForFile(filePath);
    }

    function updateStudioMarkdownPreview(content, filePath) {
        const { markdownPreview } = els();
        if (!markdownPreview) { return; }
        if (filePath && app.fileops.isMarkdownFile(filePath)) {
            markdownPreview.innerHTML = app.markdown.renderMarkdown(content);
        } else {
            markdownPreview.innerHTML = '';
        }
    }

    function closeStudioFilePreview() {
        previewFilePath = null;
        const { filePanel, filePath, fileMode, fileEditor, markdownPreview } = els();
        if (filePanel) {
            filePanel.classList.remove('has-file', 'markdown-file');
        }
        if (filePath) { filePath.textContent = ''; }
        if (fileMode) { fileMode.textContent = ''; }
        if (fileEditor) { fileEditor.value = ''; }
        if (markdownPreview) { markdownPreview.innerHTML = ''; }
    }

    function openStudioFilePreview(filePath) {
        const payload = getPreviewPayload();
        if (!payload) { return; }

        const { isEmpty, structuralErrors } = shared().getPayloadDisplayMeta(payload);
        if (isEmpty || structuralErrors.length > 0) { return; }
        if (!app.tree.isPreviewableFile(filePath)) {
            closeStudioFilePreview();
            renderPreviewTree(payload);
            return;
        }

        previewFilePath = filePath;
        const content = resolveStudioFileContent(filePath, payload.fileContents);
        const isMarkdown = app.fileops.isMarkdownFile(filePath);
        const { filePanel, filePath: filePathEl, fileMode, fileEditor } = els();

        if (filePanel) {
            filePanel.classList.add('has-file');
            filePanel.classList.toggle('markdown-file', isMarkdown);
        }
        if (filePathEl) { filePathEl.textContent = filePath; }
        if (fileMode) { fileMode.textContent = app.fileops.getFileTypeLabel(filePath); }
        if (fileEditor) { fileEditor.value = content; }

        updateStudioMarkdownPreview(content, filePath);
        renderPreviewTree(payload);
    }

    function renderPreviewTree(payload) {
        const { treeView } = els();
        if (!treeView || !payload) { return; }

        const paths = app.tree.getFilePathsFromTree(payload.treeData);
        if (previewFilePath && !paths.includes(previewFilePath)) {
            closeStudioFilePreview();
        }

        treeView.innerHTML = app.tree.renderTree(payload.treeData, '', '', 1, {
            collapsible: false,
            activeFilePath: previewFilePath || '',
            focusable: false
        });
        app.icons.refreshIcons(treeView);
    }

    function refreshStudioFilePreview() {
        if (!previewFilePath) { return; }
        const payload = getPreviewPayload();
        if (!payload) {
            closeStudioFilePreview();
            return;
        }
        const paths = app.tree.getFilePathsFromTree(payload.treeData);
        if (!paths.includes(previewFilePath)) {
            closeStudioFilePreview();
            return;
        }
        const content = resolveStudioFileContent(previewFilePath, payload.fileContents);
        const { fileEditor } = els();
        if (fileEditor) { fileEditor.value = content; }
        updateStudioMarkdownPreview(content, previewFilePath);
    }

    function renderPreview() {
        const { treeView, stats } = els();
        const tab = getPreviewTab();

        if (!tab) {
            if (treeView) { treeView.innerHTML = ''; }
            if (stats) { stats.innerHTML = ''; }
            closeStudioFilePreview();
            updateActionState();
            return;
        }

        const payload = shared().getTabBuildPayload(tab);
        const { name, isEmpty, structuralErrors, detailText } = shared().getPayloadDisplayMeta(payload);
        const hasStructuralError = structuralErrors.length > 0;

        if (treeView) {
            if (isEmpty || hasStructuralError) {
                const emptyMessage = hasStructuralError
                    ? String(structuralErrors[0]?.message ?? t('build_studio_preview_empty'))
                    : t('build_studio_preview_empty');
                treeView.innerHTML = `<p class="build-studio-tree-empty">${escapeHtml(emptyMessage)}</p>`;
                closeStudioFilePreview();
            } else {
                renderPreviewTree(payload);
                refreshStudioFilePreview();
            }
        }

        if (stats) {
            stats.innerHTML =
                `<span class="build-studio-stat-name">${escapeHtml(name)}</span>` +
                `<span class="build-studio-stat-separator" aria-hidden="true">·</span>` +
                `<span class="build-studio-stat-detail">${escapeHtml(detailText)}</span>`;
        }

        const { projectList } = els();
        projectList?.querySelectorAll('.project-tab[data-tab-id]').forEach((row) => {
            const isActive = row.dataset.tabId === tab.id;
            row.classList.toggle('active', isActive);
            row.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        updateActionState();
    }

    function updateFolderDisplay() {
        const { folderPath } = els();
        const S = app.state;
        if (!folderPath) { return; }
        const label = S.buildFolderPath ? escapeHtml(S.buildFolderPath) : escapeHtml(t('no_folder_selected'));
        const cssClass = S.buildFolderPath ? 'build-studio-folder-path' : 'build-studio-folder-path empty';
        folderPath.innerHTML = `<div class="${cssClass}" title="${label}">${label}</div>`;
        updateActionState();
    }

    async function refreshInspection() {
        const { existingWarning, conflictSkip, conflictOverwrite } = els();
        const optionEls = getBuildOptionsElements('buildStudio');
        const buildOptions = readBuildOptions(optionEls);
        const targetPath = app.state.buildFolderPath || '';
        const buildable = canBuildSelected();

        if (!targetPath || !buildable) {
            studioHasConflict = false;
            if (existingWarning) { existingWarning.hidden = true; }
            updateActionState();
            return;
        }

        const inspectionResult = await shared().inspectPayloads(
            getSelectedPayloads(),
            targetPath,
            buildOptions
        );
        if (inspectionResult.error) {
            studioHasConflict = false;
            updateActionState();
            return;
        }

        studioHasConflict = inspectionResult.totalExisting > 0;

        if (existingWarning) {
            if (studioHasConflict) {
                existingWarning.hidden = false;
                existingWarning.textContent = shared().formatBuildExistingWarning(inspectionResult);
            } else {
                existingWarning.hidden = true;
            }
        }

        if (studioHasConflict && conflictSkip) {
            conflictSkip.checked = true;
        }
        if (conflictOverwrite) {
            conflictOverwrite.checked = false;
        }

        updateActionState();
    }

    let optionsBindingCleanup = null;

    function cleanupListeners(listeners) {
        listeners.forEach(({ el, event, handler }) => el?.removeEventListener(event, handler));
        optionsBindingCleanup?.();
        optionsBindingCleanup = null;
    }

    function completeStudio(result) {
        if (activeCleanup) {
            activeCleanup();
            activeCleanup = null;
        }
        closeStudioFilePreview();
        hide();
        if (restoreActiveTabId) {
            const targetId = restoreActiveTabId;
            restoreActiveTabId = null;
            if (app.tabs.projectTabs.some((tab) => tab.id === targetId)
                && app.tabs.activeProjectTabId !== targetId) {
                app.tabs.switchToTab(targetId);
            }
        }
        if (finishStudio) {
            const finish = finishStudio;
            finishStudio = null;
            finish(result);
        }
    }

    function show() {
        document.body.classList.add('build-studio-active');
        const dropOverlay = document.getElementById('dropOverlay');
        if (dropOverlay) {
            dropOverlay.classList.remove('show');
            dropOverlay.setAttribute('aria-hidden', 'true');
        }
        const { root } = els();
        if (root) {
            root.hidden = false;
            root.setAttribute('aria-hidden', 'false');
        }
    }

    function hide() {
        document.body.classList.remove('build-studio-active');
        const { root } = els();
        if (root) {
            root.hidden = true;
            root.setAttribute('aria-hidden', 'true');
        }
    }

    function requestClose(result = 'cancel') {
        if (!isOpen()) {
            completeStudio(result);
            return;
        }
        completeStudio(result);
    }

    async function handleCreate() {
        const ui = els();
        const optionEls = getBuildOptionsElements('buildStudio');
        const buildOptions = readBuildOptions(optionEls);
        if (!canBuildSelected()) { return; }

        if (ui.createBtn) { ui.createBtn.disabled = true; }

        try {
            const payloads = getSelectedPayloads();
            if (!shared().validatePayloads(payloads)) { return; }

            let targetPath = app.state.buildFolderPath;
            if (buildOptions.outputMode === BUILD_OUTPUT_MODES.STRUCTURE) {
                if (!targetPath) {
                    targetPath = await app.fileops.ensureBuildFolderPath();
                    if (!targetPath) { return; }
                    updateFolderDisplay();
                    await refreshInspection();
                }
            }

            const conflictMode = ui.conflictOverwrite?.checked ? 'overwrite' : 'skip';
            const ok = await shared().runBuild({
                payloads,
                targetPath,
                conflictMode,
                ...buildOptions
            });
            if (ok) { requestClose('success'); }
        } finally {
            updateActionState();
        }
    }

    function open() {
        return new Promise((resolve) => {
            const ui = els();
            if (!ui.root) { resolve('cancel'); return; }

            if (isOpen()) {
                completeStudio('cancel');
            }

            restoreActiveTabId = app.tabs.activeProjectTabId;
            app.tabs.saveCurrentTabState();

            let settled = false;
            finishStudio = (result) => {
                if (settled) { return; }
                settled = true;
                resolve(result);
            };

            studioHasConflict = false;
            excludedTabIds = new Set();
            const visibleTabs = shared().getProjectTabsForBuildUi();
            const activeId = app.tabs.activeProjectTabId;
            previewTabId = (activeId && visibleTabs.some((tab) => tab.id === activeId))
                ? activeId
                : (visibleTabs[0]?.id || null);
            previewFilePath = null;
            closeStudioFilePreview();

            const optionEls = getBuildOptionsElements('buildStudio');
            if (optionEls.outputModeStructure) { optionEls.outputModeStructure.checked = true; }
            if (optionEls.alsoExportZip) { optionEls.alsoExportZip.checked = false; }
            if (optionEls.includeTreeInZip) { optionEls.includeTreeInZip.checked = false; }
            [optionEls.zipPassword, optionEls.zipPasswordConfirm, optionEls.treePassword, optionEls.treePasswordConfirm]
                .forEach((input) => { if (input) { input.value = ''; } });
            syncBuildOptionsUi(optionEls, { t });

            renderProjectList();
            renderPreview();
            updateFolderDisplay();
            void refreshInspection();

            show();
            app.icons.refreshIcons(ui.root);
            if (ui.createBtn && !ui.createBtn.disabled) {
                ui.createBtn.focus();
            } else {
                ui.cancelBtn?.focus();
            }

            const listeners = [];
            optionsBindingCleanup = bindBuildOptionsUi('buildStudio', {
                t,
                onChange: () => {
                    updateActionState();
                    void refreshInspection();
                }
            }).cleanup;

            const onProjectListClick = (e) => {
                const closeBtn = e.target.closest('[data-build-close-tab-id]');
                if (closeBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    excludeFromBuild(closeBtn.dataset.buildCloseTabId);
                    return;
                }
                const row = e.target.closest('.project-tab[data-tab-id]');
                if (!row || row.dataset.tabId === previewTabId) { return; }
                previewTabId = row.dataset.tabId;
                renderPreview();
                void refreshInspection();
            };
            if (ui.projectList) {
                ui.projectList.addEventListener('click', onProjectListClick);
                listeners.push({ el: ui.projectList, event: 'click', handler: onProjectListClick });
            }

            const onChooseFolder = async () => {
                await app.fileops.chooseBuildFolder();
                updateFolderDisplay();
                await refreshInspection();
            };
            if (ui.chooseFolderBtn) {
                ui.chooseFolderBtn.addEventListener('click', onChooseFolder);
                listeners.push({ el: ui.chooseFolderBtn, event: 'click', handler: onChooseFolder });
            }

            const onTreeClick = (e) => {
                const item = e.target.closest('.tree-item');
                if (!item || !ui.treeView?.contains(item)) { return; }

                if (item.dataset.type === 'folder') { return; }
                if (item.dataset.preview === 'disabled') {
                    closeStudioFilePreview();
                    const payload = getPreviewPayload();
                    if (payload) { renderPreviewTree(payload); }
                    return;
                }
                openStudioFilePreview(item.dataset.path);
            };
            if (ui.treeView) {
                ui.treeView.addEventListener('click', onTreeClick);
                listeners.push({ el: ui.treeView, event: 'click', handler: onTreeClick });
            }

            const onCancel = () => requestClose('cancel');
            const onCreate = () => handleCreate();

            if (ui.cancelBtn) {
                ui.cancelBtn.addEventListener('click', onCancel);
                listeners.push({ el: ui.cancelBtn, event: 'click', handler: onCancel });
            }
            if (ui.closeBtn) {
                ui.closeBtn.addEventListener('click', onCancel);
                listeners.push({ el: ui.closeBtn, event: 'click', handler: onCancel });
            }
            if (ui.createBtn) {
                ui.createBtn.addEventListener('click', onCreate);
                listeners.push({ el: ui.createBtn, event: 'click', handler: onCreate });
            }

            const onKeydown = (e) => {
                if (e.key === 'Escape' && isOpen()) {
                    e.preventDefault();
                    requestClose('cancel');
                }
            };
            document.addEventListener('keydown', onKeydown);
            listeners.push({ el: document, event: 'keydown', handler: onKeydown });

            activeCleanup = () => cleanupListeners(listeners);
        });
    }

    return {
        open,
        requestClose,
        isOpen
    };

}