export function createShell(app) {

function resolveThemePreference(val) {
    if (val === 'system') {
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return val === 'light' ? 'light' : 'dark';
}

function handleThemeChange(val) {
    const resolved = resolveThemePreference(val);
    document.body.classList.toggle('light-theme', resolved === 'light');
    localStorage.setItem('theme', val);
    const ts = document.getElementById('themeSelect');
    if (ts) { ts.value = val; }
    const wts = document.getElementById('welcomeThemeSelect');
    if (wts) { wts.value = val; }
}

function bindSystemThemeListener() {
    if (window.__treeideThemeMediaBound) { return; }
    window.__treeideThemeMediaBound = true;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
        const stored = localStorage.getItem('theme') || 'dark';
        if (stored === 'system') { handleThemeChange('system'); }
    };
    if (media.addEventListener) { media.addEventListener('change', onChange); }
    else { media.addListener(onChange); }
}

function setUpdateChannel(channel) {
    const ch = channel === 'beta' ? 'beta' : 'stable';
    localStorage.setItem('update_channel', ch);
    if (app.electronAPI?.setUpdateChannel) { app.electronAPI.setUpdateChannel(ch); }
    syncUpdateChannelCards();
}

function syncUpdateChannelCards() {
    const ch = localStorage.getItem('update_channel') || 'stable';
    document.querySelectorAll('.update-channel-card').forEach((card) => {
        const active = card.dataset.channel === ch;
        card.classList.toggle('active', active);
        card.setAttribute('aria-checked', String(active));
    });
}

function syncLanguageControls() {
    if (!app.i18n) { return; }
    const currentLang = app.i18n.getCurrentLang();
    const langSelect = document.getElementById('langSelect');
    if (langSelect) { langSelect.value = currentLang; }
    const welcomeLangSelect = document.getElementById('welcomeLangSelect');
    if (welcomeLangSelect) { welcomeLangSelect.value = currentLang; }
}

function handleLangChange(val) {
    const S = app.state;
    const { DEFAULT_PROJECT_NAMES } = app.editor;
    const nameSpan = S.fileNameEl;
    const shouldTranslateProjectName = !S.currentFilePath && nameSpan && DEFAULT_PROJECT_NAMES.includes(nameSpan.textContent.trim());

    if (app.i18n) { app.i18n.setLanguage(val); }
    syncLanguageControls();

    if (app.customSelect?.refreshAll) {
        app.customSelect.refreshAll();
    }
    if (app.validation?.updateValidationPanel) {
        app.validation.updateValidationPanel();
    }
    syncUpdateChannelCards();
    if (app.shortcuts?.renderShortcutsTable) {
        app.shortcuts.renderShortcutsTable();
    }

    document.documentElement.lang = val === 'pt' ? 'pt-br' : 'en';

    if (shouldTranslateProjectName && nameSpan) {
        app.editor.updateFileNameDisplay(app.i18n.t('untitled'));
    }

    if (app.tabs && Array.isArray(app.tabs.projectTabs)) {
        const newUntitled = app.i18n.t('untitled');
        let tabsChanged = false;
        app.tabs.projectTabs.forEach((tab) => {
            if (DEFAULT_PROJECT_NAMES.includes(tab.name)) {
                tab.name = newUntitled;
                tabsChanged = true;
            }
        });
        if (tabsChanged) {
            app.tabs.renderProjectTabBar();
            app.tabs.saveTabsToStorage();
        }
    }

    app.fileops.persistFileContents();

    if (S.activePreviewPath) {
        const defaultLangs = app.fileops.getDefaultFileLangs();
        const oldLang = defaultLangs[S.activePreviewPath];
        if (oldLang && oldLang !== val) {
            const regenerated = app.fileops.getDefaultContentForFile(S.activePreviewPath);
            S.fileContents[S.activePreviewPath] = regenerated;
            defaultLangs[S.activePreviewPath] = val;
            S.filePreviewEditor.value = regenerated;
        } else if (S.fileContents[S.activePreviewPath] !== undefined) {
            S.filePreviewEditor.value = S.fileContents[S.activePreviewPath];
        }
        app.editor.updateMarkdownPreview();
    }

    app.fileops.updateBuildFolderDisplay();
    app.validation.updateValidationPanel();

    if (S.activePreviewPath && S.filePreviewMode) {
        S.filePreviewMode.textContent = app.fileops.getFileTypeLabel(S.activePreviewPath);
    }
}

function bindThemeAndLanguageControls() {
    const themeSelectElement = document.getElementById('themeSelect');
    const welcomeThemeSelect = document.getElementById('welcomeThemeSelect');
    const langSelect = document.getElementById('langSelect');
    const welcomeLangSelect = document.getElementById('welcomeLangSelect');
    const sessionSelect = document.getElementById('sessionSelect');
    const welcomeSessionSelect = document.getElementById('welcomeSessionSelect');

    if (langSelect) {
        langSelect.addEventListener('change', (e) => {
            handleLangChange(e.target.value);
            syncLanguageControls();
        });
    }
    if (welcomeLangSelect) {
        welcomeLangSelect.addEventListener('change', (e) => {
            handleLangChange(e.target.value);
            syncLanguageControls();
        });
    }
    syncLanguageControls();

    if (themeSelectElement) {
        themeSelectElement.addEventListener('change', (e) => handleThemeChange(e.target.value));
    }
    if (welcomeThemeSelect) {
        welcomeThemeSelect.addEventListener('change', (e) => handleThemeChange(e.target.value));
    }

    if (sessionSelect) {
        sessionSelect.addEventListener('change', (e) => {
            localStorage.setItem('session_mode', e.target.value);
            if (welcomeSessionSelect) { welcomeSessionSelect.value = e.target.value; }
        });
    }
    if (welcomeSessionSelect) {
        welcomeSessionSelect.addEventListener('change', (e) => {
            localStorage.setItem('session_mode', e.target.value);
            if (sessionSelect) { sessionSelect.value = e.target.value; }
        });
    }

    syncUpdateChannelCards();
    document.querySelectorAll('.update-channel-card').forEach((card) => {
        card.addEventListener('click', () => setUpdateChannel(card.dataset.channel));
    });

    bindSystemThemeListener();
}

function applySavedThemeAndZoom() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    handleThemeChange(savedTheme);
    const themeSelectElement = document.getElementById('themeSelect');
    if (themeSelectElement) { themeSelectElement.value = savedTheme; }

    const savedZoom = parseFloat(localStorage.getItem('zoom_level')) || 1;
    app.editor.applyZoom(savedZoom);

    const sessionMode = localStorage.getItem('session_mode') || 'restore';
    const sessionSelect = document.getElementById('sessionSelect');
    if (sessionSelect) { sessionSelect.value = sessionMode; }
    const welcomeSessionSelect = document.getElementById('welcomeSessionSelect');
    if (welcomeSessionSelect) { welcomeSessionSelect.value = sessionMode; }

    const savedChannel = localStorage.getItem('update_channel') || 'stable';
    if (app.electronAPI?.setUpdateChannel) {
        app.electronAPI.setUpdateChannel(savedChannel);
    }
}

