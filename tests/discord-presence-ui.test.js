/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiscordPresenceUi, IDLE_TIMEOUT_MS } from '../src/renderer/modules/discord-presence.js';

function createTestApp() {
    const updateDiscordPresence = vi.fn(async () => ({ status: 'connected' }));
    const buildCounts = { files: 1, folders: 0 };
    return {
        i18n: {
            getCurrentLang: () => 'pt',
            t: (key) => key
        },
        state: {
            lastSavedProjectName: 'Projeto Teste',
            activePreviewPath: '',
            editor: document.getElementById('editor'),
            filePreviewEditor: document.getElementById('filePreviewEditor'),
            fileNameEl: document.getElementById('fileName'),
            filePreviewPanel: document.getElementById('filePreviewPanel'),
            filePreviewMode: document.getElementById('filePreviewMode')
        },
        customSelect: { refreshAll: vi.fn() },
        fileTypes: {
            getFilePresenceKind: (path) => (/\.(?:md|txt)$/i.test(path) ? 'text' : 'code')
        },
        buildCounts,
        buildStudio: {
            getPresenceBuildCounts: () => ({ ...buildCounts })
        },
        electronAPI: {
            configureDiscordPresence: vi.fn(async () => ({ status: 'connected' })),
            reconnectDiscordPresence: vi.fn(async () => ({ status: 'connecting' })),
            updateDiscordPresence,
            getDiscordPresenceStatus: vi.fn(async () => ({ status: 'connected' })),
            onDiscordPresenceStatusChanged: vi.fn()
        }
    };
}

