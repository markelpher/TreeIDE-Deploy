/**
 * @vitest-environment happy-dom
 */

import * as helpers from '../src/shared/helpers.js';
import { createTabs } from '../src/renderer/modules/tabs.js';

globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = v; },
    removeItem(k) { delete this._data[k]; }
};

function makeApp() {
    const state = {
        currentFilePath: '',
        currentTree: {},
        fileContents: {},
        isModified: false,
        lastSavedProjectName: '',
        activePreviewPath: ''
    };

    document.body.innerHTML = `
        <textarea id="editor"></textarea>
        <div id="treeView"></div>
        <div id="projectTabList"></div>
        <div id="codeTabList"></div>
    `;

    const editor = document.getElementById('editor');

    const app = {
        state,
        dom: { bindRefs() {}, debounceTimer: null, autoSaveTimer: null },
        helpers,
        i18n: { t: (key) => key, getCurrentLang: () => 'en' },
        toast: { showToast: () => {} },
        icons: { refreshIcons: () => {}, getIconDetails: () => ({ icon: 'file', class: 'tree-icon-default' }) },
        tree: {
            parseEditorContent: helpers.parseEditorContent,
            renderTree: () => '',
            getFilePathsFromTree: helpers.getFilePathsFromTree
        },
        editor: {
            paintTreeView: () => {},
            updateFileNameDisplay: () => {},
            openFilePreview: () => {},
            closeFilePreview: () => {},
            getTreeEditorContent: () => editor.value
        },
        validation: { updateValidationPanel: () => {} },
        undoredo: { resetForTab: () => {} },
        modals: {
            showConfirmAsync: vi.fn().mockResolvedValue(true)
        },
        dbStorage: null
    };

    app.state.editor = editor;
    app.state.treeView = document.getElementById('treeView');
    return { app, editor };
}

describe('encrypted project session behavior', () => {
    beforeEach(() => {
        localStorage._data = {};
    });

    it('keeps decrypted content in session restore snapshots for open encrypted tabs', () => {
        const { app } = makeApp();
        const tabs = createTabs(app);
        app.tabs = tabs;

        tabs.createTab({ name: 'Untitled' });
        tabs.loadContentIntoTab({
            content: 'secret/\n    vault.txt',
            tabName: 'secure',
            filePath: 'C:/projects/secure.tree',
            fileContents: { 'secret/vault.txt': 'top-secret' },
            isModified: false,
            forceNewTab: false,
            treeEncrypted: true,
            unlockPassword: 'hunter2'
        });

        const tab = tabs.getActiveTab();
        expect(tab.treeEncrypted).toBe(true);
        expect(tabs.getUnlockPassword(tab.id)).toBe('hunter2');

        tabs.saveTabsToStorage();
        const stored = JSON.parse(localStorage.getItem('autosave_tabs'));
        expect(stored.projectTabs).toHaveLength(1);
        expect(stored.projectTabs[0].treeEncrypted).toBe(true);
        expect(stored.projectTabs[0].editorContent).toContain('secret/');
        expect(stored.projectTabs[0].fileContents['secret/vault.txt']).toBe('top-secret');
        // Password must never be written to storage.
        expect(JSON.stringify(stored)).not.toContain('hunter2');
    });

    it('restores decrypted encrypted-tab content from session (without password)', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);
        app.tabs = tabs;

        localStorage.setItem('autosave_tabs', JSON.stringify({
            activeProjectTabId: 'enc1',
            projectTabs: [{
                id: 'enc1',
                name: 'secure',
                editorContent: 'secret/\n    vault.txt',
                filePath: 'C:/secure.tree',
                treeData: { 'secret/': { 'vault.txt': {} } },
                fileContents: { 'secret/vault.txt': 'top-secret' },
                isModified: false,
                lastSavedProjectName: 'secure',
                openFileTabs: [],
                activeFileTabPath: null,
                treeEncrypted: true
            }]
        }));

        expect(tabs.loadTabsFromStorage()).toBe(true);
        const tab = tabs.projectTabs[0];
        expect(tab.treeEncrypted).toBe(true);
        expect(tab.editorContent).toContain('secret/');
        expect(tab.fileContents['secret/vault.txt']).toBe('top-secret');
        expect(tabs.getUnlockPassword(tab.id)).toBe('');

        tabs.restoreTabState(tab);
        expect(editor.value).toContain('secret/');
    });

    it('removes encrypted tab from session when closed', async () => {
        const { app } = makeApp();
        const tabs = createTabs(app);
        app.tabs = tabs;

        tabs.createTab({ name: 'plain', editorContent: 'plain/\n    a.js' });
        tabs.loadContentIntoTab({
            content: 'a/\n    b.js',
            tabName: 'secure',
            filePath: 'C:/secure.tree',
            isModified: false,
            forceNewTab: true,
            treeEncrypted: true,
            unlockPassword: 's3cret'
        });

        const encTab = tabs.projectTabs.find((t) => t.treeEncrypted);
        expect(encTab).toBeTruthy();
        expect(tabs.getUnlockPassword(encTab.id)).toBe('s3cret');

        await tabs.closeTab(encTab.id);
        expect(tabs.getUnlockPassword(encTab.id)).toBe('');
        expect(tabs.projectTabs.some((t) => t.id === encTab.id)).toBe(false);

        const stored = JSON.parse(localStorage.getItem('autosave_tabs'));
        expect(stored.projectTabs.some((t) => t.treeEncrypted)).toBe(false);
        expect(JSON.stringify(stored)).not.toContain('s3cret');
    });

    it('restores a normal unencrypted tab without hanging', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);
        app.tabs = tabs;

        localStorage.setItem('autosave_tabs', JSON.stringify({
            activeProjectTabId: 'p1',
            projectTabs: [{
                id: 'p1',
                name: 'project',
                editorContent: 'src/\n    index.js',
                filePath: 'C:/project.tree',
                treeData: null,
                fileContents: {},
                isModified: false,
                lastSavedProjectName: 'project',
                openFileTabs: [],
                activeFileTabPath: null,
                treeEncrypted: false
            }]
        }));

        expect(tabs.loadTabsFromStorage()).toBe(true);
        tabs.restoreTabState(tabs.getActiveTab());
        expect(editor.value).toBe('src/\n    index.js');
        expect(tabs.getActiveTab().treeEncrypted).toBe(false);
    });
});