function bindExternalFileDrop() {
    const { showToast } = app.toast;
    const dropOverlay = document.getElementById('dropOverlay');
    let dragCounter = 0;

    const isFileDropDisabled = () => document.body.classList.contains('build-studio-active');

    const isExternalFileDrag = (e) => {
        const types = e.dataTransfer?.types;
        if (!types) { return false; }
        return Array.from(types).includes('Files');
    };

    document.addEventListener('dragenter', (e) => {
        if (isFileDropDisabled() || !isExternalFileDrag(e)) { return; }
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        if (dropOverlay) {
            dropOverlay.classList.add('show');
            dropOverlay.setAttribute('aria-hidden', 'false');
        }
    });

    document.addEventListener('dragleave', (e) => {
        if (isFileDropDisabled() || !isExternalFileDrag(e)) { return; }
        e.preventDefault();
        e.stopPropagation();
        dragCounter = Math.max(0, dragCounter - 1);
        if (dragCounter === 0 && dropOverlay) {
            dropOverlay.classList.remove('show');
            dropOverlay.setAttribute('aria-hidden', 'true');
        }
    });

    document.addEventListener('dragover', (e) => {
        if (isFileDropDisabled() || !isExternalFileDrag(e)) { return; }
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('drop', async (e) => {
        if (isFileDropDisabled() || !isExternalFileDrag(e)) { return; }
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        if (dropOverlay) {
            dropOverlay.classList.remove('show');
            dropOverlay.setAttribute('aria-hidden', 'true');
        }

        const files = e.dataTransfer.files;
        if (files.length === 0) { return; }
        const file = files[0];
        const archiveExtensions = ['.zip', '.tar', '.gz', '.tgz', '.rar', '.7z', '.bz2', '.xz', '.tbz2', '.txz', '.zst', '.cab', '.iso', '.dmg', '.lz', '.lzma', '.z'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        const isArchive = archiveExtensions.includes(ext);

        try {
            const filePath = app.electronAPI.getFilePath(file);
            if (isArchive || file.name.toLowerCase().endsWith('.tree')) {
                await app.loadProject.loadProjectFromPath(app, filePath);
            } else {
                showToast(app.i18n.t('invalid_file_type') || 'Unsupported file type');
            }
        } catch (err) {
            const msg = (app.i18n.t('file_load_error_with_message') || 'Error loading file: {message}')
                .replace('{message}', err?.message || String(err));
            showToast(msg, 5000);
        }
    });
}

function bindMenuBar() {
    const menuItems = document.querySelectorAll('.menu-item');
    const dropdowns = document.querySelectorAll('.dropdown-content');
    menuItems.forEach(item => {
        const label = item.querySelector('.menu-label');
        const dropdown = item.querySelector('.dropdown-content');
        if (label && dropdown) {
            label.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdowns.forEach(d => { if (d !== dropdown) { d.classList.remove('show'); } });
                menuItems.forEach(i => { if (i !== item) { i.classList.remove('active'); } });
                dropdown.classList.toggle('show');
                item.classList.toggle('active');
            });
        }
    });
    window.addEventListener('click', () => {
        dropdowns.forEach(d => d.classList.remove('show'));
        menuItems.forEach(i => i.classList.remove('active'));
    });
}

function bindMenuActions() {
    const editor = app.state.editor;
    const { showToast } = app.toast;
    const { setZoomLevel, getCurrentZoom, ZOOM_STEP } = app.editor;

    const menuNew = document.getElementById('menu-new');
    if (menuNew) {
        menuNew.addEventListener('click', () => app.tabs.createTab({ name: app.i18n.t('untitled') }));
    }
    const menuOpen = document.getElementById('menu-open');
    if (menuOpen) {
        menuOpen.addEventListener('click', () => app.fileops.handleLoadUnified());
    }
    const codeTabList = document.getElementById('codeTabList');
    if (codeTabList) {
        codeTabList.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.code-tab-close');
            if (closeBtn) {
                e.stopPropagation();
                app.tabs.closeFileTab(closeBtn.dataset.closeFilePath);
                return;
            }
            const tabEl = e.target.closest('.code-tab');
            if (tabEl) { app.tabs.switchToFileTab(tabEl.dataset.filePath); }
        });
    }
    const menuSave = document.getElementById('menu-save');
    if (menuSave) {
        menuSave.addEventListener('click', () => app.fileops.saveProject());
    }
    const menuSaveAs = document.getElementById('menu-save-as');
    if (menuSaveAs) {
        menuSaveAs.addEventListener('click', () => app.fileops.saveProject(true));
    }
    const menuSaveAll = document.getElementById('menu-save-all');
    if (menuSaveAll) {
        menuSaveAll.addEventListener('click', async () => {
            for (const tab of app.tabs.projectTabs) {
                if (!tab.isModified) { continue; }
                if (tab.id !== app.tabs.activeProjectTabId) {
                    app.tabs.switchToTab(tab.id);
                }
                await app.fileops.saveProject();
            }
        });
    }
    const menuUndo = document.getElementById('menu-undo');
    if (menuUndo) {
        menuUndo.addEventListener('click', () => {
            if (document.activeElement === editor) { app.undoredo.performUndo(); return; }
            const el = document.activeElement;
            if (el && (el.tagName === 'TEXTAREA' || el.isContentEditable)) {
                el.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
            }
        });
    }
    const menuRedo = document.getElementById('menu-redo');
    if (menuRedo) {
        menuRedo.addEventListener('click', () => {
            if (document.activeElement === editor) { app.undoredo.performRedo(); return; }
            const el = document.activeElement;
            if (el && (el.tagName === 'TEXTAREA' || el.isContentEditable)) {
                el.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
            }
        });
    }
    const menuCut = document.getElementById('menu-cut');
    if (menuCut) {
        menuCut.addEventListener('click', async () => {
            const el = document.activeElement;
            if (!el) { return; }
            const start = el.selectionStart;
            const end = el.selectionEnd;
            const text = el.value?.substring(start, end);
            if (text) {
                try { await navigator.clipboard.writeText(text); } catch { return; }
                el.value = el.value.substring(0, start) + el.value.substring(end);
                el.selectionStart = el.selectionEnd = start;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }
    const menuCopy = document.getElementById('menu-copy');
    if (menuCopy) {
        menuCopy.addEventListener('click', async () => {
            const el = document.activeElement;
            if (!el) { return; }
            const text = el.value?.substring(el.selectionStart, el.selectionEnd);
            if (text) {
                try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
            }
        });
    }
    const menuPaste = document.getElementById('menu-paste');
    if (menuPaste) {
        menuPaste.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (!text) { return; }
                const el = document.activeElement;
                if (el && el.tagName === 'TEXTAREA') {
                    const start = el.selectionStart;
                    el.value = el.value.substring(0, start) + text + el.value.substring(el.selectionEnd);
                    el.selectionStart = el.selectionEnd = start + text.length;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch {
                showToast(app.i18n.t('clipboard_error'));
            }
        });
    }
    const menuReload = document.getElementById('menu-reload');
    if (menuReload) {
        menuReload.addEventListener('click', () => app.electronAPI?.windowReload());
    }
    const menuFullscreen = document.getElementById('menu-fullscreen');
    if (menuFullscreen) {
        menuFullscreen.addEventListener('click', () => {
            document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        });
    }
    const menuZoomIn = document.getElementById('menu-zoom-in');
    if (menuZoomIn) {
        menuZoomIn.addEventListener('click', () => setZoomLevel(getCurrentZoom() + ZOOM_STEP));
    }
    const menuZoomOut = document.getElementById('menu-zoom-out');
    if (menuZoomOut) {
        menuZoomOut.addEventListener('click', () => setZoomLevel(getCurrentZoom() - ZOOM_STEP));
    }
    const menuZoomReset = document.getElementById('menu-zoom-reset');
    if (menuZoomReset) {
        menuZoomReset.addEventListener('click', () => setZoomLevel(1));
    }
    const menuMinimize = document.getElementById('menu-minimize');
    if (menuMinimize) {
        menuMinimize.addEventListener('click', () => app.electronAPI?.windowMinimize());
    }
    const menuCloseWin = document.getElementById('menu-close-win');
    if (menuCloseWin) {
        menuCloseWin.addEventListener('click', () => app.electronAPI?.windowClose());
    }
    const menuExit = document.getElementById('menu-exit');
    if (menuExit) {
        menuExit.addEventListener('click', () => app.electronAPI?.windowClose());
    }

    const templatesBtn = document.getElementById('templatesBtn');
    if (templatesBtn) {
        templatesBtn.addEventListener('click', () => app.templates.openTemplatesModal());
    }
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
        loadBtn.addEventListener('click', () => app.fileops.handleLoadUnified());
    }
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => await app.fileops.saveProject());
    }
    const exportZipBtn = document.getElementById('exportZipBtn');
    if (exportZipBtn) {
        exportZipBtn.addEventListener('click', () => app.fileops.exportCurrentTreeAsZip());
    }

    const chooseBuildFolderBtn = document.getElementById('chooseBuildFolderBtn');
    if (chooseBuildFolderBtn) {
        chooseBuildFolderBtn.addEventListener('click', () => app.fileops.chooseBuildFolder());
    }
    const welcomeChooseBuildFolderBtn = document.getElementById('welcomeChooseBuildFolderBtn');
    if (welcomeChooseBuildFolderBtn) {
        welcomeChooseBuildFolderBtn.addEventListener('click', () => app.fileops.chooseBuildFolder());
    }
    const clearBuildFolderBtn = document.getElementById('clearBuildFolderBtn');
    if (clearBuildFolderBtn) {
        clearBuildFolderBtn.addEventListener('click', () => app.fileops.setBuildFolderPath(''));
    }

    return {
        menuNew,
        menuOpen,
        menuSaveAll,
        menuFullscreen,
        menuReload,
        menuZoomIn,
        menuZoomOut,
        menuZoomReset,
        createBtn: document.getElementById('createBtn')
    };
}

