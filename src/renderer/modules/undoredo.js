export function createUndoredo(app) {
    const undoStack = [];
    const redoStack = [];
    const fileHistories = new Map();
    const MAX_UNDO_STACK = 100;
    let lastEditorValue = '';
    let lastEditorCursorStart = 0;
    let lastEditorCursorEnd = 0;
    let isUndoRedoAction = false;

    const createSnapshot = (value, cursorStart = 0, cursorEnd = cursorStart) => ({
        value: String(value ?? ''),
        cursorStart: Number.isFinite(cursorStart) ? cursorStart : 0,
        cursorEnd: Number.isFinite(cursorEnd) ? cursorEnd : cursorStart
    });

    function trimStack(stack) {
        if (stack.length > MAX_UNDO_STACK) {
            stack.splice(0, stack.length - MAX_UNDO_STACK);
        }
    }

    function captureEditorState(value, cursorStart, cursorEnd) {
        if (String(value ?? '') !== lastEditorValue) {
            return;
        }
        lastEditorCursorStart = cursorStart;
        lastEditorCursorEnd = cursorEnd;
    }

    function pushUndoState() {
        if (isUndoRedoAction) {
            return;
        }

        const editor = app.state?.editor;
        if (!editor || editor.value === lastEditorValue) {
            return;
        }

        undoStack.push(createSnapshot(lastEditorValue, lastEditorCursorStart, lastEditorCursorEnd));
        trimStack(undoStack);
        redoStack.length = 0;
        lastEditorValue = editor.value;
        lastEditorCursorStart = editor.selectionStart;
        lastEditorCursorEnd = editor.selectionEnd;
    }

    function restoreEditorState(snapshot) {
        const state = app.state;
        const editor = state.editor;
        isUndoRedoAction = true;
        editor.value = snapshot.value;
        const cursorStart = Math.min(snapshot.cursorStart, editor.value.length);
        const cursorEnd = Math.min(snapshot.cursorEnd, editor.value.length);
        editor.setSelectionRange(cursorStart, cursorEnd);
        lastEditorValue = editor.value;
        lastEditorCursorStart = cursorStart;
        lastEditorCursorEnd = cursorEnd;
        isUndoRedoAction = false;

        state.currentTree = app.tree.parseEditorContent(editor.value);
        const hasTreeItems = Object.keys(state.currentTree).length > 0;
        app.editor.refreshTreeView();

        const activeTab = app.tabs.getActiveTab();
        if (activeTab) {
            activeTab.editorContent = editor.value;
            activeTab.treeData = state.currentTree;
            if (!hasTreeItems) {
                activeTab.openFileTabs = [];
                activeTab.activeFileTabPath = null;
                app.tabs.renderCodeTabBar(activeTab);
            }
            app.tabs.syncActiveTabDirty(editor.value, state.fileContents);
            app.tabs.saveTabsToStorage();
        }
    }

    function performUndo() {
        if (!undoStack.length) {
            return false;
        }
        const editor = app.state.editor;
        redoStack.push(createSnapshot(editor.value, editor.selectionStart, editor.selectionEnd));
        trimStack(redoStack);
        restoreEditorState(undoStack.pop());
        return true;
    }

    function performRedo() {
        if (!redoStack.length) {
            return false;
        }
        const editor = app.state.editor;
        undoStack.push(createSnapshot(editor.value, editor.selectionStart, editor.selectionEnd));
        trimStack(undoStack);
        restoreEditorState(redoStack.pop());
        return true;
    }

    function prepareFileHistory(key, value, cursorStart = 0, cursorEnd = cursorStart) {
        const normalizedKey = String(key || '');
        if (!normalizedKey) {
            return null;
        }
        const currentValue = String(value ?? '');
        let history = fileHistories.get(normalizedKey);
        if (!history || history.lastValue !== currentValue) {
            history = {
                undoStack: [],
                redoStack: [],
                lastValue: currentValue,
                lastCursorStart: cursorStart,
                lastCursorEnd: cursorEnd
            };
            fileHistories.set(normalizedKey, history);
        }
        return history;
    }

    function captureFileEditorState(key, value, cursorStart, cursorEnd) {
        const history = prepareFileHistory(key, value, cursorStart, cursorEnd);
        if (!history || history.lastValue !== value) {
            return;
        }
        history.lastCursorStart = cursorStart;
        history.lastCursorEnd = cursorEnd;
    }

    function pushFileUndoState(key, value, cursorStart, cursorEnd) {
        if (isUndoRedoAction) {
            return;
        }
        const normalizedKey = String(key || '');
        const currentValue = String(value ?? '');
        let history = fileHistories.get(normalizedKey);
        if (!history) {
            history = prepareFileHistory(normalizedKey, currentValue, cursorStart, cursorEnd);
            return;
        }
        if (history.lastValue === currentValue) {
            history.lastCursorStart = cursorStart;
            history.lastCursorEnd = cursorEnd;
            return;
        }
        history.undoStack.push(createSnapshot(history.lastValue, history.lastCursorStart, history.lastCursorEnd));
        trimStack(history.undoStack);
        history.redoStack.length = 0;
        history.lastValue = currentValue;
        history.lastCursorStart = cursorStart;
        history.lastCursorEnd = cursorEnd;
    }

    function moveFileHistory(key, direction, value, cursorStart, cursorEnd) {
        const history = fileHistories.get(String(key || ''));
        const source = direction === 'undo' ? history?.undoStack : history?.redoStack;
        const destination = direction === 'undo' ? history?.redoStack : history?.undoStack;
        if (!history || !source?.length) {
            return null;
        }

        destination.push(createSnapshot(value, cursorStart, cursorEnd));
        trimStack(destination);
        const snapshot = source.pop();
        history.lastValue = snapshot.value;
        history.lastCursorStart = snapshot.cursorStart;
        history.lastCursorEnd = snapshot.cursorEnd;
        return { ...snapshot };
    }

    function resetForTab(editorContent = '') {
        undoStack.length = 0;
        redoStack.length = 0;
        lastEditorValue = String(editorContent ?? '');
        lastEditorCursorStart = 0;
        lastEditorCursorEnd = 0;
    }

    return {
        pushUndoState,
        performUndo,
        performRedo,
        captureEditorState,
        prepareFileHistory,
        captureFileEditorState,
        pushFileUndoState,
        performFileUndo: (key, value, cursorStart, cursorEnd) => moveFileHistory(key, 'undo', value, cursorStart, cursorEnd),
        performFileRedo: (key, value, cursorStart, cursorEnd) => moveFileHistory(key, 'redo', value, cursorStart, cursorEnd),
        getLastEditorValue: () => lastEditorValue,
        setLastEditorValue: (value) => {
            lastEditorValue = String(value ?? '');
        },
        getIsUndoRedoAction: () => isUndoRedoAction,
        resetForTab
    };
}