describe('Discord Presence UI states', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.className = '';
        document.body.innerHTML = `
            <div id="editorLayout"><div class="preview-area"><div id="treeView"></div></div></div>
            <textarea id="editor"></textarea>
            <span id="fileName">Sem título</span>
            <div id="filePreviewPanel"><span id="filePreviewMode">JavaScript</span></div>
            <textarea id="filePreviewEditor"></textarea>
            <div id="validationPanel"></div>
            <div id="settingsModal"></div>
            <button id="templatesTabCustom" aria-selected="false"></button>
            <div id="buildStudio">
                <input id="buildStudioOutputModeStructure" type="radio" checked>
                <input id="buildStudioOutputModeZip" type="radio">
                <input id="buildStudioOutputModeTree" type="radio">
                <input id="buildStudioAlsoExportZip" type="checkbox">
            </div>
            <input id="discordPresenceToggle" type="checkbox">
            <input id="discordPresenceBarToggle" type="checkbox">
            <select id="discordLanguageSelect">
                <option value="app">App</option>
                <option value="pt">Português (Brasil)</option>
                <option value="en">English</option>
                <option value="es">Español</option>
            </select>
            <select id="discordPrivacySelect">
                <option value="basic">Basic</option>
                <option value="activity">Activity</option>
                <option value="detailed">Detailed</option>
            </select>
            <p id="discordPrivacyDescription"></p>
            <span id="discordPresenceStatus"></span>
            <button id="discordPresenceConnectionBar" hidden>
                <span id="discordPresenceConnectionText"></span>
            </button>
        `;
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        document.body.className = '';
    });

    it('starts disabled and locks every dependent setting until enabled', async () => {
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        const enabled = document.getElementById('discordPresenceToggle');
        const statusBar = document.getElementById('discordPresenceBarToggle');
        const language = document.getElementById('discordLanguageSelect');
        const privacy = document.getElementById('discordPrivacySelect');

        expect(localStorage.getItem('discord_presence_enabled')).toBe('false');
        expect(enabled.checked).toBe(false);
        expect(statusBar.disabled).toBe(true);
        expect(language.disabled).toBe(true);
        expect(privacy.disabled).toBe(true);
        expect(app.electronAPI.configureDiscordPresence).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false })
        );

        enabled.checked = true;
        enabled.dispatchEvent(new Event('change', { bubbles: true }));
        expect(statusBar.disabled).toBe(false);
        expect(language.disabled).toBe(false);
        expect(privacy.disabled).toBe(false);
        await vi.waitFor(() => expect(app.electronAPI.configureDiscordPresence).toHaveBeenLastCalledWith(
            expect.objectContaining({ enabled: true })
        ));
        presence.disconnectObserver();
    });

    it('detects editor, file, template, and build states', () => {
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        expect(presence.getActivity().state).toBe('idle');

        presence.markActive({ type: 'pointerdown', target: app.state.editor });
        expect(presence.getActivity().state).toBe('editing_structure');

        app.state.activePreviewPath = 'src/main.js';
        app.state.filePreviewPanel.classList.add('show');
        expect(presence.getActivity()).toMatchObject({ state: 'viewing_file', fileKind: 'code' });

        presence.markActive({ type: 'pointerdown', target: app.state.filePreviewEditor });
        expect(presence.getActivity()).toMatchObject({ state: 'editing_code', fileKind: 'code' });

        app.state.activePreviewPath = 'README.md';
        expect(presence.getActivity()).toMatchObject({ state: 'editing_text', fileKind: 'text' });

        app.state.activePreviewPath = '';
        app.state.filePreviewPanel.classList.remove('show');
        document.body.classList.add('templates-active');
        document.getElementById('templatesTabCustom').setAttribute('aria-selected', 'true');
        expect(presence.getActivity().state).toBe('customizing_template');

        document.body.classList.remove('templates-active');
        document.body.classList.add('build-studio-active');
        expect(presence.getActivity().state).toBe('creating_file');

        app.buildCounts.files = 3;
        expect(presence.getActivity().state).toBe('creating_files');

        app.buildCounts.files = 0;
        app.buildCounts.folders = 1;
        expect(presence.getActivity().state).toBe('creating_folder');

        app.buildCounts.folders = 2;
        expect(presence.getActivity().state).toBe('creating_folders');

        app.buildCounts.files = 3;
        expect(presence.getActivity().state).toBe('creating_files_and_folders');

        app.buildCounts.files = 1;
        app.buildCounts.folders = 1;
        expect(presence.getActivity().state).toBe('creating_file_and_folder');

        document.getElementById('buildStudioAlsoExportZip').checked = true;
        expect(presence.getActivity().state).toBe('exporting_file');

        document.getElementById('buildStudioOutputModeStructure').checked = false;
        document.getElementById('buildStudioOutputModeZip').checked = true;
        expect(presence.getActivity().state).toBe('exporting_file');

        document.getElementById('buildStudioOutputModeZip').checked = false;
        document.getElementById('buildStudioOutputModeTree').checked = true;
        expect(presence.getActivity().state).toBe('exporting_file');
    });

    it('only includes project and file type in detailed privacy', () => {
        const app = createTestApp();
        app.state.activePreviewPath = 'src/main.js';
        app.state.filePreviewPanel.classList.add('show');
        const presence = createDiscordPresenceUi(app);
        presence.markActive({ type: 'pointerdown', target: app.state.editor });

        localStorage.setItem('discord_presence_privacy', 'activity');
        expect(presence.getActivity()).not.toHaveProperty('projectName');

        localStorage.setItem('discord_presence_privacy', 'detailed');
        expect(presence.getActivity()).toMatchObject({
            privacy: 'detailed',
            projectName: 'Projeto Teste',
            fileType: 'JavaScript'
        });

        presence.refresh();
        expect(document.getElementById('discordPrivacyDescription').textContent).toBe('discord_privacy_detailed_desc');
    });

    it.each([
        ['basic', 'discord_privacy_basic_desc'],
        ['activity', 'discord_privacy_activity_desc'],
        ['detailed', 'discord_privacy_detailed_desc']
    ])('updates the privacy description when %s is selected', async (privacy, descriptionKey) => {
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();
        const privacySelect = document.getElementById('discordPrivacySelect');

        privacySelect.value = privacy;
        privacySelect.dispatchEvent(new Event('change', { bubbles: true }));

        expect(document.getElementById('discordPrivacyDescription')).toMatchObject({
            textContent: descriptionKey
        });
        expect(document.getElementById('discordPrivacyDescription').dataset.i18n).toBe(descriptionKey);
        presence.disconnectObserver();
    });

    it('follows the app language by default and supports a separate Presence language', async () => {
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        expect(presence.getActivity().language).toBe('pt');
        expect(document.getElementById('discordLanguageSelect').value).toBe('app');

        const languageSelect = document.getElementById('discordLanguageSelect');
        languageSelect.value = 'en';
        languageSelect.dispatchEvent(new Event('change', { bubbles: true }));

        expect(localStorage.getItem('discord_presence_language')).toBe('en');
        expect(presence.getActivity().language).toBe('en');
        expect(app.electronAPI.configureDiscordPresence).toHaveBeenLastCalledWith(
            expect.objectContaining({ activity: expect.objectContaining({ language: 'en' }) })
        );
        presence.disconnectObserver();
    });

    it('shows the normal connection status and changes to the reconnect action on failure', async () => {
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        const bar = document.getElementById('discordPresenceConnectionBar');
        expect(bar.hidden).toBe(false);
        expect(bar.dataset.status).toBe('connected');
        expect(document.getElementById('discordPresenceConnectionText').textContent).toBe('discord_connection_connected');
        expect(document.body.classList.contains('discord-presence-bar-visible')).toBe(true);

        bar.click();
        expect(app.electronAPI.reconnectDiscordPresence).not.toHaveBeenCalled();

        const statusListener = app.electronAPI.onDiscordPresenceStatusChanged.mock.calls[0][0];
        statusListener({ status: 'disconnected' });
        expect(bar.hidden).toBe(false);
        expect(bar.dataset.status).toBe('error');
        expect(document.getElementById('discordPresenceConnectionText').textContent).toBe('discord_connection_reconnect');
        expect(document.body.classList.contains('discord-presence-bar-visible')).toBe(true);

        statusListener({ status: 'error' });
        expect(bar.dataset.status).toBe('error');
        expect(document.getElementById('discordPresenceConnectionText').textContent).toBe('discord_connection_reconnect');

        bar.click();
        await vi.waitFor(() => expect(app.electronAPI.reconnectDiscordPresence).toHaveBeenCalledOnce());
        expect(bar.hidden).toBe(false);
        expect(bar.dataset.status).toBe('reconnecting');
        expect(presence.getStatus()).toBe('connecting');

        localStorage.setItem('discord_presence_enabled', 'false');
        presence.refresh();
        expect(bar.hidden).toBe(true);
        expect(document.body.classList.contains('discord-presence-bar-visible')).toBe(false);
        presence.disconnectObserver();
    });

    it('persists the option to hide and show the connection status bar', async () => {
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        const toggle = document.getElementById('discordPresenceBarToggle');
        const bar = document.getElementById('discordPresenceConnectionBar');
        expect(toggle.checked).toBe(true);
        expect(bar.hidden).toBe(false);

        toggle.checked = false;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        expect(localStorage.getItem('discord_presence_status_bar')).toBe('false');
        expect(bar.hidden).toBe(true);
        expect(document.body.classList.contains('discord-presence-bar-visible')).toBe(false);

        toggle.checked = true;
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
        expect(bar.hidden).toBe(false);
        presence.disconnectObserver();
    });

    it('does not let a stale reconnect response replace a connected event', async () => {
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        let finishReconnect;
        app.electronAPI.reconnectDiscordPresence.mockImplementation(
            () => new Promise((resolve) => { finishReconnect = resolve; })
        );
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        const bar = document.getElementById('discordPresenceConnectionBar');
        const statusListener = app.electronAPI.onDiscordPresenceStatusChanged.mock.calls[0][0];
        statusListener({ status: 'error' });
        bar.click();
        expect(presence.getStatus()).toBe('connecting');

        statusListener({ status: 'connected' });
        finishReconnect({ status: 'connecting' });
        await vi.waitFor(() => expect(app.electronAPI.reconnectDiscordPresence).toHaveBeenCalledOnce());

        expect(presence.getStatus()).toBe('connected');
        expect(bar.hidden).toBe(false);
        expect(bar.dataset.status).toBe('connected');
        presence.disconnectObserver();
    });

    it('uses editing text and the text icon state when the main file editor receives focus', async () => {
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        app.state.activePreviewPath = 'src/main.js';
        app.state.filePreviewPanel.classList.add('show');
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        app.state.filePreviewEditor.dispatchEvent(new Event('focusin', { bubbles: true }));

        expect(presence.getActivity()).toMatchObject({
            state: 'editing_code',
            language: 'pt'
        });
        await vi.waitFor(() => expect(app.electronAPI.updateDiscordPresence).toHaveBeenLastCalledWith(expect.objectContaining({ state: 'editing_code' })));
        presence.disconnectObserver();
    });

    it('starts idle, activates only from the structure editor, and returns to idle after five minutes', async () => {
        vi.useFakeTimers();
        localStorage.setItem('discord_presence_enabled', 'true');
        const app = createTestApp();
        const presence = createDiscordPresenceUi(app);
        await presence.init();

        expect(presence.getActivity().state).toBe('idle');

        document.getElementById('discordPrivacySelect').dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(presence.getActivity().state).toBe('idle');

        app.state.editor.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(presence.getActivity().state).toBe('editing_structure');

        document.getElementById('editorLayout').dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(presence.getActivity().state).toBe('idle');

        document.getElementById('editorLayout').dispatchEvent(new Event('pointermove', { bubbles: true }));
        expect(presence.getActivity().state).toBe('idle');

        app.state.editor.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(presence.getActivity().state).toBe('editing_structure');

        await vi.advanceTimersByTimeAsync(IDLE_TIMEOUT_MS);
        expect(presence.getActivity().state).toBe('idle');

        app.state.editor.dispatchEvent(new Event('keydown', { bubbles: true }));
        expect(presence.getActivity().state).toBe('editing_structure');
        presence.disconnectObserver();
    });
});
