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

const state = {
    currentFilePath: '',
    currentTree: {},
    fileContents: {},
    isModified: false
};
const dom = { bindRefs() {} };

const app = {
    state,
    dom,
    helpers,
    i18n: { t: (key) => key, getCurrentLang: () => 'en' },
    toast: { showToast: () => {} },
    icons: { refreshIcons: () => {}, getIconDetails: () => ({ icon: 'file', class: 'tree-icon-default' }) },
    tree: {
        parseEditorContent: helpers.parseEditorContent,
        renderTree: () => ''
    },
    editor: {
        paintTreeView: () => {},
        updateFileNameDisplay: () => {},
        openFilePreview: () => {},
        closeFilePreview: () => {}
    },
    validation: { updateValidationPanel: () => {} },
    dbStorage: null
};

const tabs = createTabs(app);

describe('tabs persistence', () => {
    beforeEach(() => {
        localStorage._data = {};
    });

    it('saveTabsToStorage persists project tabs', () => {
        tabs.projectTabs = [{
            id: 'a',
            name: 'One',
            editorContent: 'x',
            filePath: '',
            treeData: {},
            fileContents: {},
            isModified: false,
            lastSavedProjectName: '',
            openFileTabs: [],
            activeFileTabPath: null
        }];
        tabs.activeProjectTabId = 'a';
        tabs.getActiveTab = () => tabs.projectTabs[0];
        tabs.saveCurrentTabState = () => {};
        tabs.saveTabsToStorage();
        const raw = localStorage.getItem('autosave_tabs');
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw);
        expect(parsed.projectTabs[0].name).toBe('One');
    });
});