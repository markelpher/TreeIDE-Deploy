import { resolveBuildContentKind } from './build-content.js';

const STORAGE_KEYS = {
    enabled: 'discord_presence_enabled',
    statusBar: 'discord_presence_status_bar',
    privacy: 'discord_presence_privacy',
    language: 'discord_presence_language',
    legacyShareProjectName: 'discord_presence_share_project_name'
};

const PRIVACY_LEVELS = new Set(['basic', 'activity', 'detailed']);
const PRESENCE_LANGUAGES = new Set(['app', 'en', 'pt', 'es']);
const PRIVACY_DESCRIPTION_KEYS = {
    basic: 'discord_privacy_basic_desc',
    activity: 'discord_privacy_activity_desc',
    detailed: 'discord_privacy_detailed_desc'
};
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const ACTIVITY_SIGNAL_THROTTLE_MS = 15000;
const EDITOR_ENTRY_EVENTS = new Set(['pointerdown', 'focusin', 'keydown', 'input', 'touchstart']);

const STATUS_I18N_KEYS = {
    disabled: 'discord_status_disabled',
    'configuration-required': 'discord_status_configuration_required',
    connecting: 'discord_status_connecting',
    connected: 'discord_status_connected',
    disconnected: 'discord_status_disconnected',
    paused: 'discord_status_paused',
    error: 'discord_status_error'
};

const CONNECTION_BAR_I18N_KEYS = {
    connected: 'discord_connection_connected',
    reconnecting: 'discord_connection_reconnecting'
};

function resolveBuildActivityState({ outputMode, alsoExportZip, files = 0, folders = 0 }) {
    if (outputMode === 'zip' || outputMode === 'tree' || alsoExportZip) {
        return 'exporting_file';
    }
    return `creating_${resolveBuildContentKind({ files, folders })}`;
}

