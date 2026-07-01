export function createUndoredo(app) {

const undoStack = [];
    const redoStack = [];
    const MAX_UNDO_STACK = 100;
    let lastEditorValue = '';
    let isUndoRedoAction = false;

    function pushUndoState(type = 'editor', extra = {}) {
        if (isUndoRedoAction) {return;}

        const S = app.state;
        if (!S || !S.editor) {return;}

        if (type === 'editor') {
            const currentValue = S.editor.value;
            if (currentValue === lastEditorValue) {return;}
            undoStack.push({
                type: 'editor',
                value: lastEditorValue,
                cursorStart: S.editor.selectionStart,
                cursorEnd: S.editor.selectionEnd
            });
            lastEditorValue = currentValue;
        } else {
            undoStack.push({
                type,
                ...extra,
                editorValue: S.editor.value
            });
        }

        if (undoStack.length > MAX_UNDO_STACK) {
            undoStack.shift();
        }

        redoStack.length = 0;
    }

    function _restoreState(state) {
        const S = app.state;
        isUndoRedoAction = true;
        S.editor.value = state.value ?? state.editorValue;
        if (state.cursorStart !== undefined) {
            S.editor.selectionStart = state.cursorStart;
            S.editor.selectionEnd = state.cursorEnd;
        }
        lastEditorValue = S.editor.value;
        isUndoRedoAction = false;

        S.currentTree = app.tree.parseEditorContent(S.editor.value);
        const hasTreeItems = Object.keys(S.currentTree).length > 0;
        app.editor.refreshTreeView();

        const activeTab = app.tabs.getActiveTab();
        if (activeTab) {
            activeTab.editorContent = S.editor.value;
            activeTab.treeData = S.currentTree;
            if (!hasTreeItems) {
                activeTab.openFileTabs = [];
                activeTab.activeFileTabPath = null;
                app.tabs.renderCodeTabBar(activeTab);
            }
            app.tabs.syncActiveTabDirty(S.editor.value, S.fileContents);
            app.tabs.saveTabsToStorage();
        }
    }

    function performUndo() {
        if (undoStack.length === 0) {return;}
        const S = app.state;
        const prev = undoStack.pop();

        redoStack.push({
            ...prev,
            editorValue: S.editor.value,
            cursorStart: S.editor.selectionStart,
            cursorEnd: S.editor.selectionEnd
        });

        _restoreState(prev);
    }

    function performRedo() {
        if (redoStack.length === 0) {return;}
        const S = app.state;
        const next = redoStack.pop();

        undoStack.push({
            ...next,
            editorValue: S.editor.value,
            cursorStart: S.editor.selectionStart,
            cursorEnd: S.editor.selectionEnd
        });

        _restoreState(next);
    }

    function getLastEditorValue() { return lastEditorValue; }
    function setLastEditorValue(v) { lastEditorValue = v; }
    function getIsUndoRedoAction() { return isUndoRedoAction; }

    function resetForTab(editorContent = '') {
        undoStack.length = 0;
        redoStack.length = 0;
        lastEditorValue = editorContent;
    }

    return {
        pushUndoState, performUndo, performRedo,
        getLastEditorValue, setLastEditorValue, getIsUndoRedoAction,
        resetForTab
    };

}
