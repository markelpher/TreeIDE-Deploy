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

const tabs = createTabs({
    state: {},
    dom: { bindRefs() {} },
    helpers,
    i18n: { t: (key) => key },
    toast: { showToast: () => {} },
    icons: { refreshIcons: () => {} },
    tree: { parseEditorContent: () => ({}) },
    editor: {},
    validation: {}
});

function makeTab(id, name) {
    return {
        id,
        name,
        editorContent: '',
        filePath: '',
        treeData: {},
        fileContents: {},
        isModified: false,
        lastSavedProjectName: '',
        openFileTabs: [],
        activeFileTabPath: null
    };
}

describe('reorderProjectTab', () => {
    beforeEach(() => {
        tabs.projectTabs = [
            makeTab('a', 'Alpha'),
            makeTab('b', 'Beta'),
            makeTab('c', 'Gamma')
        ];
        tabs.activeProjectTabId = 'a';
        tabs.saveCurrentTabState = () => {};
        document.body.innerHTML = '<div id="projectTabList"></div>';
    });

    it('moves a tab before another tab', () => {
        expect(tabs.reorderProjectTab('c', 'a', true)).toBe(true);
        expect(tabs.projectTabs.map((t) => t.id)).toEqual(['c', 'a', 'b']);
    });

    it('moves a tab after another tab', () => {
        expect(tabs.reorderProjectTab('a', 'b', false)).toBe(true);
        expect(tabs.projectTabs.map((t) => t.id)).toEqual(['b', 'a', 'c']);
    });

    it('ignores reordering onto itself', () => {
        expect(tabs.reorderProjectTab('b', 'b', true)).toBe(false);
        expect(tabs.projectTabs.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    });

    it('persists the new order', () => {
        tabs.reorderProjectTab('c', 'a', true);
        const parsed = JSON.parse(localStorage.getItem('autosave_tabs'));
        expect(parsed.projectTabs.map((t) => t.id)).toEqual(['c', 'a', 'b']);
    });
});