export function createDiscordPresenceUi(app) {
    let initialized = false;
    let lastStatus = 'disabled';
    let updateTimer = null;
    let idleTimer = null;
    let observer = null;
    let isIdle = true;
    let hasEnteredStructureEditor = false;
    let isEditingFile = false;
    let isWorkspaceDeselected = false;
    let lastActivitySignal = 0;

    const getControls = () => ({
        enabled: document.getElementById('discordPresenceToggle'),
        statusBar: document.getElementById('discordPresenceBarToggle'),
        privacy: document.getElementById('discordPrivacySelect'),
        language: document.getElementById('discordLanguageSelect'),
        status: document.getElementById('discordPresenceStatus'),
        connectionBar: document.getElementById('discordPresenceConnectionBar'),
        connectionText: document.getElementById('discordPresenceConnectionText')
    });

    const isEnabled = () => localStorage.getItem(STORAGE_KEYS.enabled) === 'true';
    const isStatusBarEnabled = () => localStorage.getItem(STORAGE_KEYS.statusBar) !== 'false';

    function getPrivacyLevel() {
        const saved = localStorage.getItem(STORAGE_KEYS.privacy);
        if (PRIVACY_LEVELS.has(saved)) {
            return saved;
        }
        const migrated = localStorage.getItem(STORAGE_KEYS.legacyShareProjectName) === 'true' ? 'detailed' : 'activity';
        localStorage.setItem(STORAGE_KEYS.privacy, migrated);
        return migrated;
    }

    function getPresenceLanguage() {
        const saved = localStorage.getItem(STORAGE_KEYS.language);
        const preference = PRESENCE_LANGUAGES.has(saved) ? saved : 'app';
        return preference === 'app' ? app.i18n?.getCurrentLang?.() || 'en' : preference;
    }

    function getBuildActivityState() {
        const outputMode = document.getElementById('buildStudioOutputModeZip')?.checked
            ? 'zip'
            : document.getElementById('buildStudioOutputModeTree')?.checked
              ? 'tree'
              : 'structure';
        const alsoExportZip = document.getElementById('buildStudioAlsoExportZip')?.checked === true;
        const counts = app.buildStudio?.getPresenceBuildCounts?.() || { files: 0, folders: 0 };
        return resolveBuildActivityState({ outputMode, alsoExportZip, ...counts });
    }

    function getActiveFileKind() {
        return app.fileTypes?.getFilePresenceKind?.(app.state.activePreviewPath) || 'code';
    }

    function getActivityState() {
        if (isIdle) {
            return 'idle';
        }
        if (document.body.classList.contains('build-studio-active')) {
            return getBuildActivityState();
        }
        if (document.body.classList.contains('templates-active')) {
            return document.getElementById('templatesTabCustom')?.getAttribute('aria-selected') === 'true' ? 'customizing_template' : 'browsing_templates';
        }
        if (document.getElementById('settingsModal')?.style.display === 'flex') {
            return 'settings';
        }
        if (isWorkspaceDeselected) {
            return 'idle';
        }
        if (app.state.filePreviewPanel?.classList.contains('show') && app.state.activePreviewPath) {
            if (isEditingFile) {
                return getActiveFileKind() === 'text' ? 'editing_text' : 'editing_code';
            }
            return 'viewing_file';
        }
        return hasEnteredStructureEditor ? 'editing_structure' : 'idle';
    }

    function getActivity() {
        const privacy = getPrivacyLevel();
        const state = getActivityState();
        const activity = {
            state,
            privacy,
            language: getPresenceLanguage()
        };
        if (['viewing_file', 'editing_code', 'editing_text'].includes(state)) {
            activity.fileKind = getActiveFileKind();
        }
        if (privacy === 'detailed') {
            activity.projectName = String(app.state.lastSavedProjectName || app.state.fileNameEl?.textContent || '').trim();
            if (['viewing_file', 'editing_code', 'editing_text'].includes(state)) {
                activity.fileType = String(app.state.filePreviewMode?.textContent || '').trim();
            }
        }
        return activity;
    }

    function getConnectionBarStatus(status) {
        if (status === 'connected') { return 'connected'; }
        if (status === 'connecting') { return 'reconnecting'; }
        if (status === 'error' || status === 'configuration-required') { return 'error'; }
        if (status === 'disconnected') { return 'error'; }
        return null;
    }

    function isConnectionFailure(status) {
        return status === 'error' || status === 'configuration-required' || status === 'disconnected';
    }

    function renderConnectionBar() {
        const controls = getControls();
        const barStatus = getConnectionBarStatus(lastStatus);
        const visible = isEnabled() && isStatusBarEnabled() && Boolean(barStatus);
        document.body.classList.toggle('discord-presence-bar-visible', visible);
        if (!controls.connectionBar || !controls.connectionText) { return; }

        controls.connectionBar.hidden = !visible;
        if (!visible) { return; }

        const reconnectText = app.i18n.t('discord_connection_reconnect');
        const actionable = isConnectionFailure(lastStatus);
        const statusText = actionable ? reconnectText : app.i18n.t(CONNECTION_BAR_I18N_KEYS[barStatus]);
        controls.connectionBar.dataset.status = barStatus;
        controls.connectionBar.classList.toggle('is-actionable', actionable);
        controls.connectionBar.setAttribute('aria-disabled', String(!actionable));
        controls.connectionBar.setAttribute('aria-label', statusText);
        controls.connectionBar.title = actionable ? reconnectText : statusText;
        controls.connectionText.textContent = statusText;
    }

    function renderStatus(status = lastStatus) {
        lastStatus = STATUS_I18N_KEYS[status] ? status : 'error';
        const element = getControls().status;
        if (element) {
            element.dataset.status = lastStatus;
            element.textContent = app.i18n.t(STATUS_I18N_KEYS[lastStatus]);
        }
        renderConnectionBar();
    }

    function renderPrivacyDescription() {
        const element = document.getElementById('discordPrivacyDescription');
        if (!element) {
            return;
        }
        const key = PRIVACY_DESCRIPTION_KEYS[getPrivacyLevel()];
        element.dataset.i18n = key;
        element.textContent = app.i18n.t(key);
    }

    function syncControlAvailability() {
        const controls = getControls();
        if (controls.statusBar) {
            controls.statusBar.disabled = !isEnabled();
        }
        app.customSelect?.refreshAll?.();
    }

    async function configure() {
        syncControlAvailability();
        if (!app.electronAPI?.configureDiscordPresence) {
            return;
        }
        const result = await app.electronAPI.configureDiscordPresence({
            enabled: isEnabled(),
            activity: getActivity()
        });
        if (result?.status) {
            renderStatus(result.status);
        }
    }

    async function updateActivity() {
        if (!isEnabled() || !app.electronAPI?.updateDiscordPresence) {
            return;
        }
        const result = await app.electronAPI.updateDiscordPresence(getActivity());
        if (result?.status) {
            renderStatus(result.status);
        }
    }

    async function reconnect() {
        if (!isEnabled()) { return; }
        renderStatus('connecting');
        try {
            const result = app.electronAPI?.reconnectDiscordPresence
                ? await app.electronAPI.reconnectDiscordPresence()
                : await app.electronAPI?.configureDiscordPresence?.({ enabled: true, activity: getActivity() });
            if (lastStatus !== 'connecting') { return; }
            if (result?.status) {
                renderStatus(result.status);
            } else if (result?.error) {
                renderStatus('error');
            }
        } catch {
            if (lastStatus === 'connecting') {
                renderStatus('error');
            }
        }
    }

    function scheduleActivityUpdate(delay = 120) {
        clearTimeout(updateTimer);
        updateTimer = setTimeout(() => {
            void updateActivity();
        }, delay);
    }

    function scheduleIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            isIdle = true;
            hasEnteredStructureEditor = false;
            isEditingFile = false;
            isWorkspaceDeselected = true;
            scheduleActivityUpdate(0);
        }, IDLE_TIMEOUT_MS);
    }

    function isBlankWorkspaceTarget(target) {
        return (
            target === document.body ||
            target === document.getElementById('editorLayout') ||
            target === document.getElementById('treeView') ||
            target === document.getElementById('projectTabsBar') ||
            target?.classList?.contains('preview-area') ||
            target?.classList?.contains('toolbar') ||
            target?.classList?.contains('flex-spacer')
        );
    }

    function markActive(event) {
        const wasStructureEditorActive = hasEnteredStructureEditor;
        const wasEditingFile = isEditingFile;
        const wasWorkspaceDeselected = isWorkspaceDeselected;
        const entersEditor = EDITOR_ENTRY_EVENTS.has(event?.type);
        if (entersEditor && event?.target === app.state.editor) {
            hasEnteredStructureEditor = true;
            isEditingFile = false;
            isWorkspaceDeselected = false;
        } else if (entersEditor && event?.target === app.state.filePreviewEditor) {
            hasEnteredStructureEditor = false;
            isEditingFile = true;
            isWorkspaceDeselected = false;
        } else if (event?.type === 'pointerdown' && isBlankWorkspaceTarget(event.target)) {
            hasEnteredStructureEditor = false;
            isEditingFile = false;
            isWorkspaceDeselected = true;
        } else if (event?.type === 'pointerdown') {
            isEditingFile = false;
            isWorkspaceDeselected = false;
        } else if (event?.type === 'focusin') {
            isEditingFile = false;
        }
        const editorStateChanged =
            wasStructureEditorActive !== hasEnteredStructureEditor || wasEditingFile !== isEditingFile || wasWorkspaceDeselected !== isWorkspaceDeselected;
        const now = Date.now();
        if (!isIdle && !editorStateChanged && now - lastActivitySignal < ACTIVITY_SIGNAL_THROTTLE_MS) {
            return;
        }
        lastActivitySignal = now;
        const wasIdle = isIdle;
        isIdle = false;
        scheduleIdleTimer();
        if (wasIdle || editorStateChanged) {
            scheduleActivityUpdate(0);
        }
    }

    function bindUserActivity() {
        ['pointerdown', 'pointermove', 'focusin', 'keydown', 'input', 'wheel', 'touchstart'].forEach((eventName) => {
            document.addEventListener(eventName, markActive, { passive: true });
        });
        scheduleIdleTimer();
    }

    function bindControls() {
        const controls = getControls();
        controls.enabled?.addEventListener('change', (event) => {
            localStorage.setItem(STORAGE_KEYS.enabled, String(event.target.checked));
            renderStatus(event.target.checked ? 'connecting' : 'disabled');
            markActive();
            void configure();
        });
        controls.connectionBar?.addEventListener('click', () => {
            if (isConnectionFailure(lastStatus)) {
                void reconnect();
            }
        });
        controls.statusBar?.addEventListener('change', (event) => {
            localStorage.setItem(STORAGE_KEYS.statusBar, String(event.target.checked));
            renderConnectionBar();
        });
        controls.privacy?.addEventListener('change', (event) => {
            const privacy = PRIVACY_LEVELS.has(event.target.value) ? event.target.value : 'activity';
            localStorage.setItem(STORAGE_KEYS.privacy, privacy);
            renderPrivacyDescription();
            void configure();
        });
        controls.language?.addEventListener('change', (event) => {
            const language = PRESENCE_LANGUAGES.has(event.target.value) ? event.target.value : 'app';
            localStorage.setItem(STORAGE_KEYS.language, language);
            void configure();
        });
    }

    function observeActivityChanges() {
        const targets = [
            document.body,
            document.getElementById('settingsModal'),
            document.getElementById('templatesTabCustom'),
            document.getElementById('buildStudio'),
            app.state.fileNameEl,
            app.state.filePreviewPanel
        ].filter(Boolean);
        observer = new MutationObserver(() => scheduleActivityUpdate());
        targets.forEach((target) => {
            observer.observe(target, {
                attributes: true,
                attributeFilter: ['class', 'style', 'aria-selected'],
                childList: true,
                characterData: true,
                subtree: target === app.state.fileNameEl || target.id === 'buildStudio'
            });
        });
        document.addEventListener('change', (event) => {
            if (event.target?.closest?.('#buildStudio')) {
                scheduleActivityUpdate();
            }
        });
    }

    async function init() {
        if (initialized) {
            return;
        }
        initialized = true;
        const controls = getControls();
        if (controls.enabled) {
            controls.enabled.checked = isEnabled();
        }
        if (controls.statusBar) {
            controls.statusBar.checked = isStatusBarEnabled();
        }
        if (controls.privacy) {
            controls.privacy.value = getPrivacyLevel();
        }
        if (controls.language) {
            const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
            controls.language.value = PRESENCE_LANGUAGES.has(savedLanguage) ? savedLanguage : 'app';
        }
        localStorage.removeItem(STORAGE_KEYS.legacyShareProjectName);
        renderStatus();
        renderPrivacyDescription();
        syncControlAvailability();
        bindControls();
        bindUserActivity();
        observeActivityChanges();

        app.electronAPI?.onDiscordPresenceStatusChanged?.((value) => {
            if (value?.status) {
                renderStatus(value.status);
            }
        });
        await configure();
        const currentStatus = await app.electronAPI?.getDiscordPresenceStatus?.();
        if (currentStatus?.status) {
            renderStatus(currentStatus.status);
        }
    }

    function refresh() {
        renderStatus();
        renderPrivacyDescription();
        scheduleActivityUpdate();
    }

    return {
        init,
        refresh,
        configure,
        updateActivity,
        reconnect,
        getActivity,
        getStatus: () => lastStatus,
        markActive,
        disconnectObserver: () => observer?.disconnect()
    };
}

export { IDLE_TIMEOUT_MS, resolveBuildActivityState };
