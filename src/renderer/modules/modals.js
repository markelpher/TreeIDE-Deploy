import { toDateLocale } from '../../shared/i18n.js';
import {
    resolveLocalizedReleaseNotes,
    shouldTranslateChangelogSections,
} from '../../shared/releaseNotes.js';
import { translateUpdateError } from '../../shared/updateErrors.js';
import { normalizeDownloadPercent } from '../../shared/updateProgress.js';

export function createModals(app) {

// Lazy getters - elements may not exist when script loads
    function getEl(id) { return document.getElementById(id); }
    function sanitizeHtml(html) {
        const template = document.createElement('template');
        template.innerHTML = html;
        const walker = template.content.ownerDocument.createTreeWalker(template.content, 1, null, false);
        const allowedTags = new Set(['a','b','strong','i','em','ul','ol','li','p','br','hr','h1','h2','h3','h4','h5','h6','pre','code','blockquote','del','ins','sup','sub','table','thead','tbody','tr','th','td','span','div']);
        const removeNodes = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeType === 1 && !allowedTags.has(node.tagName.toLowerCase())) {
                removeNodes.push(node);
            }
            if (node.nodeType === 1) {
                ['onclick','onload','onerror','onmouseover','onfocus','onblur','onchange','onsubmit','onkeydown','onkeyup','onkeypress'].forEach(attr => node.removeAttribute(attr));
                if (node.tagName.toLowerCase() === 'a') {
                    const href = node.getAttribute('href') || '';
                    if (!/^(https?:|mailto:|#)/i.test(href)) {node.removeAttribute('href');}
                }
            }
        }
        removeNodes.forEach(n => n.parentNode?.removeChild(n));
        return template.innerHTML;
    }
    let latestReleaseUpdate = null;
    let dismissedReleaseVersion = '';

    let isDownloadingUpdate = false;
    let isUpdateDownloaded = false;
    let maxDownloadPercent = 0;
    let currentUpdateInstallMode = 'in-app';

    function applyUpdateDownloadLabel() {
        const downloadLabel = document.getElementById('updateDownloadLabel');
        if (!downloadLabel) { return; }
        if (isUpdateDownloaded) {
            if (currentUpdateInstallMode === 'manual') {
                downloadLabel.textContent = app.i18n.t('update_show_installer');
            } else if (currentUpdateInstallMode === 'system') {
                downloadLabel.textContent = app.i18n.t('update_install_package');
            } else {
                downloadLabel.textContent = app.i18n.t('update_install_restart');
            }
            return;
        }
        downloadLabel.textContent = currentUpdateInstallMode === 'manual'
            ? app.i18n.t('update_download_installer')
            : app.i18n.t('update_download_release');
    }

    function setReleaseUpdateProgress(percent, state = 'idle') {
        const progressEl = document.getElementById('releaseUpdateProgress');
        const progressFill = document.getElementById('releaseUpdateProgressFill');
        const progressText = document.getElementById('releaseUpdateProgressText');
        const value = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
        const visible = state === 'downloading' || state === 'complete';

        if (progressEl) {
            progressEl.classList.toggle('show', visible);
            progressEl.classList.toggle('downloading', state === 'downloading');
            progressEl.classList.toggle('complete', state === 'complete');
            progressEl.setAttribute('aria-valuenow', String(value));
            progressEl.setAttribute('aria-valuetext', `${value}%`);
        }
        if (progressFill) {progressFill.style.width = `${value}%`;}
        if (progressText) {progressText.textContent = `${value}%`;}
    }

    function setReleaseUpdateActionsLocked(locked) {
        const footer = document.querySelector('.release-update-footer');
        const actions = document.querySelector('.release-update-actions');
        const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
        const declineBtn = document.getElementById('declineReleaseUpdateBtn');
        const closeBtn = document.getElementById('closeReleaseUpdateModal');

        if (footer) { footer.hidden = locked; }
        if (actions) { actions.hidden = locked; }
        if (downloadBtn) {
            downloadBtn.style.display = '';
            downloadBtn.disabled = false;
        }
        if (declineBtn) {
            declineBtn.disabled = locked;
            declineBtn.setAttribute('aria-disabled', String(locked));
        }
        if (closeBtn) {
            closeBtn.disabled = locked;
            closeBtn.setAttribute('aria-disabled', String(locked));
        }
    }

    const escapeHtmlFallback = app.helpers.escapeHtml;
    const renderMarkdown = app.markdown ? app.markdown.renderMarkdown : null;
    function __showToast(msg, dur) { app.toast.showToast(msg, dur); }

    function resetReleaseUpdateButton() {
        setReleaseUpdateActionsLocked(false);
        setReleaseUpdateProgress(0, 'idle');
        applyUpdateDownloadLabel();
        isDownloadingUpdate = false;
        isUpdateDownloaded = false;
        maxDownloadPercent = 0;
    }

    function showReleaseUpdateModal(info) {
        latestReleaseUpdate = info;
        currentUpdateInstallMode = ['manual', 'system', 'launcher', 'in-app'].includes(info?.installMode)
            ? info.installMode
            : 'in-app';
        const currentVer = document.getElementById('releaseUpdateCurrent');
        const latestVer = document.getElementById('releaseUpdateLatest');
        if (currentVer) {currentVer.textContent = `v${info.currentVersion || '---'}`;}
        if (latestVer) {latestVer.textContent = `v${info.latestVersion || '---'}`;}

        populateReleaseChangelog(info.releaseNotes);

        resetReleaseUpdateButton();
        if (info?.downloaded) {
            isUpdateDownloaded = true;
            maxDownloadPercent = 100;
            setReleaseUpdateProgress(100, 'complete');
            applyUpdateDownloadLabel();
        }
        const modal = getEl('releaseUpdateModal');
        if (modal) {
            modal.style.display = 'flex';
            trapFocus(modal, modal.querySelector('.release-update-modal-content'));
        }
        app.icons.refreshIcons();
    }

    function populateReleaseChangelog(releaseNotes) {
        const section = document.getElementById('releaseUpdateChangelog');
        const content = document.getElementById('releaseUpdateChangelogContent');
        const toggle = document.getElementById('releaseUpdateChangelogToggle');
        if (!section || !content) {return;}

        const preferredLocale = (app.i18n && typeof app.i18n.getCurrentLang === 'function')
            ? app.i18n.getCurrentLang()
            : (navigator.language || 'en');
        const { notes, locale: notesLocale } = resolveLocalizedReleaseNotes(releaseNotes, preferredLocale);
        if (!notes) {
            section.hidden = true;
            section.setAttribute('aria-expanded', 'false');
            if (toggle) {toggle.setAttribute('aria-expanded', 'false');}
            content.textContent = '';
            return;
        }

        section.hidden = false;
        section.setAttribute('aria-expanded', 'true');
        if (toggle) {toggle.setAttribute('aria-expanded', 'true');}
        const renderNotes = app.markdown?.renderReleaseNotes || renderMarkdown;
        const rendered = (typeof renderNotes === 'function')
            ? renderNotes(notes)
            : escapeHtmlFallback(notes).replace(/\r?\n/g, '<br>');
        const html = shouldTranslateChangelogSections(preferredLocale, notesLocale)
            ? translateChangelogSections(rendered)
            : rendered;
        content.innerHTML = html
            ? sanitizeHtml(html)
            : `<p class="release-update-changelog-empty">${escapeHtmlFallback(app.i18n ? app.i18n.t('update_changelog_empty') : 'No details for this release.')}</p>`;
    }

    function normalizeReleaseNotes(value) {
        const preferredLocale = (app.i18n && typeof app.i18n.getCurrentLang === 'function')
            ? app.i18n.getCurrentLang()
            : (navigator.language || 'en');
        return resolveLocalizedReleaseNotes(value, preferredLocale).notes;
    }

    function queueOrShowReleaseUpdate(info) {
        if (info.latestVersion === dismissedReleaseVersion) {return;}
        const welcome = getEl('welcomeModal');
        if (welcome && welcome.style.display === 'flex') {
            latestReleaseUpdate = info;
            return;
        }
        showReleaseUpdateModal(info);
    }

    function handleUpdateCheckResult(result) {
        if (result?.error || result?.ok === false) {
            console.warn('Release update check failed:', result?.error);
            __showToast(translateUpdateError(app.i18n, result?.error), 4000);
            return;
        }
        if (result?.updateAvailable) {
            queueOrShowReleaseUpdate(result);
        } else if (result?.ok !== false) {
            __showToast(app.i18n.t('update_up_to_date'), 3000);
        }
    }

    async function checkReleaseUpdateOnStartup() {
        if (!app.electronAPI || !app.electronAPI.checkReleaseUpdate) {return;}
        try {
            const result = await app.electronAPI.checkReleaseUpdate();
            handleUpdateCheckResult(result);
        } catch (err) {
            console.warn('Release update check failed:', err);
        }
    }

    function bindReleaseUpdateEvents() {
        if (!app.electronAPI) {return;}

        if (app.electronAPI.onReleaseUpdateAvailable) {
            app.electronAPI.onReleaseUpdateAvailable((info) => queueOrShowReleaseUpdate(info));
        }
        if (app.electronAPI.onReleaseUpdateError) {
            app.electronAPI.onReleaseUpdateError((message) => {
                isDownloadingUpdate = false;
                resetReleaseUpdateButton();
                __showToast(translateUpdateError(app.i18n, message), 4000);
            });
        }
        if (app.electronAPI.onUpdateDownloadProgress) {
            app.electronAPI.onUpdateDownloadProgress((progress) => {
                if (!isDownloadingUpdate && !isUpdateDownloaded) { return; }
                maxDownloadPercent = normalizeDownloadPercent(maxDownloadPercent, progress);
                setReleaseUpdateProgress(maxDownloadPercent, 'downloading');
            });
        }
        if (app.electronAPI.onUpdateDownloaded) {
            app.electronAPI.onUpdateDownloaded(async (info) => {
                isDownloadingUpdate = false;
                isUpdateDownloaded = true;
                maxDownloadPercent = 100;
                setReleaseUpdateActionsLocked(false);
                setReleaseUpdateProgress(100, 'complete');
                applyUpdateDownloadLabel();
                if (info?.autoInstall) {
                    setReleaseUpdateActionsLocked(true);
                    return;
                }
                if (currentUpdateInstallMode === 'manual') {
                    __showToast(app.i18n.t('update_manual_install_hint'), 5000);
                }
            });
        }
    }

    const bundledVersion = typeof __TREEIDE_VERSION__ !== 'undefined' ? __TREEIDE_VERSION__ : null;

    function formatVersionText(version, isPackaged) {
        if (!version) { return 'v---'; }
        return isPackaged ? `v${version}` : `v${version} dev`;
    }

    function applyVersionDisplay(versionText) {
        const aboutVersion = document.getElementById('aboutVersion');
        if (aboutVersion) { aboutVersion.textContent = versionText; }
        const settingsVersion = document.getElementById('settingsCurrentVersion');
        if (settingsVersion) { settingsVersion.textContent = versionText; }
    }

    function formatReleaseDate(isoDate, lang) {
        if (!isoDate) { return ''; }
        const d = new Date(isoDate);
        if (Number.isNaN(d.getTime())) { return ''; }
        return d.toLocaleDateString(lang, { day: '2-digit', month: 'short', year: 'numeric' });
    }

    async function initializeAppInfo() {
        const lang = toDateLocale(app.i18n?.getCurrentLang?.() || 'en');
        const lastCheckedEl = document.getElementById('settingsLastChecked');
        let versionText = formatVersionText(bundledVersion, false);

        if (app.electronAPI?.getAppInfo) {
            try {
                const appInfo = await app.electronAPI.getAppInfo();
                if (!appInfo?.error && appInfo?.version) {
                    versionText = formatVersionText(appInfo.version, !!appInfo.isPackaged);
                }
            } catch (err) {
                console.warn('App info unavailable:', err);
            }
        }

        applyVersionDisplay(versionText);

        if (lastCheckedEl) {
            const cached = localStorage.getItem('current_release_date');
            lastCheckedEl.textContent = cached ? formatReleaseDate(cached, lang) : '';
        }

        if (app.electronAPI?.getCurrentReleaseInfo) {
            try {
                const info = await app.electronAPI.getCurrentReleaseInfo();
                if (!info?.error && info?.releaseDate) {
                    localStorage.setItem('current_release_date', info.releaseDate);
                    if (lastCheckedEl) {
                        lastCheckedEl.textContent = formatReleaseDate(info.releaseDate, lang);
                    }
                }
            } catch (err) {
                console.warn('Release info unavailable:', err);
            }
        }

        applyUpdateDownloadLabel();
        if (latestReleaseUpdate?.releaseNotes) {
            populateReleaseChangelog(latestReleaseUpdate.releaseNotes);
        }
    }

    // Fallback when no translated release notes exist for the user's
    // locale: rewrite English section headers in the rendered HTML.
    function translateChangelogSections(html) {
        if (!html || !app.i18n) {return html;}
        let currentLang = 'en';
        try {
            currentLang = app.i18n.getCurrentLang();
        } catch (err) {
            return html;
        }
        if (currentLang === 'en') {return html;}

        const sections = ['added', 'changed', 'fixed', 'removed', 'other', 'breaking'];
        let result = html;
        for (const section of sections) {
            const key = `update_changelog_section_${section}`;
            let localized = key;
            try {
                localized = app.i18n.t(key);
            } catch (err) {
                // t() throws when the active language has no
                // translations object at all (e.g. a brand-new locale
                // string). Treat that the same as a missing key.
                continue;
            }
            // If the translation is missing, t() returns the key itself
            // (e.g. "update_changelog_section_added"). Skip those so we
            // never replace a real English header with a leaked key.
            if (localized === key) {continue;}
            const english = section.charAt(0).toUpperCase() + section.slice(1);
            for (const tag of ['h2', 'h3', 'h4']) {
                result = result.replaceAll(`<${tag}>${english}</${tag}>`, `<${tag}>${localized}</${tag}>`);
                result = result.replaceAll(`<${tag}>${english.toLowerCase()}</${tag}>`, `<${tag}>${localized}</${tag}>`);
            }
        }
        return result;
    }

    // Sidebar tabs in settings
    const sidebarTabs = document.querySelectorAll('.sidebar-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    sidebarTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            sidebarTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === `tab-${targetTab}`) {pane.classList.add('active');}
            });
            app.icons.refreshIcons();
        });
    });

    // Prompt modal
    let promptResolver = null;
    const promptModal = document.getElementById('promptModal');
    const promptTitle = document.getElementById('promptTitle');
    const promptLabel = document.getElementById('promptLabel');
    const promptInput = document.getElementById('promptInput');

    function closePromptModal(value) {
        const resolver = promptResolver;
        promptResolver = null;
        if (promptModal && promptModal.style.display === 'flex') {
            closeModalAnimated(promptModal, {
                onClosed: () => { if (resolver) { resolver(value); } }
            });
        } else if (resolver) {
            resolver(value);
        }
    }

    let decryptPasswordResolver = null;
    const decryptPasswordModal = document.getElementById('decryptPasswordModal');
    const decryptPasswordTitle = document.getElementById('decryptPasswordTitle');
    const decryptPasswordLead = document.getElementById('decryptPasswordLead');
    const decryptPasswordLabel = document.getElementById('decryptPasswordLabel');
    const decryptPasswordInput = document.getElementById('decryptPasswordInput');
    const decryptPasswordError = document.getElementById('decryptPasswordError');

    function closeDecryptPasswordModal(value) {
        const resolver = decryptPasswordResolver;
        decryptPasswordResolver = null;
        if (decryptPasswordModal && decryptPasswordModal.style.display === 'flex') {
            closeModalAnimated(decryptPasswordModal, {
                onClosed: () => { if (resolver) { resolver(value); } }
            });
        } else if (resolver) {
            resolver(value);
        }
    }

    const DECRYPT_LEAD_KEYS = {
        tree: 'decrypt_password_lead_tree',
        zip: 'decrypt_password_lead_zip',
        both: 'decrypt_password_lead_both'
    };

    function renderDecryptPasswordLead(kind, fileName) {
        const t = (key) => app.i18n.t(key);
        const safeName = escapeHtmlFallback(fileName || t('untitled'));
        const leadKey = DECRYPT_LEAD_KEYS[kind] || DECRYPT_LEAD_KEYS.tree;
        return t(leadKey).replace('{file}', `<span class="decrypt-password-file">${safeName}</span>`);
    }

    function focusDecryptPasswordInput(selectOnError = false) {
        if (!decryptPasswordInput) { return; }
        decryptPasswordInput.focus();
        if (selectOnError) {
            decryptPasswordInput.select();
        }
    }

    function showDecryptPasswordModal({ fileName, kind = 'tree', wrongPassword = false }) {
        const t = (key) => app.i18n.t(key);

        if (decryptPasswordTitle) {
            decryptPasswordTitle.textContent = t('decrypt_password_title');
        }
        if (decryptPasswordLabel) {
            decryptPasswordLabel.textContent = t('decrypt_password_label');
        }
        if (decryptPasswordLead) {
            decryptPasswordLead.innerHTML = renderDecryptPasswordLead(kind, fileName);
        }
        if (decryptPasswordInput) {
            decryptPasswordInput.placeholder = t('decrypt_password_placeholder');
            if (!wrongPassword) {
                decryptPasswordInput.value = '';
            }
        }
        if (decryptPasswordError) {
            if (wrongPassword) {
                decryptPasswordError.hidden = false;
                decryptPasswordError.textContent = t('error_wrong_password');
            } else {
                decryptPasswordError.hidden = true;
                decryptPasswordError.textContent = '';
            }
        }

        decryptPasswordResolver = null;
        if (decryptPasswordModal) {
            decryptPasswordModal.style.display = 'flex';
            trapFocus(decryptPasswordModal, decryptPasswordInput);
            app.icons.refreshIcons(decryptPasswordModal);
        }
        focusDecryptPasswordInput(wrongPassword);

        return new Promise((resolve) => { decryptPasswordResolver = resolve; });
    }

    const decryptPasswordSubmit = document.getElementById('decryptPasswordSubmit');
    const decryptPasswordCancel = document.getElementById('decryptPasswordCancel');
    const closeDecryptPasswordModalBtn = document.getElementById('closeDecryptPasswordModal');

    const submitDecryptPassword = () => {
        const value = decryptPasswordInput?.value || '';
        if (!value.trim()) {
            if (decryptPasswordError) {
                decryptPasswordError.hidden = false;
                decryptPasswordError.textContent = app.i18n.t('decrypt_password_required');
            }
            decryptPasswordInput?.focus();
            return;
        }
        closeDecryptPasswordModal(value);
    };

    if (decryptPasswordSubmit) {
        decryptPasswordSubmit.addEventListener('click', submitDecryptPassword);
    }
    if (decryptPasswordCancel) {
        decryptPasswordCancel.addEventListener('click', () => closeDecryptPasswordModal(null));
    }
    if (closeDecryptPasswordModalBtn) {
        closeDecryptPasswordModalBtn.addEventListener('click', () => closeDecryptPasswordModal(null));
    }
    if (decryptPasswordInput) {
        decryptPasswordInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitDecryptPassword();
            }
        });
    }

    function showPromptAsync(message, defaultValue = '', title) {
        if (promptLabel) {promptLabel.textContent = message;}
        if (promptTitle) {promptTitle.textContent = title || app.i18n.t('template_name_prompt');}
        if (promptInput) {
            promptInput.value = defaultValue || '';
        }
        promptResolver = null;
        if (promptModal) {
            promptModal.style.display = 'flex';
            trapFocus(promptModal);
            if (promptInput) {
                setTimeout(() => {
                    promptInput.focus();
                    promptInput.select();
                }, 0);
            }
        }
        return new Promise((resolve) => { promptResolver = resolve; });
    }

    // Confirm modal
    let confirmCallback = null;
    let confirmResolver = null;
    let confirmBusy = false;
    const confirmIdleWaiters = [];
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMsg = document.getElementById('confirmMsg');

    function showConfirm(message, title, onConfirm) {
        if (confirmMsg) {confirmMsg.textContent = message;}
        if (confirmTitle) {confirmTitle.textContent = title || app.i18n.t('confirm_title');}
        // A new modal invocation invalidates any prior pending resolver/callback.
        // Otherwise a previous async confirm could fire when the user later
        // clicks Agree on a new confirm that uses a sync callback.
        confirmCallback = onConfirm || null;
        confirmResolver = null;
        if (confirmModal) {
            confirmModal.style.display = 'flex';
            trapFocus(confirmModal);
        }
    }

    function closeReleaseUpdateModal() {
        if (isDownloadingUpdate) { return; }
        if (latestReleaseUpdate?.latestVersion) { dismissedReleaseVersion = latestReleaseUpdate.latestVersion; }
        const modal = getEl('releaseUpdateModal');
        if (modal) {
            closeModalAnimated(modal);
        }
    }

    // Bind release update button events
    const declineReleaseUpdateBtn = document.getElementById('declineReleaseUpdateBtn');
    if (declineReleaseUpdateBtn) {declineReleaseUpdateBtn.addEventListener('click', closeReleaseUpdateModal);}

    const closeReleaseUpdateModalBtn = document.getElementById('closeReleaseUpdateModal');
    if (closeReleaseUpdateModalBtn) {closeReleaseUpdateModalBtn.addEventListener('click', closeReleaseUpdateModal);}

    // Changelog toggle (collapsible "What's new" section)
    const changelogSection = document.getElementById('releaseUpdateChangelog');
    const changelogToggle = document.getElementById('releaseUpdateChangelogToggle');
    if (changelogSection && changelogToggle) {
        changelogToggle.addEventListener('click', () => {
            const expanded = changelogToggle.getAttribute('aria-expanded') === 'true';
            const next = !expanded;
            changelogToggle.setAttribute('aria-expanded', String(next));
            changelogSection.setAttribute('aria-expanded', String(next));
        });
    }

    const downloadReleaseUpdateBtn = document.getElementById('downloadReleaseUpdateBtn');
    if (downloadReleaseUpdateBtn) {
        downloadReleaseUpdateBtn.addEventListener('click', async () => {
            if (isUpdateDownloaded) {
                const result = await app.electronAPI.installUpdate();
                if (result?.manual) {
                    __showToast(app.i18n.t('update_manual_install_hint'), 5000);
                } else if (result?.system) {
                    __showToast(app.i18n.t('update_system_install_started'), 5000);
                } else if (result && !result.ok) {
                    __showToast(translateUpdateError(app.i18n, result.error), 4000);
                }
                return;
            }
            if (isDownloadingUpdate) {return;}

            maxDownloadPercent = 0;
            isDownloadingUpdate = true;
            setReleaseUpdateActionsLocked(true);
            setReleaseUpdateProgress(0, 'downloading');

            try {
                const result = await app.electronAPI.downloadUpdate();
                if (result && !result.ok) {
                    isDownloadingUpdate = false;
                    resetReleaseUpdateButton();
                    __showToast(translateUpdateError(app.i18n, result.error), 4000);
                }
            } catch (err) {
                isDownloadingUpdate = false;
                resetReleaseUpdateButton();
                __showToast(app.i18n.t('update_failed'), 4000);
            }
        });
    }

    // Focus trap — keeps Tab/Shift+Tab cycling inside the active modal
    let trappedModal = null;
    let lastFocusedBeforeModal = null;
    const MODAL_CLOSE_MS = 260;
    const modalCloseStates = new WeakMap();

    function getModalCloseState(modal) {
        let state = modalCloseStates.get(modal);
        if (!state) {
            state = { generation: 0, timeoutId: null };
            modalCloseStates.set(modal, state);
        }
        return state;
    }

    function cancelModalClose(modal) {
        if (!modal) { return; }
        const state = getModalCloseState(modal);
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }
        state.generation += 1;
        modal.classList.remove('closing');
    }

    function closeModalAnimated(modal, { releaseTrap = true, onClosed } = {}) {
        if (!modal) {
            onClosed?.();
            return;
        }

        if (modal.style.display !== 'flex') {
            onClosed?.();
            return;
        }

        if (modal.classList.contains('closing')) {
            onClosed?.();
            return;
        }

        const state = getModalCloseState(modal);
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }

        const generation = state.generation + 1;
        state.generation = generation;
        modal.classList.add('closing');

        let finished = false;
        const finish = () => {
            if (finished || state.generation !== generation) { return; }
            finished = true;
            state.timeoutId = null;
            modal.classList.remove('closing');
            modal.style.display = 'none';
            if (releaseTrap && trappedModal === modal) {
                releaseFocus();
            }
            onClosed?.();
        };

        const animTarget = modal.querySelector('.modal-content') || modal;
        animTarget.addEventListener('animationend', (e) => {
            if (e.target === animTarget) { finish(); }
        }, { once: true });
        state.timeoutId = setTimeout(finish, MODAL_CLOSE_MS);
    }

    function trapFocus(modal, preferredFocusEl = null) {
        if (!modal) { return; }
        cancelModalClose(modal);
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const focusTarget = preferredFocusEl && modal.contains(preferredFocusEl)
            ? preferredFocusEl
            : focusable[0];
        if (trappedModal === modal) {
            focusTarget?.focus();
            return;
        }
        trappedModal = modal;
        lastFocusedBeforeModal = document.activeElement;
        focusTarget?.focus();
    }

    function releaseFocus() {
        if (!trappedModal) {return;}
        trappedModal = null;
        if (lastFocusedBeforeModal && document.contains(lastFocusedBeforeModal)) {
            lastFocusedBeforeModal.focus();
        }
        lastFocusedBeforeModal = null;
    }

    function releaseConfirmBusy() {
        confirmBusy = false;
        const waiters = confirmIdleWaiters.splice(0);
        waiters.forEach((resolve) => resolve());
    }

    function waitForConfirmIdle() {
        if (!confirmBusy) { return Promise.resolve(); }
        return new Promise((resolve) => { confirmIdleWaiters.push(resolve); });
    }

    function settleConfirm(result) {
        const callback = confirmCallback;
        const resolver = confirmResolver;
        confirmCallback = null;
        confirmResolver = null;

        const finish = () => {
            if (result && callback) { callback(); }
            if (resolver) { resolver(result); }
            releaseConfirmBusy();
        };

        if (!confirmModal || confirmModal.style.display !== 'flex') {
            finish();
            return Promise.resolve();
        }

        return new Promise((done) => {
            closeModalAnimated(confirmModal, {
                onClosed: () => {
                    finish();
                    done();
                }
            });
        });
    }

    function showConfirmAsync(message, title) {
        return waitForConfirmIdle().then(() => {
            confirmBusy = true;
            showConfirm(message, title, null);
            return new Promise((resolve) => { confirmResolver = resolve; });
        });
    }

    function handleFocusTrap(e) {
        if (!trappedModal || trappedModal.style.display !== 'flex' || trappedModal.classList.contains('closing')) { return; }
        const focusable = trappedModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) {return;}
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.key === 'Escape') {
            e.preventDefault();
            const id = trappedModal.id;
            const modal = trappedModal;

            if (id === 'templatesModal') {
                app.templates?.closeTemplatesModal?.();
            } else if (id === 'settingsModal' || id === 'aboutModal' || id === 'unsavedModal') {
                closeModalAnimated(modal);
            } else if (id === 'confirmModal') {
                settleConfirm(false);
            } else if (id === 'promptModal') {
                closePromptModal(null);
            } else if (id === 'decryptPasswordModal') {
                closeDecryptPasswordModal(null);
            } else if (id === 'releaseUpdateModal') {
                closeReleaseUpdateModal();
            } else if (id === 'welcomeModal') {
                closeModalAnimated(modal, {
                    onClosed: () => { localStorage.setItem('onboarding_done', 'true'); }
                });
            }
            return;
        }
        if (e.key === 'Tab') {
            if (e.defaultPrevented) { return; }
            const active = document.activeElement;
            const indentEditorIds = new Set(['editor', 'templateTreeEditor', 'templateFileEditor', 'filePreviewEditor']);
            if (
                indentEditorIds.has(active?.id)
                && !e.ctrlKey
                && !e.metaKey
                && !e.altKey
            ) {
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
    }

    document.addEventListener('keydown', handleFocusTrap);

    // Global click handler for modal dismiss and external links
    window.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href && e.target.href.startsWith('http') && app.electronAPI) {
            e.preventDefault();
            app.electronAPI.openExternal(e.target.href);
        }
        if (e.target.id === 'settingsModal') { closeModalAnimated(e.target); }
        if (e.target.id === 'aboutModal') { closeModalAnimated(e.target); }
        if (e.target.id === 'templatesModal') { app.templates?.closeTemplatesModal?.(); }
        if (e.target.id === 'releaseUpdateModal') { closeReleaseUpdateModal(); }
        if (e.target.id === 'unsavedModal') { closeModalAnimated(e.target); }
        if (e.target.id === 'welcomeModal') { return; }
        if (e.target.id === 'promptModal') {
            closePromptModal(null);
        }
        if (e.target.id === 'decryptPasswordModal') {
            closeDecryptPasswordModal(null);
        }
        if (e.target.id === 'confirmModal') {
            settleConfirm(false);
        }
    });

    return {
        showPromptAsync,
        closePromptModal,
        showDecryptPasswordModal,
        closeDecryptPasswordModal,
        showConfirm,
        showConfirmAsync,
        settleConfirm,
        showReleaseUpdateModal,
        closeReleaseUpdateModal,
        resetReleaseUpdateButton,
        checkReleaseUpdateOnStartup,
        handleUpdateCheckResult,
        bindReleaseUpdateEvents,
        initializeAppInfo,
        populateReleaseChangelog,
        normalizeReleaseNotes,
        translateChangelogSections,
        closeModalAnimated,
        trapFocus,
        releaseFocus,
        get latestReleaseUpdate() { return latestReleaseUpdate; },
        set latestReleaseUpdate(val) { latestReleaseUpdate = val; },
        get confirmCallback() { return confirmCallback; },
        set confirmCallback(val) { confirmCallback = val; },
        get confirmResolver() { return confirmResolver; },
        set confirmResolver(val) { confirmResolver = val; },
        get promptResolver() { return promptResolver; },
        set promptResolver(val) { promptResolver = val; }
    };


}

