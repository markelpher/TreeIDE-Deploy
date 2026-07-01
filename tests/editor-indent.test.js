/**
 * @vitest-environment happy-dom
 */

import * as helpers from '../src/shared/helpers.js';
import { createEditor } from '../src/renderer/modules/editor.js';

function dispatchKey(textarea, key, opts = {}) {
    const event = new KeyboardEvent('keydown', {
        key,
        bubbles: true,
        cancelable: true,
        shiftKey: !!opts.shiftKey,
        ctrlKey: !!opts.ctrlKey
    });
    textarea.dispatchEvent(event);
    return event;
}

function makeApp({ withTemplateEditor = false } = {}) {
    document.body.innerHTML = [
        '<textarea id="editor"></textarea>',
        '<div id="treeView"></div>',
        withTemplateEditor ? '<textarea id="templateTreeEditor"></textarea><div id="templateTreePreview"></div>' : ''
    ].join('');
    const editor = document.getElementById('editor');

    const state = {
        currentTree: {},
        fileContents: {},
        isModified: false,
        activePreviewPath: '',
        get editor() { return editor; },
        get treeView() { return document.getElementById('treeView'); }
    };

    const app = {
        state,
        helpers,
        dom: { debounceTimer: null, autoSaveTimer: null },
        i18n: { t: (k) => k },
        tree: {
            parseEditorContent: helpers.parseEditorContent,
            getFilePathsFromTree: helpers.getFilePathsFromTree,
            renderTree: () => '',
            initTreeKeyboard: () => {},
            previewCollapsedPaths: new Set()
        },
        fileops: {
            syncFileContentsWithTree: () => {},
            persistFileContents: () => {},
            autoSaveToDisk: () => {}
        },
        validation: { updateValidationPanel: () => {} },
        tabs: {
            getActiveTab: () => ({ editorContent: '', treeData: {}, openFileTabs: [] }),
            syncActiveTabDirty: () => {},
            saveTabsToStorage: () => {}
        },
        undoredo: { pushUndoState: () => {} },
        icons: { refreshIcons: () => {} }
    };

    return { app, editor };
}

describe('editor Tab', () => {
    it('Tab on blank line always inserts 4 spaces at cursor', () => {
        const { app, editor } = makeApp();
        const mod = createEditor(app);
        mod.bindEditorInput();

        editor.value = 'src/\n';
        editor.selectionStart = editor.selectionEnd = 5;

        dispatchKey(editor, 'Tab');
        expect(editor.value).toBe('src/\n    ');
        expect(editor.selectionStart).toBe(9);
    });

    it('Enter then Tab then filename nests under the folder in the tree', () => {
        const { app, editor } = makeApp();
        const mod = createEditor(app);
        mod.bindEditorInput();

        editor.value = 'src/';
        editor.selectionStart = editor.selectionEnd = 4;

        // Enter is native (plain newline, no auto-indent)
        editor.setRangeText('\n', editor.selectionStart, editor.selectionEnd, 'end');
        expect(editor.value).toBe('src/\n');

        dispatchKey(editor, 'Tab');
        editor.setRangeText('index.js', editor.selectionStart, editor.selectionEnd, 'end');

        const tree = helpers.parseEditorContent(editor.value);
        expect(Object.keys(tree)).toEqual(['src/']);
        expect(Object.keys(tree['src/'])).toEqual(['index.js']);
    });

    it('sibling at root stays at root after Enter without Tab', () => {
        const value = 'src/\nlib/';
        const tree = helpers.parseEditorContent(value);
        expect(Object.keys(tree).sort()).toEqual(['lib/', 'src/']);
    });

    it('Backspace removes 4 spaces of indent at once', () => {
        const { app, editor } = makeApp();
        const mod = createEditor(app);
        mod.bindEditorInput();

        editor.value = 'src/\n    index.js';
        editor.selectionStart = editor.selectionEnd = 9;

        dispatchKey(editor, 'Backspace');
        expect(editor.value).toBe('src/\nindex.js');
        expect(editor.selectionStart).toBe(5);
    });

    it('Tab indents in the template structure editor without moving focus', () => {
        const { app } = makeApp({ withTemplateEditor: true });
        const mod = createEditor(app);
        mod.bindEditorInput();

        const templateEditor = document.getElementById('templateTreeEditor');
        templateEditor.value = 'src/\n';
        templateEditor.selectionStart = templateEditor.selectionEnd = 5;
        templateEditor.focus();

        const event = dispatchKey(templateEditor, 'Tab');
        expect(event.defaultPrevented).toBe(true);
        expect(templateEditor.value).toBe('src/\n    ');
        expect(document.activeElement).toBe(templateEditor);
    });
});