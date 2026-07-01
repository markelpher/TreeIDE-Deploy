/**
 * @vitest-environment happy-dom
 */

import * as helpers from '../src/shared/helpers.js';
import { createTabs } from '../src/renderer/modules/tabs.js';
import { createUndoredo } from '../src/renderer/modules/undoredo.js';
import { createTree } from '../src/renderer/modules/tree.js';

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
        <div id="filePreviewPanel"></div>
        <textarea id="filePreviewEditor"></textarea>
    `;

    const editor = document.getElementById('editor');
    const treeView = document.getElementById('treeView');

    const tree = createTree({
        helpers: { joinTreePath: helpers.joinTreePath, parseEditorContent: helpers.parseEditorContent, getFilePathsFromTree: helpers.getFilePathsFromTree },
        icons: { getIconDetails: () => ({ icon: 'file', class: '' }) },
        i18n: { t: (key) => key }
    });

    const app = {
        state,
        dom: {
            get debounceTimer() { return this._debounceTimer; },
            set debounceTimer(v) { this._debounceTimer = v; },
            get autoSaveTimer() { return this._autoSaveTimer; },
            set autoSaveTimer(v) { this._autoSaveTimer = v; }
        },
        helpers,
        i18n: { t: (key) => key, getCurrentLang: () => 'en' },
        toast: { showToast: () => {} },
        icons: { refreshIcons: () => {}, getIconDetails: () => ({ icon: 'file', class: 'tree-icon-default' }) },
        tree,
        editor: {
            paintTreeView: () => {},
            refreshTreeView: () => {},
            updateFileNameDisplay: () => {},
            openFilePreview: () => {},
            closeFilePreview: () => {}
        },
        validation: { updateValidationPanel: () => {} },
        modals: { showConfirmAsync: vi.fn().mockResolvedValue(true) },
        dbStorage: null
    };

    state.editor = editor;
    state.treeView = treeView;
    app.undoredo = createUndoredo(app);

    return { app, editor };
}

describe('project tab switching', () => {
    it('restores each tab editor content when switching', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);

        tabs.createTab({ name: 'First', editorContent: 'src/\n    a.js' });
        tabs.createTab({ name: 'Second', editorContent: 'lib/\n    b.js' });

        expect(editor.value).toBe('lib/\n    b.js');

        tabs.switchToTab(tabs.projectTabs[0].id);
        expect(editor.value).toBe('src/\n    a.js');
        expect(tabs.activeProjectTabId).toBe(tabs.projectTabs[0].id);

        tabs.switchToTab(tabs.projectTabs[1].id);
        expect(editor.value).toBe('lib/\n    b.js');
    });

    it('resets undo history when switching tabs', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);

        tabs.createTab({ name: 'First', editorContent: 'alpha' });
        editor.value = 'alpha-beta';
        app.undoredo.pushUndoState();

        tabs.createTab({ name: 'Second', editorContent: 'gamma' });
        expect(app.undoredo.getLastEditorValue()).toBe('gamma');

        app.undoredo.performUndo();
        expect(editor.value).toBe('gamma');
    });

    it('updates treeData when saving tab state with empty treeData object', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);

        const tab = {
            id: 'tab-a',
            name: 'Project',
            editorContent: '',
            filePath: '',
            treeData: {},
            fileContents: {},
            isModified: false,
            lastSavedProjectName: '',
            openFileTabs: [],
            activeFileTabPath: null
        };
        tabs.projectTabs = [tab];
        tabs.activeProjectTabId = 'tab-a';

        editor.value = 'src/\n    main.js';
        tabs.saveCurrentTabState();

        expect(helpers.getFilePathsFromTree(tab.treeData)).toEqual(['src/main.js']);
    });
});