function bindKeyboardShortcuts(menuRefs) {
    const fileNameEl = app.state.fileNameEl;
    const { applyEditorIndent, switchAdjacentTab } = app.editor;

    document.addEventListener('keydown', (e) => {
        if (document.body.classList.contains('build-studio-active')) {
            return;
        }
        if (app.shortcuts?.isCapturing) {
            if (app.shortcuts.handleCaptureKeydown(e)) { return; }
        }
        const openModal = document.querySelector('.modal[style*="display: flex"]');
        if (openModal && openModal.id !== 'confirmModal' && openModal.id !== 'promptModal') {
            return;
        }
        const focusedEl = document.activeElement;
        const treeEditor = app.state.editor;
        const filePreviewEditor = app.state.filePreviewEditor;
        const inTreeEditor = focusedEl === treeEditor;
        const inFilePreview = focusedEl === filePreviewEditor || focusedEl === fileNameEl;

        if ((inTreeEditor || inFilePreview) && e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            return;
        }

        const action = app.shortcuts?.getActionForEvent?.(e);
        if (!action) {
            if (e.key === 'F2') {
                e.preventDefault();
                const activeTab = app.tabs.getActiveTab();
                if (activeTab) {
                    const nameEl = document.querySelector(`.project-tab-name[data-tab-id="${activeTab.id}"]`);
                    if (nameEl) { app.tabs._startRename(nameEl, activeTab.id); }
                }
                return;
            }
            if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < app.tabs.projectTabs.length) {
                    e.preventDefault();
                    app.tabs.switchToTab(app.tabs.projectTabs[index].id);
                }
            }
            return;
        }
        switch (action) {
            case 'new_project': e.preventDefault(); menuRefs.menuNew?.click(); break;
            case 'open_project': e.preventDefault(); menuRefs.menuOpen?.click(); break;
            case 'save_project': e.preventDefault(); app.fileops.saveProject(false); break;
            case 'save_as': e.preventDefault(); app.fileops.saveProject(true); break;
            case 'save_all': e.preventDefault(); menuRefs.menuSaveAll?.click(); break;
            case 'build': e.preventDefault(); menuRefs.createBtn?.click(); break;
            case 'undo':
                e.preventDefault();
                if (inTreeEditor) { app.undoredo.performUndo(); }
                else if (inFilePreview) {
                    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true }));
                }
                break;
            case 'redo':
                e.preventDefault();
                if (inTreeEditor) { app.undoredo.performRedo(); }
                else if (inFilePreview) {
                    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true }));
                }
                break;
            case 'fullscreen': e.preventDefault(); menuRefs.menuFullscreen?.click(); break;
            case 'reload': e.preventDefault(); menuRefs.menuReload?.click(); break;
            case 'zoom_in': e.preventDefault(); menuRefs.menuZoomIn?.click(); break;
            case 'zoom_out': e.preventDefault(); menuRefs.menuZoomOut?.click(); break;
            case 'zoom_reset': e.preventDefault(); menuRefs.menuZoomReset?.click(); break;
            case 'new_tab': e.preventDefault(); app.tabs.createTab(); break;
            case 'next_tab':
            case 'prev_tab':
                if (app.tabs.projectTabs.length <= 1) { break; }
                e.preventDefault();
                switchAdjacentTab(action === 'prev_tab');
                break;
            case 'close_tab':
                e.preventDefault();
                {
                    const tab = app.tabs.getActiveTab();
                    if (tab) {
                        if (app.tabs.projectTabs.length <= 1) {
                            app.electronAPI?.windowClose();
                        } else {
                            void app.tabs.closeTab(tab.id);
                        }
                    }
                }
                break;
            case 'close_file_tab':
                e.preventDefault();
                {
                    const tab = app.tabs.getActiveTab();
                    if (tab?.activeFileTabPath) {
                        app.tabs.closeFileTab(tab.activeFileTabPath);
                    }
                }
                break;
            case 'close_window': e.preventDefault(); app.electronAPI?.windowClose(); break;
            case 'indent':
            case 'outdent':
                if (inTreeEditor) {
                    e.preventDefault();
                    applyEditorIndent(action === 'outdent');
                }
                break;
        }
    });
}

