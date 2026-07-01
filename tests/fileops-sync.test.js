/**
 * @vitest-environment happy-dom
 */

import { createFileops } from '../src/renderer/modules/fileops.js';
import * as helpers from '../src/shared/helpers.js';
const { getFilePathsFromTree, parseEditorContent } = helpers;

function createFileopsApp() {
    const state = {
        fileContents: {},
        activePreviewPath: 'foo.js',
        filePreviewEditor: { value: 'console.log("hi");' },
        currentTree: {},
        editor: null
    };

    const projectTab = {
        id: 'tab1',
        openFileTabs: [{ path: 'foo.js' }],
        activeFileTabPath: 'foo.js',
        fileContents: {}
    };

    const tabs = {
        getActiveTab: () => projectTab,
        updateFileTabPath: vi.fn((oldPath, newPath) => {
            const fileTab = projectTab.openFileTabs.find((ft) => ft.path === oldPath);
            if (fileTab) { fileTab.path = newPath; }
            if (projectTab.activeFileTabPath === oldPath) {
                projectTab.activeFileTabPath = newPath;
            }
            return true;
        })
    };

    const editor = {
        openFilePreview: vi.fn((path) => {
            state.activePreviewPath = path;
        })
    };

    return {
        state,
        projectTab,
        tabs,
        editor,
        tree: { getFilePathsFromTree },
        i18n: { t: (key) => key, getCurrentLang: () => 'en' },
        defaultFileContentsByExtension: { js: '', ts: '' },
        storage: { persistFileContents: vi.fn() },
        fileTypes: { getFileTypeLabel: () => 'JS' },
        helpers
    };
}

describe('syncFileContentsWithTree renames', () => {
    it('keeps an open file tab when the tree renames a file without fileContents entry', () => {
        const app = createFileopsApp();
        const fileops = createFileops(app);
        const tree = parseEditorContent('bar.js');

        fileops.syncFileContentsWithTree(tree);

        expect(app.tabs.updateFileTabPath).toHaveBeenCalledWith('foo.js', 'bar.js');
        expect(app.projectTab.openFileTabs[0].path).toBe('bar.js');
        expect(app.projectTab.activeFileTabPath).toBe('bar.js');
        expect(app.state.activePreviewPath).toBe('bar.js');
        expect(app.state.fileContents['bar.js']).toBe('console.log("hi");');
        expect(app.editor.openFilePreview).toHaveBeenCalledWith('bar.js');
    });

    it('keeps an open file tab when only the extension changes', () => {
        const app = createFileopsApp();
        app.state.fileContents['foo.js'] = 'const x = 1;';
        app.state.filePreviewEditor.value = 'const x = 1;';
        const fileops = createFileops(app);
        const tree = parseEditorContent('foo.ts');

        fileops.syncFileContentsWithTree(tree);

        expect(app.tabs.updateFileTabPath).toHaveBeenCalledWith('foo.js', 'foo.ts');
        expect(app.state.fileContents['foo.ts']).toBe('const x = 1;');
        expect(app.projectTab.openFileTabs[0].path).toBe('foo.ts');
    });
});