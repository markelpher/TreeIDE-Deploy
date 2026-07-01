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
        dom: { bindRefs() {} },
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
            closeFilePreview: () => {}
        },
        validation: { updateValidationPanel: () => {} },
        modals: {
            showConfirmAsync: vi.fn().mockResolvedValue(true)
        },
        dbStorage: null
    };

    app.state.editor = editor;
    app.state.treeView = document.getElementById('treeView');

    return { app, editor };
}

describe('closeTab with unsaved inactive tab', () => {
    it('saves active tab content before creating a new tab', () => {
        const { app, editor } = makeApp();
        const tabs = createTabs(app);

        tabs.createTab({ name: 'First', editorContent: '' });
        editor.value = 'src/\n    main.js';
        tabs.saveCurrentTabState();

        tabs.createTab({ name: 'Second', editorContent: '' });

        const first = tabs.projectTabs.find((tab) => tab.name === 'First');
        expect(first.editorContent).toBe('src/\n    main.js');
        expect(editor.value).toBe('');
    });

    it('closes an inactive unsaved tab after discarding changes', async () => {
        const { app } = makeApp();
        const tabs = createTabs(app);

        tabs.createTab({ name: 'First', editorContent: 'src/\n    main.js' });
        tabs.projectTabs[0].savedEditorContent = '';
        tabs.projectTabs[0].isModified = true;

        tabs.createTab({ name: 'Second', editorContent: '' });
        const firstId = tabs.projectTabs[0].id;

        await tabs.closeTab(firstId);

        expect(tabs.projectTabs).toHaveLength(1);
        expect(tabs.projectTabs[0].name).toBe('Second');
        expect(app.modals.showConfirmAsync).toHaveBeenCalled();
    });
});