function bindModals() {
    const savePromptBtn = document.getElementById('savePromptBtn');
    const cancelPromptBtn = document.getElementById('cancelPromptBtn');
    const closePromptModalBtn = document.getElementById('closePromptModal');
    const promptInputEl = document.getElementById('promptInput');
    const submitPrompt = () => {
        const value = promptInputEl ? promptInputEl.value : '';
        app.modals.closePromptModal(value);
    };
    if (savePromptBtn) { savePromptBtn.addEventListener('click', submitPrompt); }
    if (cancelPromptBtn) { cancelPromptBtn.addEventListener('click', () => app.modals.closePromptModal(null)); }
    if (closePromptModalBtn) { closePromptModalBtn.addEventListener('click', () => app.modals.closePromptModal(null)); }
    if (promptInputEl) {
        promptInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitPrompt();
            }
        });
    }

    const agreeConfirmBtn = document.getElementById('agreeConfirmBtn');
    if (agreeConfirmBtn) {
        agreeConfirmBtn.addEventListener('click', () => {
            app.modals.settleConfirm(true);
        });
    }
    const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
    if (cancelConfirmBtn) {
        cancelConfirmBtn.addEventListener('click', () => {
            app.modals.settleConfirm(false);
        });
    }
    const closeConfirmModal = document.getElementById('closeConfirmModal');
    if (closeConfirmModal) {
        closeConfirmModal.addEventListener('click', () => {
            app.modals.settleConfirm(false);
        });
    }

    const closeTemplatesModal = document.getElementById('closeTemplatesModal');
    if (closeTemplatesModal) {
        closeTemplatesModal.addEventListener('click', () => {
            app.modals.closeModalAnimated(document.getElementById('templatesModal'));
        });
    }
    const useTemplateBtn = document.getElementById('useTemplateBtn');
    if (useTemplateBtn) {
        useTemplateBtn.addEventListener('click', () => {
            app.templates.applyTemplate(app.templates.selectedTemplateName);
            app.modals.closeModalAnimated(document.getElementById('templatesModal'));
        });
    }
    const templatesList = document.getElementById('templatesList');
    if (templatesList) {
        templatesList.addEventListener('click', (e) => {
            const btn = e.target.closest('.template-option');
            if (!btn) { return; }
            app.templates.selectedTemplateName = btn.dataset.template;
            app.templates.renderTemplateModal();
        });
    }
    app.templates.bindTemplateTreePreview();

    const startBtn = document.getElementById('startBtn');
    const saveCustomTemplateBtn = document.getElementById('saveCustomTemplateBtn');
    if (saveCustomTemplateBtn) {
        saveCustomTemplateBtn.addEventListener('click', () => { void app.templates.saveCurrentAsTemplate(); });
    }
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            app.modals.closeModalAnimated(document.getElementById('welcomeModal'), {
                onClosed: () => { localStorage.setItem('onboarding_done', 'true'); }
            });
            const welcomeSessionSelect = document.getElementById('welcomeSessionSelect');
            if (welcomeSessionSelect) {
                localStorage.setItem('session_mode', welcomeSessionSelect.value);
            }
            const ri = app.modals.latestReleaseUpdate;
            if (ri) {
                setTimeout(() => app.modals.showReleaseUpdateModal(ri), 3000);
            }
        });
    }

    const menuSettings = document.getElementById('menu-settings');
    if (menuSettings) {
        menuSettings.addEventListener('click', () => {
            const ft = document.querySelector('.sidebar-tab');
            if (ft) { ft.click(); }
            const m = document.getElementById('settingsModal');
            m.style.display = 'flex';
            syncLanguageControls();
            if (app.customSelect?.refreshAll) {
                app.customSelect.refreshAll();
            }
            app.icons.refreshIcons(m);
            app.modals.trapFocus(m);
            void app.modals.initializeAppInfo();
        });
    }
    const closeSettings = document.getElementById('closeSettings');
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            app.modals.closeModalAnimated(document.getElementById('settingsModal'));
        });
    }
    const menuCredits = document.getElementById('menu-credits');
    if (menuCredits) {
        menuCredits.addEventListener('click', () => {
            const m = document.getElementById('aboutModal');
            m.style.display = 'flex';
            app.modals.trapFocus(m);
            void app.modals.initializeAppInfo();
        });
    }
    const closeAbout = document.getElementById('closeAbout');
    if (closeAbout) {
        closeAbout.addEventListener('click', () => {
            app.modals.closeModalAnimated(document.getElementById('aboutModal'));
        });
    }
    const closeUnsavedModal = document.getElementById('closeUnsavedModal');
    if (closeUnsavedModal) {
        closeUnsavedModal.addEventListener('click', () => {
            app.modals.closeModalAnimated(document.getElementById('unsavedModal'));
        });
    }
    const saveUnsavedBtn = document.getElementById('saveUnsavedBtn');
    if (saveUnsavedBtn) {
        saveUnsavedBtn.addEventListener('click', async () => {
            if (await app.fileops.saveProject()) {
                app.electronAPI.forceClose();
            }
        });
    }
    const dontSaveUnsavedBtn = document.getElementById('dontSaveUnsavedBtn');
    if (dontSaveUnsavedBtn) {
        dontSaveUnsavedBtn.addEventListener('click', () => {
            const keys = ['autosave_tabs', 'autosave_path', 'autosave_project_name', 'autosave_file_contents', 'temp_content', 'temp_path'];
            keys.forEach(k => localStorage.removeItem(k));
            if (app.dbStorage) {
                keys.forEach(k => app.dbStorage.remove(k).catch((err) => console.warn('Failed to remove ' + k + ':', err)));
            }
            app.electronAPI.forceClose();
        });
    }
}

