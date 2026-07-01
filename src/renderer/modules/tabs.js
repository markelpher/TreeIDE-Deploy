export function createTabs(app) {

function snapshotFileContents(fileContents) {
    return JSON.stringify(fileContents || {});
}

function ensureTabSnapshots(tab) {
    if (tab.savedEditorContent === undefined) {
        tab.savedEditorContent = tab.isModified ? '' : (tab.editorContent || '');
    }
    if (tab.savedFileContentsSnapshot === undefined) {
        tab.savedFileContentsSnapshot = tab.isModified ? '{}' : snapshotFileContents(tab.fileContents);
    }
}

function computeTabModified(tab, editorContent, fileContents) {
    ensureTabSnapshots(tab);
    if ((editorContent ?? '') !== (tab.savedEditorContent ?? '')) { return true; }
    return snapshotFileContents(fileContents) !== (tab.savedFileContentsSnapshot ?? '{}');
}

function markTabSaved(tab, editorContent, fileContents) {
    tab.savedEditorContent = editorContent ?? '';
    tab.savedFileContentsSnapshot = snapshotFileContents(fileContents);
    tab.isModified = false;
}

function markTabLoaded(tab, editorContent, fileContents, isDirty) {
    if (isDirty) {
        tab.savedEditorContent = '';
        tab.savedFileContentsSnapshot = '{}';
        tab.isModified = true;
    } else {
        markTabSaved(tab, editorContent, fileContents);
    }
}

function reconcileTabAfterLoad(rawTab, tab) {
    const hadSnapshots = rawTab.savedEditorContent !== undefined;
    ensureTabSnapshots(tab);
    if (!hadSnapshots && tab.filePath) {
        markTabSaved(tab, tab.editorContent, tab.fileContents);
    }
    tab.isModified = computeTabModified(tab, tab.editorContent, tab.fileContents);
}

function resolveTabTreeData(tab) {
    const stored = tab.treeData;
    if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
        return stored;
    }
    return app.tree.parseEditorContent(tab.editorContent || '');
}

