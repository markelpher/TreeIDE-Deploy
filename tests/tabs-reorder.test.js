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

const app = {
    state: {},
    dom: { bindRefs() {} },
    helpers,
    i18n: { t: (key) => key },
    toast: { showToast: () => {} },
    icons: { refreshIcons: () => {} },
    tree: { parseEditorContent: () => ({}), getFilePathsFromTree: () => [] },
    editor: { openFilePreview: vi.fn(), closeFilePreview: vi.fn() },
    validation: {}
};
const tabs = createTabs(app);

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

describe('file editor tabs', () => {
    beforeEach(() => {
        localStorage._data = {};
        app.editor.openFilePreview.mockClear();
        app.editor.closeFilePreview.mockClear();
        tabs.projectTabs = [makeTab('a', 'Alpha')];
        tabs.activeProjectTabId = 'a';
        tabs.saveCurrentTabState = () => {};
        app.state.activePreviewPath = '';
        document.body.innerHTML = '<div id="codeTabList"></div>';
    });

    it('reorders open file tabs without changing the active file', () => {
        const tab = tabs.projectTabs[0];
        tab.openFileTabs = [{ path: 'a.js' }, { path: 'b.js' }, { path: 'c.js' }];
        tab.activeFileTabPath = 'b.js';

        expect(tabs.reorderFileTab('c.js', 'a.js', true)).toBe(true);
        expect(tab.openFileTabs.map((ft) => ft.path)).toEqual(['c.js', 'a.js', 'b.js']);
        expect(tab.activeFileTabPath).toBe('b.js');

        const parsed = JSON.parse(localStorage.getItem('autosave_tabs'));
        expect(parsed.projectTabs[0].openFileTabs.map((ft) => ft.path)).toEqual(['c.js', 'a.js', 'b.js']);
    });

    it('removes every stale tab and keeps valid tabs in their current order', () => {
        const tab = tabs.projectTabs[0];
        tab.openFileTabs = [
            { path: 'kept-a.js' },
            { path: 'deleted-a.js' },
            { path: 'kept-b.js' },
            { path: 'deleted-b.js' }
        ];
        tab.activeFileTabPath = 'kept-b.js';
        app.state.activePreviewPath = 'kept-b.js';

        expect(tabs.reconcileOpenFileTabs(tab, new Set(['kept-a.js', 'kept-b.js']))).toBe(true);
        expect(tab.openFileTabs.map((ft) => ft.path)).toEqual(['kept-a.js', 'kept-b.js']);
        expect(tab.activeFileTabPath).toBe('kept-b.js');
        expect(app.editor.openFilePreview).not.toHaveBeenCalled();
    });

    it('opens the nearest valid tab when the active file is deleted', () => {
        const tab = tabs.projectTabs[0];
        tab.openFileTabs = [{ path: 'a.js' }, { path: 'deleted.js' }, { path: 'c.js' }];
        tab.activeFileTabPath = 'deleted.js';

        tabs.reconcileOpenFileTabs(tab, new Set(['a.js', 'c.js']));

        expect(tab.openFileTabs.map((ft) => ft.path)).toEqual(['a.js', 'c.js']);
        expect(tab.activeFileTabPath).toBe('c.js');
        expect(app.editor.openFilePreview).toHaveBeenCalledWith('c.js');
    });

    it('closes the file preview when no open file still exists', () => {
        const tab = tabs.projectTabs[0];
        tab.openFileTabs = [{ path: 'deleted.js' }];
        tab.activeFileTabPath = 'deleted.js';

        tabs.reconcileOpenFileTabs(tab, new Set());

        expect(tab.openFileTabs).toEqual([]);
        expect(tab.activeFileTabPath).toBeNull();
        expect(app.editor.closeFilePreview).toHaveBeenCalledOnce();
    });
});