function bindUpdateSettings() {
    const autoCheckToggle = document.getElementById('autoCheckUpdatesToggle');
    if (autoCheckToggle) {
        autoCheckToggle.addEventListener('change', (e) => {
            localStorage.setItem('auto_check_updates', String(e.target.checked));
        });
    }
    const checkUpdateBtn = document.getElementById('checkUpdateBtn');
    if (checkUpdateBtn) {
        checkUpdateBtn.addEventListener('click', async () => {
            if (app.electronAPI?.checkReleaseUpdate) {
                checkUpdateBtn.disabled = true;
                checkUpdateBtn.textContent = app.i18n.t('checking_updates') || 'Checking...';
                try {
                    const result = await app.electronAPI.checkReleaseUpdate();
                    app.modals.handleUpdateCheckResult(result);
                } catch (e) {
                    console.warn('Release update check failed:', e);
                }
                checkUpdateBtn.disabled = false;
                checkUpdateBtn.textContent = app.i18n.t('check_updates') || 'Check for updates';
            }
        });
    }
}

function bindAll() {
    bindMenuBar();
    const menuRefs = bindMenuActions();
    bindKeyboardShortcuts(menuRefs);
    bindModals();
    bindUpdateSettings();
    app.fileops.bindBuildButton();
    bindThemeAndLanguageControls();
    app.editor.bindEditorInput();
    app.editor.bindZoomWheel();
    app.editor.bindTreeViewClicks();
    app.editor.bindPreviewEditor();
    app.panelResize?.init();
    bindExternalFileDrop();
}