function createProjectTab(options = {}) {
    const tab = {
        id: options.id || ('proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)),
        name: options.name || '',
        editorContent: options.editorContent || '',
        filePath: options.filePath || '',
        treeData: options.treeData ?? null,
        fileContents: options.fileContents || {},
        isModified: options.isModified || false,
        lastSavedProjectName: options.lastSavedProjectName || '',
        openFileTabs: options.openFileTabs || [],
        activeFileTabPath: options.activeFileTabPath || null,
        savedEditorContent: options.savedEditorContent,
        savedFileContentsSnapshot: options.savedFileContentsSnapshot
    };
    ensureTabSnapshots(tab);
    return tab;
}

// Animated "scroll element into view" inside a horizontally-scrolling list.
// Unlike the native scrollIntoView, this uses requestAnimationFrame + cubic
// easing so the motion is consistent across browsers and respects the same
// momentum framework used by the arrow buttons.
function _scrollElementIntoListView(list, el, duration = 320) {
    if (!list || !el) {return;}
    const elRect = el.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const elLeft = elRect.left - listRect.left + list.scrollLeft;
    const elRight = elLeft + elRect.width;
    const margin = 24;

    let target = list.scrollLeft;
    if (elLeft < list.scrollLeft + margin) {
        target = elLeft - margin;
    } else if (elRight > list.scrollLeft + list.clientWidth - margin) {
        target = elRight - list.clientWidth + margin;
    } else {
        return;
    }
    target = Math.max(0, Math.min(list.scrollWidth - list.clientWidth, target));

    // Reuse the same animation pipeline as the arrow buttons
    const state = list._scrollState;
    if (state) {
        cancelAnimationFrame(state.animRaf);
        state.velocity = 0;
        cancelAnimationFrame(state.rafId);
        state.rafId = 0;
        state.animTarget = target;
        state.animStart = performance.now();
        state.animFrom = list.scrollLeft;
        state.animDuration = duration;
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const step = (now) => {
            const t = Math.min(1, (now - state.animStart) / state.animDuration);
            const eased = easeOutCubic(t);
            list.scrollLeft = state.animFrom + (state.animTarget - state.animFrom) * eased;
            if (t < 1) {state.animRaf = requestAnimationFrame(step);}
            else { list.scrollLeft = state.animTarget; state.animRaf = 0; }
        };
        state.animRaf = requestAnimationFrame(step);
    } else {
        list.scrollTo({ left: target, behavior: 'smooth' });
    }
}

const tabManager = {
    projectTabs: [],
    activeProjectTabId: null,
    _listenersInitialized: false,

    getActiveTab() {
        return this.projectTabs.find(t => t.id === this.activeProjectTabId) || null;
    },

    saveCurrentTabState() {
        const tab = this.getActiveTab();
        if (!tab) { return; }

        const editor = document.getElementById('editor');
        const filePreviewEditor = document.getElementById('filePreviewEditor');
        const S = app.state;

        if (editor) {
            tab.editorContent = editor.value;
            tab.treeData = app.tree.parseEditorContent(editor.value);
        }

        tab.filePath = S.currentFilePath;
        tab.lastSavedProjectName = S.lastSavedProjectName;

        if (S.activePreviewPath && filePreviewEditor) {
            S.fileContents[S.activePreviewPath] = filePreviewEditor.value;
        }
        tab.fileContents = { ...S.fileContents };
        tab.isModified = computeTabModified(tab, tab.editorContent, tab.fileContents);
        S.isModified = tab.isModified;
    },

    restoreTabState(tab) {
        if (!tab) { return; }

        const editor = document.getElementById('editor');
        const treeView = document.getElementById('treeView');
        const S = app.state;

        S.currentFilePath = tab.filePath;
        S.isModified = tab.isModified;
        S.lastSavedProjectName = tab.lastSavedProjectName;
        S.fileContents = { ...tab.fileContents };
        S.activePreviewPath = '';

        if (editor) { editor.value = tab.editorContent; }

        S.currentTree = resolveTabTreeData(tab);
        if (treeView) {
            app.editor.paintTreeView();
        }

        app.undoredo?.resetForTab(tab.editorContent || '');
        app.editor.updateFileNameDisplay();
        app.validation.updateValidationPanel();

        this.renderProjectTabBar();
        this.renderCodeTabBar(tab);

        if (tab.activeFileTabPath && tab.openFileTabs.length > 0) {
            app.editor.openFilePreview(tab.activeFileTabPath);
        } else {
            app.editor.closeFilePreview();
        }
    },

    switchToTab(tabId) {
        if (tabId === this.activeProjectTabId) {return;}
        clearTimeout(app.dom.debounceTimer);
        clearTimeout(app.dom.autoSaveTimer);
        this.saveCurrentTabState();
        this.activeProjectTabId = tabId;
        const tab = this.getActiveTab();
        if (tab) {this.restoreTabState(tab);}
        this.saveTabsToStorage();
        this._scrollActiveProjectTabIntoView();
    },

    _scrollActiveProjectTabIntoView() {
        const list = document.getElementById('projectTabList');
        if (!list || !this.activeProjectTabId) {return;}
        const activeEl = Array.from(list.querySelectorAll('.project-tab'))
            .find(el => el.dataset.tabId === this.activeProjectTabId);
        if (activeEl) {
            requestAnimationFrame(() => {
                _scrollElementIntoListView(list, activeEl, 320);
            });
        }
    },

    createTab(options = {}) {
        this.saveCurrentTabState();
        const tab = createProjectTab(options);
        this.projectTabs.push(tab);
        this.activeProjectTabId = tab.id;
        this.restoreTabState(tab);
        this.saveTabsToStorage();
        this._scrollActiveProjectTabIntoView();
        return tab;
    },

    loadContentIntoTab({ content, tabName, filePath, treeData, fileContents, isModified, forceNewTab }) {
        const resolvedTreeData = (treeData && Object.keys(treeData).length > 0)
            ? treeData
            : app.tree.parseEditorContent(content || '');
        const activeTab = this.getActiveTab();
        if (activeTab && forceNewTab) {
            const tab = this.createTab({
                name: tabName,
                editorContent: content,
                filePath: filePath || null,
                treeData: resolvedTreeData,
                fileContents: fileContents || {},
                isModified,
                lastSavedProjectName: tabName
            });
            this.markTabLoaded(tab, content, fileContents || {}, !!isModified);
        } else if (activeTab) {
            activeTab.editorContent = content;
            activeTab.filePath = filePath || null;
            activeTab.treeData = resolvedTreeData;
            activeTab.fileContents = fileContents || {};
            activeTab.name = tabName;
            activeTab.lastSavedProjectName = tabName;
            this.markTabLoaded(activeTab, content, fileContents || {}, !!isModified);
            this.restoreTabState(activeTab);
        }
        this.saveTabsToStorage();
    },

    async closeTab(tabId) {
        this.saveCurrentTabState();

        const index = this.projectTabs.findIndex(t => t.id === tabId);
        if (index === -1) {return;}

        const tab = this.projectTabs[index];
        if (tab.id !== this.activeProjectTabId) {
            tab.isModified = computeTabModified(tab, tab.editorContent, tab.fileContents);
        }
        if (tab.isModified) {
            const discard = await app.modals.showConfirmAsync(
                app.i18n.t('close_tab_unsaved_msg'),
                app.i18n.t('close_tab_unsaved_title')
            );
            if (!discard) { return; }
        }

        if (tabId === this.activeProjectTabId) {
            this.projectTabs.splice(index, 1);
            if (this.projectTabs.length === 0) {
                this.createTab();
            } else {
                const newActiveIndex = Math.min(index, this.projectTabs.length - 1);
                this.activeProjectTabId = this.projectTabs[newActiveIndex].id;
                this.restoreTabState(this.projectTabs[newActiveIndex]);
            }
        } else {
            this.projectTabs.splice(index, 1);
        }
        this.renderProjectTabBar();
        this.updateSaveAllMenuVisibility();
        this.saveTabsToStorage();
    },

    renameTab(tabId, newName) {
        const tab = this.projectTabs.find(t => t.id === tabId);
        if (!tab) {return;}
        tab.name = newName.trim() || (typeof app.i18n !== 'undefined' ? app.i18n.t('untitled') : 'Untitled');
        this.renderProjectTabBar();
        this.saveTabsToStorage();
    },

    openFileInTab(filePath) {
        const tab = this.getActiveTab();
        if (!tab) {return;}

        let fileTab = tab.openFileTabs.find(ft => ft.path === filePath);
        if (!fileTab) {
            fileTab = { path: filePath };
            tab.openFileTabs.push(fileTab);
        }

        this.saveActiveCodeTabState(tab);
        tab.activeFileTabPath = filePath;
        this.renderCodeTabBar(tab);
        app.editor.openFilePreview(filePath);
        this.saveTabsToStorage();
    },

    closeFileTab(filePath) {
        const tab = this.getActiveTab();
        if (!tab) {return;}

        const index = tab.openFileTabs.findIndex(ft => ft.path === filePath);
        if (index === -1) {return;}

        this.saveActiveCodeTabState(tab);
        tab.openFileTabs.splice(index, 1);

        if (tab.activeFileTabPath === filePath) {
            if (tab.openFileTabs.length === 0) {
                tab.activeFileTabPath = null;
                app.editor.closeFilePreview();
            } else {
                const newIndex = Math.min(index, tab.openFileTabs.length - 1);
                tab.activeFileTabPath = tab.openFileTabs[newIndex].path;
                app.editor.openFilePreview(tab.activeFileTabPath);
            }
        }

        this.renderCodeTabBar(tab);
        this.saveTabsToStorage();
    },

    switchToFileTab(filePath) {
        const tab = this.getActiveTab();
        if (!tab || tab.activeFileTabPath === filePath) {return;}

        this.saveActiveCodeTabState(tab);
        tab.activeFileTabPath = filePath;
        this.renderCodeTabBar(tab);
        app.editor.openFilePreview(filePath);
        this.saveTabsToStorage();
    },

    updateFileTabPath(oldPath, newPath) {
        if (oldPath === newPath) { return false; }

        let shouldRender = false;
        this.projectTabs.forEach(tab => {
            const duplicateNew = tab.openFileTabs.find((ft) => ft.path === newPath);
            const fileTab = tab.openFileTabs.find((ft) => ft.path === oldPath);

            if (fileTab) {
                if (duplicateNew && duplicateNew !== fileTab) {
                    tab.openFileTabs = tab.openFileTabs.filter((ft) => ft.path !== oldPath);
                } else {
                    fileTab.path = newPath;
                }
                shouldRender = true;
            }

            if (tab.activeFileTabPath === oldPath) {
                tab.activeFileTabPath = newPath;
                shouldRender = true;
            }

            if (Object.prototype.hasOwnProperty.call(tab.fileContents, oldPath)) {
                tab.fileContents[newPath] = tab.fileContents[oldPath];
                delete tab.fileContents[oldPath];
            }
        });

        const S = app.state;
        if (S.activePreviewPath === oldPath) {
            S.activePreviewPath = newPath;
        }

        if (shouldRender) {
            const activeTab = this.getActiveTab();
            if (activeTab) { this.renderCodeTabBar(activeTab); }
            this.saveTabsToStorage();
        }
        return shouldRender;
    },

    saveActiveCodeTabState(tab) {
        if (!tab.activeFileTabPath) {return;}
        const filePreviewEditor = document.getElementById('filePreviewEditor');
        if (filePreviewEditor) {
            app.state.fileContents[tab.activeFileTabPath] = filePreviewEditor.value;
        }
    },

    _initTabBarListeners() {
        if (this._listenersInitialized) {return;}
        const list = document.getElementById('projectTabList');
        if (!list) {return;}

        this._bindScrollControls(list, 'projectTabScrollLeft', 'projectTabScrollRight');

        this._tabClickHandler = (e) => {
            if (e.target.closest('#newProjectTabBtn')) {
                this.createTab();
                return;
            }
            const renameIcon = e.target.closest('.project-tab-rename-icon');
            if (renameIcon) {
                e.stopPropagation();
                const tabId = renameIcon.dataset.renameTabId;
                const nameEl = list.querySelector(`.project-tab-name[data-tab-id="${tabId}"]`);
                if (nameEl) {this._startRename(nameEl, tabId);}
                return;
            }
            const closeIcon = e.target.closest('.project-tab-close');
            if (closeIcon) {
                e.stopPropagation();
                void this.closeTab(closeIcon.dataset.closeTabId);
                return;
            }
            const tabEl = e.target.closest('.project-tab');
            if (tabEl) {
                this.switchToTab(tabEl.dataset.tabId);
                return;
            }
        };
        list.addEventListener('click', this._tabClickHandler);

        this._tabDblClickHandler = (e) => {
            const nameEl = e.target.closest('.project-tab-name');
            if (nameEl) {
                e.stopPropagation();
                this._startRename(nameEl, nameEl.dataset.tabId);
            }
        };
        list.addEventListener('dblclick', this._tabDblClickHandler);

        this._listenersInitialized = true;
    },

    destroyTabBarListeners() {
        const list = document.getElementById('projectTabList');
        if (!list || !this._listenersInitialized) {return;}

        list.removeEventListener('click', this._tabClickHandler);
        list.removeEventListener('dblclick', this._tabDblClickHandler);

        if (list._scrollResizeObserver) {
            list._scrollResizeObserver.disconnect();
            list._scrollResizeObserver = null;
        }

        this._listenersInitialized = false;
    },

    // Wire up wheel-to-scroll with momentum, click handlers, and visibility tracking for a tab list
    _boundScrollLists: new Set(),
    _bindScrollControls(list, leftBtnId, rightBtnId) {
        if (!list || this._boundScrollLists.has(list)) {return;}
        this._boundScrollLists.add(list);

        const leftBtn = document.getElementById(leftBtnId);
        const rightBtn = document.getElementById(rightBtnId);
        const bar = list.parentElement;

        const SCROLL_STEP = 160;
        const FRICTION = 0.92;
        const MIN_VELOCITY = 0.4;

        // Per-list momentum state
        const state = {
            velocity: 0,
            rafId: 0,
            animTarget: 0,
            animStart: 0,
            animFrom: 0,
            animDuration: 0,
            animRaf: 0
        };
        list._scrollState = state;

        const updateButtons = () => {
            const canScrollLeft = list.scrollLeft > 1;
            const canScrollRight = list.scrollLeft + list.clientWidth < list.scrollWidth - 1;
            if (leftBtn) {leftBtn.classList.toggle('visible', canScrollLeft);}
            if (rightBtn) {rightBtn.classList.toggle('visible', canScrollRight);}
            if (bar) {
                bar.classList.toggle('has-scroll-left', canScrollLeft);
                bar.classList.toggle('has-scroll-right', canScrollRight);
            }
        };

        const clampScroll = () => {
            const max = list.scrollWidth - list.clientWidth;
            if (list.scrollLeft < 0) {list.scrollLeft = 0;}
            else if (list.scrollLeft > max) {list.scrollLeft = max;}
        };

        // Easing: cubic-out (fast start, soft landing)
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        // Programmatic animated scroll (cancellable, used by arrow buttons)
        const animateScrollTo = (target, duration) => {
            cancelAnimationFrame(state.animRaf);
            state.animTarget = target;
            state.animStart = performance.now();
            state.animFrom = list.scrollLeft;
            state.animDuration = duration;

            // Stop any momentum immediately
            state.velocity = 0;
            cancelAnimationFrame(state.rafId);
            state.rafId = 0;

            const step = (now) => {
                const elapsed = now - state.animStart;
                const t = Math.min(1, elapsed / state.animDuration);
                const eased = easeOutCubic(t);
                list.scrollLeft = state.animFrom + (state.animTarget - state.animFrom) * eased;
                if (t < 1) {
                    state.animRaf = requestAnimationFrame(step);
                } else {
                    list.scrollLeft = state.animTarget;
                    state.animRaf = 0;
                }
            };
            state.animRaf = requestAnimationFrame(step);
        };

        // Momentum loop (used by wheel)
        const tickMomentum = () => {
            if (Math.abs(state.velocity) < MIN_VELOCITY) {
                state.velocity = 0;
                state.rafId = 0;
                return;
            }
            list.scrollLeft += state.velocity;
            clampScroll();
            state.velocity *= FRICTION;
            state.rafId = requestAnimationFrame(tickMomentum);
        };

        list.addEventListener('wheel', (e) => {
            // Convert vertical wheel into horizontal scroll
            if (e.deltaY === 0 && e.deltaX === 0) {return;}
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) {return;}
            e.preventDefault();

            // Cancel any in-flight animations
            cancelAnimationFrame(state.animRaf);
            state.animRaf = 0;
            cancelAnimationFrame(state.rafId);
            state.rafId = 0;

            // Normalize deltaY to a usable value across browsers
            let delta = e.deltaY;
            if (e.deltaMode === 1) {delta *= 16;}        // line mode
            else if (e.deltaMode === 2) {delta *= list.clientHeight;}  // page mode

            // Apply immediate motion + queue momentum
            list.scrollLeft += delta;
            clampScroll();
            // Velocity in px/frame; clamp extreme values from high-res wheels
            state.velocity = Math.max(-30, Math.min(30, delta * 0.5));
            if (!state.rafId) {state.rafId = requestAnimationFrame(tickMomentum);}
        }, { passive: false });

        list.addEventListener('scroll', updateButtons, { passive: true });

        if (leftBtn) {
            leftBtn.addEventListener('click', () => {
                const target = Math.max(0, list.scrollLeft - SCROLL_STEP);
                animateScrollTo(target, 280);
            });
        }
        if (rightBtn) {
            rightBtn.addEventListener('click', () => {
                const max = list.scrollWidth - list.clientWidth;
                const target = Math.min(max, list.scrollLeft + SCROLL_STEP);
                animateScrollTo(target, 280);
            });
        }

        if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(() => updateButtons());
            ro.observe(list);
            list._scrollResizeObserver = ro;
        } else {
            window.addEventListener('resize', updateButtons);
        }

        // Initial state on next frame (after layout)
        requestAnimationFrame(updateButtons);
    },

    updateProjectTabScrollButtons() {
        const list = document.getElementById('projectTabList');
        if (list && this._boundScrollLists.has(list)) {
            list.dispatchEvent(new Event('scroll'));
        }
    },

    updateCodeTabScrollButtons() {
        const list = document.getElementById('codeTabList');
        if (list && this._boundScrollLists.has(list)) {
            list.dispatchEvent(new Event('scroll'));
        }
    },

    renderProjectTabBar() {
        const list = document.getElementById('projectTabList');
        if (!list) {return;}

        this._initTabBarListeners();
        const escapeHtml = app.helpers.escapeHtml;

        const t = (key, fallback) => (app.i18n ? app.i18n.t(key) : (fallback || key));
        const renameTitle = escapeHtml(t('rename'));
        const renameAria = escapeHtml(t('rename'));
        const closeTitle = escapeHtml(t('close'));
        const closeAria = escapeHtml(t('close_tab'));
        const newTabTitle = escapeHtml(t('new_tab'));
        const modifiedAria = escapeHtml(t('not_saved'));

        list.innerHTML = this.projectTabs.map(tab => {
            const isActive = tab.id === this.activeProjectTabId;
            const displayName = tab.name || (typeof app.i18n !== 'undefined' ? app.i18n.t('untitled') : 'Untitled');
            const modifiedLabel = tab.isModified
                ? `<span class="project-tab-modified" aria-label="${modifiedAria}"></span>`
                : '';
            return `<button class="project-tab${isActive ? ' active' : ''}" data-tab-id="${tab.id}" role="tab" aria-selected="${isActive}" aria-controls="tab-panel-${tab.id}">
                <span class="project-tab-name" data-tab-id="${tab.id}">${escapeHtml(displayName)}</span>
                ${modifiedLabel}
                <span class="project-tab-rename-icon" data-rename-tab-id="${tab.id}" title="${renameTitle}" aria-label="${renameAria}">
                    <i data-lucide="pencil" aria-hidden="true"></i>
                </span>
                <span class="project-tab-close" data-close-tab-id="${tab.id}" title="${closeTitle}" aria-label="${closeAria}">
                    <i data-lucide="x" aria-hidden="true"></i>
                </span>
            </button>`;
        }).join('') + `<button class="project-tab-new" id="newProjectTabBtn" title="${newTabTitle}" aria-label="${newTabTitle}"><i data-lucide="plus" aria-hidden="true"></i></button>`;

        app.icons.refreshIcons();
        this.updateProjectTabScrollButtons();
        this.updateSaveAllMenuVisibility();
    },

    syncActiveTabDirty(editorContent, fileContents) {
        const tab = this.getActiveTab();
        if (!tab) { return false; }
        tab.isModified = computeTabModified(tab, editorContent, fileContents);
        const S = app.state;
        if (S) { S.isModified = tab.isModified; }
        this.updateActiveTabModifiedIndicator();
        this.updateSaveAllMenuVisibility();
        return tab.isModified;
    },

    markTabSaved(tab, editorContent, fileContents) {
        markTabSaved(tab, editorContent, fileContents);
        this.updateSaveAllMenuVisibility();
    },

    markTabLoaded(tab, editorContent, fileContents, isDirty) {
        markTabLoaded(tab, editorContent, fileContents, isDirty);
        this.updateSaveAllMenuVisibility();
    },

    updateSaveAllMenuVisibility() {
        const menu = document.getElementById('menu-save-all');
        if (!menu) { return; }
        const dirtyCount = this.projectTabs.filter((t) => t.isModified).length;
        menu.classList.toggle('hidden', dirtyCount < 2);
    },

    updateActiveTabModifiedIndicator() {
        const list = document.getElementById('projectTabList');
        if (!list) {return;}
        const tab = this.getActiveTab();
        if (!tab) { this.renderProjectTabBar(); return; }
        const t = (key, fallback) => (app.i18n ? app.i18n.t(key) : (fallback || key));
        const modifiedAria = app.helpers.escapeHtml(t('not_saved'));
        list.querySelectorAll('.project-tab').forEach(el => {
            const tabId = el.dataset.tabId;
            const isActive = tabId === this.activeProjectTabId;
            el.classList.toggle('active', isActive);
            if (isActive) {
                let modifiedSpan = el.querySelector('.project-tab-modified');
                if (tab.isModified) {
                    if (!modifiedSpan) {
                        modifiedSpan = document.createElement('span');
                        modifiedSpan.className = 'project-tab-modified';
                        modifiedSpan.setAttribute('aria-label', modifiedAria);
                        el.insertBefore(modifiedSpan, el.querySelector('.project-tab-rename-icon'));
                    }
                } else {
                    if (modifiedSpan) {modifiedSpan.remove();}
                }
            }
        });
    },

    _startRename(nameEl, tabId) {
        const tab = this.projectTabs.find(t => t.id === tabId);
        if (!tab) {return;}

        const tabEl = nameEl.closest('.project-tab');
        const renameIcon = tabEl ? tabEl.querySelector('.project-tab-rename-icon') : null;
        if (renameIcon) {renameIcon.style.display = 'none';}

        nameEl.contentEditable = 'true';
        nameEl.focus();

        const range = document.createRange();
        range.selectNodeContents(nameEl);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);

        const finishRename = () => {
            nameEl.contentEditable = 'false';
            const newName = nameEl.textContent.trim();
            this.renameTab(tabId, newName);
            if (renameIcon) {renameIcon.style.display = '';}
        };

        const keyHandler = (ev) => {
            if (ev.key === 'Enter') {
                ev.preventDefault();
                nameEl.blur();
            } else if (ev.key === 'Escape') {
                nameEl.textContent = tab.name || (typeof app.i18n !== 'undefined' ? app.i18n.t('untitled') : 'Untitled');
                nameEl.blur();
            }
        };
        nameEl.addEventListener('blur', () => {
            finishRename();
            nameEl.removeEventListener('keydown', keyHandler);
        }, { once: true });
        nameEl.addEventListener('keydown', keyHandler);
    },

    renderCodeTabBar(tab) {
        const list = document.getElementById('codeTabList');
        const panel = document.getElementById('filePreviewPanel');
        if (!list || !panel) {return;}

        if (!tab || tab.openFileTabs.length === 0) {
            panel.classList.remove('show');
            list.textContent = '';
            this._bindScrollControls(list, 'codeTabScrollLeft', 'codeTabScrollRight');
            this.updateCodeTabScrollButtons();
            return;
        }

        panel.classList.add('show');
        const escapeHtml = app.helpers.escapeHtml;

        const t = (key, fallback) => (app.i18n ? app.i18n.t(key) : (fallback || key));
        const closeFileAria = escapeHtml(t('close_tab'));

        list.innerHTML = tab.openFileTabs.map(ft => {
            const isActive = ft.path === tab.activeFileTabPath;
            const fileName = ft.path.split('/').pop();
            const iconDetails = app.icons.getIconDetails(fileName, false) || { icon: 'file', class: 'tree-icon-default' };
            return `<button class="code-tab${isActive ? ' active' : ''}" data-file-path="${escapeHtml(ft.path)}" role="tab" aria-selected="${isActive}">
                <i data-lucide="${iconDetails.icon}" class="tree-icon ${iconDetails.class}" aria-hidden="true"></i>
                <span class="code-tab-name">${escapeHtml(fileName)}</span>
                <span class="code-tab-close" data-close-file-path="${escapeHtml(ft.path)}" title="${closeFileAria}" aria-label="${closeFileAria}">
                    <i data-lucide="x" aria-hidden="true"></i>
                </span>
            </button>`;
        }).join('');

        if (tab.activeFileTabPath) {
            panel.classList.toggle('markdown-file', app.fileops.isMarkdownFile(tab.activeFileTabPath));
        }

        this._bindScrollControls(list, 'codeTabScrollLeft', 'codeTabScrollRight');

        app.icons.refreshIcons();
        this.updateCodeTabScrollButtons();

        // Scroll the active code tab into view (after layout)
        if (tab.activeFileTabPath) {
            const activeEl = Array.from(list.querySelectorAll('.code-tab'))
                .find(el => el.dataset.filePath === tab.activeFileTabPath);
            if (activeEl) {
                requestAnimationFrame(() => {
                    _scrollElementIntoListView(list, activeEl, 320);
                });
            }
        }
    },

    saveTabsToStorage() {
        this.saveCurrentTabState();
        const data = {
            activeProjectTabId: this.activeProjectTabId,
            projectTabs: this.projectTabs.map(tab => ({
                id: tab.id,
                name: tab.name,
                editorContent: tab.editorContent,
                filePath: tab.filePath,
                treeData: tab.treeData,
                fileContents: tab.fileContents,
                isModified: tab.isModified,
                lastSavedProjectName: tab.lastSavedProjectName,
                openFileTabs: tab.openFileTabs,
                activeFileTabPath: tab.activeFileTabPath,
                savedEditorContent: tab.savedEditorContent,
                savedFileContentsSnapshot: tab.savedFileContentsSnapshot
            }))
        };
        const json = JSON.stringify(data);
        try {
            localStorage.setItem('autosave_tabs', json);
        } catch (err) {
            console.warn('Failed to persist tabs (localStorage quota?):', err);
            if (app.toast?.showToast) {
                app.toast.showToast(app.i18n.t('storage_error'));
            }
        }
        if (app.dbStorage) {
            app.dbStorage.set('autosave_tabs', json).catch((err) => {
                console.warn('IndexedDB tabs write failed:', err);
            });
        }
    },

    loadTabsFromStorage() {
        try {
            const raw = localStorage.getItem('autosave_tabs');
            if (!raw) { return false; }
            const data = JSON.parse(raw);
            if (data.projectTabs?.length > 0) {
                this.projectTabs = data.projectTabs.map((t) => {
                    const tab = createProjectTab(t);
                    reconcileTabAfterLoad(t, tab);
                    return tab;
                });
                this.activeProjectTabId = data.activeProjectTabId || this.projectTabs[0].id;
                return true;
            }
        } catch (err) {
            console.warn('Failed to parse saved tabs:', err);
        }
        return false;
    },

    async loadTabsFromStorageAsync() {
        if (this.projectTabs.length > 0) { return true; }
        if (!app.dbStorage) { return false; }
        try {
            const raw = await Promise.race([
                app.dbStorage.get('autosave_tabs'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('IndexedDB timeout')), 4000))
            ]);
            if (!raw) { return false; }
            const data = JSON.parse(raw);
            if (data.projectTabs?.length > 0) {
                this.projectTabs = data.projectTabs.map((t) => {
                    const tab = createProjectTab(t);
                    reconcileTabAfterLoad(t, tab);
                    return tab;
                });
                this.activeProjectTabId = data.activeProjectTabId || this.projectTabs[0].id;
                return true;
            }
        } catch (err) {
            console.warn('IndexedDB fallback read tabs failed:', err);
        }
        return false;
    }
};

return tabManager;
}
