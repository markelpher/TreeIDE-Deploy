/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest';
import { createUndoredo } from '../src/renderer/modules/undoredo.js';

function createTestApp() {
    document.body.innerHTML = '<textarea id="editor"></textarea>';
    const editor = document.getElementById('editor');
    const activeTab = {
        editorContent: '',
        treeData: {},
        fileContents: {},
        openFileTabs: [],
        activeFileTabPath: null
    };
    const app = {
        state: { editor, currentTree: {}, fileContents: {} },
        tree: { parseEditorContent: (value) => (value ? { value } : {}) },
        editor: { refreshTreeView: vi.fn() },
        tabs: {
            getActiveTab: () => activeTab,
            renderCodeTabBar: vi.fn(),
            syncActiveTabDirty: vi.fn(),
            saveTabsToStorage: vi.fn()
        }
    };
    return { app, editor };
}

describe('undo and redo histories', () => {
    it('restores structure edits in both directions', () => {
        const { app, editor } = createTestApp();
        const history = createUndoredo(app);
        history.resetForTab('a');
        editor.value = 'a';

        history.captureEditorState('a', 1, 1);
        editor.value = 'ab';
        editor.setSelectionRange(2, 2);
        history.pushUndoState();
        history.captureEditorState('ab', 2, 2);
        editor.value = 'abc';
        editor.setSelectionRange(3, 3);
        history.pushUndoState();

        expect(history.performUndo()).toBe(true);
        expect(editor.value).toBe('ab');
        expect(history.performUndo()).toBe(true);
        expect(editor.value).toBe('a');
        expect(history.performRedo()).toBe(true);
        expect(editor.value).toBe('ab');
        expect(history.performRedo()).toBe(true);
        expect(editor.value).toBe('abc');
    });

    it('keeps independent file histories and invalidates redo after a new edit', () => {
        const { app } = createTestApp();
        const history = createUndoredo(app);
        history.prepareFileHistory('tab-1\u0000a.js', 'one', 3, 3);
        history.pushFileUndoState('tab-1\u0000a.js', 'one!', 4, 4);
        history.prepareFileHistory('tab-1\u0000b.js', 'two', 3, 3);
        history.pushFileUndoState('tab-1\u0000b.js', 'two?', 4, 4);

        const undoneA = history.performFileUndo('tab-1\u0000a.js', 'one!', 4, 4);
        expect(undoneA.value).toBe('one');
        expect(history.performFileRedo('tab-1\u0000a.js', 'one', 3, 3).value).toBe('one!');
        expect(history.performFileUndo('tab-1\u0000b.js', 'two?', 4, 4).value).toBe('two');

        history.pushFileUndoState('tab-1\u0000b.js', 'two-new', 7, 7);
        expect(history.performFileRedo('tab-1\u0000b.js', 'two-new', 7, 7)).toBeNull();
    });
});