const SESSION_AUTOSAVE_MS = 30000;
const LEGACY_AUTOSAVE_KEYS = ['autosave_content', 'temp_content', 'temp_path'];

async function restoreSession() {
    const S = app.state;
    const currentSessionMode = localStorage.getItem('session_mode') || 'restore';

    if (currentSessionMode === 'clean') {
        const keys = ['autosave_tabs', 'autosave_path', 'autosave_project_name', 'autosave_file_contents', 'panel_layout', ...LEGACY_AUTOSAVE_KEYS];
        keys.forEach(k => localStorage.removeItem(k));
        app.panelResize?.resetToDefaults();
        if (app.dbStorage) {
            app.dbStorage.remove('autosave_tabs').catch((err) => console.warn('Failed to clear autosave tabs:', err));
            app.dbStorage.remove('autosave_file_contents').catch((err) => console.warn('Failed to clear autosave file contents:', err));
        }
        S.fileContents = {};
        app.tabs.createTab({ name: app.i18n.t('untitled') });
        return;
    }

    let tabsLoaded = app.tabs.loadTabsFromStorage();
    if (!tabsLoaded) {
        try {
            tabsLoaded = await app.tabs.loadTabsFromStorageAsync();
        } catch (err) {
            console.warn('Failed to load tabs from IndexedDB:', err);
        }
    }

    if (tabsLoaded && app.tabs.projectTabs.length > 0) {
        app.tabs.restoreTabState(app.tabs.getActiveTab());
        app.tabs.saveTabsToStorage();
        app.undoredo.resetForTab(S.editor?.value || '');
        app.tabs.updateSaveAllMenuVisibility();
        return;
    }

    const savedContent = localStorage.getItem('temp_content') || localStorage.getItem('autosave_content');
    const savedPath = localStorage.getItem('temp_path') || localStorage.getItem('autosave_path');
    const savedProjectName = localStorage.getItem('autosave_project_name');
    app.fileops.loadSavedFileContents();
    try {
        await Promise.race([
            app.storage.loadSavedFileContentsAsync(),
            new Promise((resolve) => setTimeout(resolve, 4000))
        ]);
    } catch (err) {
        console.warn('IndexedDB file contents load skipped:', err);
    }
    const legacyTab = app.tabs.createTab({
        name: savedProjectName || app.i18n.t('untitled'),
        editorContent: savedContent || '',
        filePath: savedPath || '',
        fileContents: { ...S.fileContents },
        isModified: false,
        lastSavedProjectName: savedProjectName || ''
    });
    if (savedPath) {
        app.tabs.markTabSaved(legacyTab, savedContent || '', S.fileContents);
    }
    const activeTab = app.tabs.getActiveTab();
    activeTab.treeData = app.tree.parseEditorContent(activeTab.editorContent);
    app.tabs.saveTabsToStorage();
    app.undoredo.resetForTab(S.editor?.value || '');
    app.tabs.updateSaveAllMenuVisibility();
    LEGACY_AUTOSAVE_KEYS.forEach(k => localStorage.removeItem(k));
}

function initOnboarding() {
    if (!localStorage.getItem('onboarding_done')) {
        const welcomeModal = document.getElementById('welcomeModal');
        if (welcomeModal) {
            welcomeModal.style.display = 'flex';
            app.modals.trapFocus(welcomeModal);
        }
    }
}

function initAutosaveInterval() {
    const S = app.state;
    setInterval(() => {
        const activeTab = app.tabs.getActiveTab();
        const hasModified = app.tabs.projectTabs.some((tab) => tab.isModified);
        if (!activeTab && !hasModified) { return; }
        app.tabs.saveTabsToStorage();
        app.fileops.persistFileContents();
        if (hasModified && S.currentFilePath && !S._isSaving) {
            app.fileops.autoSaveToDisk();
        }
    }, SESSION_AUTOSAVE_MS);
}

async function initElectronBridge() {
    if (!app.electronAPI) { return; }

    const autoCheckEnabled = localStorage.getItem('auto_check_updates') !== 'false';
    await app.modals.initializeAppInfo();
    app.modals.bindReleaseUpdateEvents();
    if (autoCheckEnabled) {
        setTimeout(() => app.modals.checkReleaseUpdateOnStartup(), 1200);
    }

    const minBtn = document.getElementById('minBtn');
    const maxBtn = document.getElementById('maxBtn');
    const closeBtn = document.getElementById('closeBtn');
    if (minBtn) { minBtn.addEventListener('click', () => app.electronAPI.windowMinimize()); }
    if (maxBtn) { maxBtn.addEventListener('click', () => app.electronAPI.windowMaximize()); }
    if (closeBtn) { closeBtn.addEventListener('click', () => app.electronAPI.windowClose()); }

    const updateMaximizeButton = (isMaximized) => {
        const mb = document.getElementById('maxBtn');
        if (!mb) { return; }
        mb.innerHTML = isMaximized
            ? '<i data-lucide="restore" aria-hidden="true"></i>'
            : '<i data-lucide="square" aria-hidden="true"></i>';
        mb.setAttribute('aria-label', app.i18n.t(isMaximized ? 'window_restore' : 'window_maximize'));
        mb.setAttribute('title', app.i18n.t(isMaximized ? 'window_restore' : 'window_maximize'));
        app.icons.refreshIcons(mb);
    };

    app.electronAPI.onWindowStateChanged(updateMaximizeButton);

    try {
        const result = await app.electronAPI.isWindowMaximized();
        if (typeof result === 'boolean') {
            updateMaximizeButton(result);
        }
    } catch (err) {
        console.warn('[TreeIDE] Failed to read window maximize state:', err);
    }

    app.electronAPI.onAttemptClose(async () => {
        app.tabs.saveCurrentTabState();
        app.tabs.saveTabsToStorage();
        await app.storage.flushPendingWrites();
        const hasUnsaved = app.tabs.projectTabs.some(t => t.isModified);
        if (hasUnsaved) {
            const unsavedModal = document.getElementById('unsavedModal');
            if (unsavedModal) {
                unsavedModal.style.display = 'flex';
                app.modals.trapFocus(unsavedModal);
            }
        } else {
            app.electronAPI.forceClose();
        }
    });
}

function showInitError(err) {
    console.error('[TreeIDE] DOMContentLoaded error:', err);
    try {
        const errText = '[TreeIDE] DOMContentLoaded error:\n' + (err?.message || String(err)) + '\n\n' + (err?.stack || '');
        document.title = 'Tree IDE';
        const safeText = app.helpers.escapeHtml(errText);
        document.body.innerHTML = '<pre style="color:red;padding:20px;white-space:pre-wrap;font-size:13px;">' + safeText + '</pre>';
        if (app.electronAPI?.saveErrorLog) {
            app.electronAPI.saveErrorLog(errText);
        }
    } catch (e2) {
        const safe = app.helpers.escapeHtml(String(err));
        document.body.innerHTML = '<pre style="color:red;padding:20px;">' + safe + '</pre>';
    }
}

async function bootstrap() {
    console.log('[TreeIDE] DOMContentLoaded fired, starting init...');
    try {
        app.dom.bindRefs();

        if (app.customSelect) {
            app.customSelect.init();
        }

        // Bind all UI handlers before showing modals or restoring session.
        bindAll();

        if (app.shortcuts) {
            app.shortcuts.renderShortcutsTable();
            const restoreBtn = document.getElementById('restoreShortcutsBtn');
            if (restoreBtn) {
                restoreBtn.addEventListener('click', () => app.shortcuts.restoreDefaults());
            }
        }

        if (app.dbStorage) {
            app.dbStorage.migrateFromLocalStorage().catch((err) => console.warn('IndexedDB migration failed:', err));
        }

        await restoreSession();

        app.editor.updateFileNameDisplay();
        syncLanguageControls();
        if (app.i18n?.updateUI) {
            app.i18n.updateUI();
        }
        if (app.customSelect?.refreshAll) {
            app.customSelect.refreshAll();
        }
        document.documentElement.lang = app.fileops.getHtmlLang();
        applySavedThemeAndZoom();

        const autoCheckToggle = document.getElementById('autoCheckUpdatesToggle');
        const autoCheckEnabled = localStorage.getItem('auto_check_updates') !== 'false';
        if (autoCheckToggle) { autoCheckToggle.checked = autoCheckEnabled; }

        app.icons.refreshIcons();
        app.fileops.updateBuildFolderDisplay();
        app.validation.updateValidationPanel();
        app.panelResize?.applyLayout();

        await initElectronBridge();

        initOnboarding();

        initAutosaveInterval();

        window.addEventListener('beforeunload', () => {
            app.tabs.saveTabsToStorage();
            app.storage.persistFileContents();
        });

        const projectTabsBar = document.getElementById('projectTabsBar');
        if (projectTabsBar) { projectTabsBar.style.display = 'flex'; }
        if (app.customSelect?.refreshAll) {
            app.customSelect.refreshAll();
        }
    } catch (err) {
        showInitError(err);
    }
}


    return {
        handleThemeChange,
        handleLangChange,
        syncLanguageControls,
        syncUpdateChannelCards,
        setUpdateChannel,
        bindThemeAndLanguageControls,
        applySavedThemeAndZoom,
        bindExternalFileDrop,
        bindAll,
        bootstrap,
        restoreSession
    };
}
