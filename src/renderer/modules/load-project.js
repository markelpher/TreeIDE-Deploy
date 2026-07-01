/**
 * Shared load flow with encrypted .tree / ZIP password support.
 */

function getDisplayName(filePath, result) {
    if (result?.name) { return result.name; }
    const fileName = filePath.split(/[\\/]/).pop() || 'project';
    return fileName.replace(/\.(tree|zip)$/i, '');
}

function applyLoadResult(app, result, filePath) {
    const tree = result.treeData || app.tree.parseEditorContent(result.content || '');
    if (Object.keys(tree).length === 0) {
        app.toast.showToast(app.i18n.t('validation_empty'), 4000);
        return false;
    }

    const isFromFile = Boolean(result.filePath || filePath);
    const tabName = result.filePath
        ? result.filePath.split(/[\\/]/).pop().replace(/\.tree$/i, '')
        : (result.name || getDisplayName(filePath, result));
    const importedFileContents = result.fileContents || {};
    const activeTab = app.tabs.getActiveTab();
    const forceNew = activeTab && (
        app.editor.getTreeEditorContent().trim() !== '' || activeTab.isModified
    );

    app.tabs.loadContentIntoTab({
        content: result.content,
        tabName,
        filePath: result.filePath || (filePath?.endsWith('.tree') ? filePath : null),
        treeData: result.treeData || null,
        fileContents: importedFileContents,
        isModified: !isFromFile,
        forceNewTab: forceNew
    });
    app.toast.showToast(app.i18n.t('file_loaded'));
    return true;
}

/**
 * @param {import('../createApp.js').App} app
 * @param {string} filePath
 * @param {{ password?: string, showToastOnError?: boolean }} [options]
 */
export async function loadProjectFromPath(app, filePath, options = {}) {
    const lang = app.i18n.getCurrentLang();
    const { showToastOnError = true } = options;
    let password = options.password || '';
    let wrongPassword = false;

    while (true) {
        const result = await app.electronAPI.loadDroppedFile(filePath, lang, {
            password: password || undefined
        });

        if (result.canceled) { return false; }

        if (result.needsPassword) {
            const entered = await app.modals.showDecryptPasswordModal({
                fileName: result.name || getDisplayName(filePath, result),
                kind: result.kind || 'tree',
                wrongPassword
            });
            if (!entered) { return false; }
            password = entered;
            wrongPassword = false;
            continue;
        }

        if (result.wrongPassword) {
            const entered = await app.modals.showDecryptPasswordModal({
                fileName: result.name || getDisplayName(filePath, result),
                kind: result.kind || 'tree',
                wrongPassword: true
            });
            if (!entered) { return false; }
            password = entered;
            wrongPassword = false;
            continue;
        }

        if (result.error) {
            if (showToastOnError) {
                app.toast.showToast(result.error, 4000);
            }
            return false;
        }

        return applyLoadResult(app, result, filePath);
    }
}

/**
 * @param {import('../createApp.js').App} app
 * @param {object} initialResult
 * @param {string} [filePath]
 */
export async function loadProjectFromResult(app, initialResult, filePath = '') {
    const lang = app.i18n.getCurrentLang();
    let password = '';
    let wrongPassword = false;
    let result = initialResult;
    const resolvedPath = filePath || result.filePath || '';

    while (true) {
        if (result.canceled) { return false; }

        if (result.needsPassword) {
            const entered = await app.modals.showDecryptPasswordModal({
                fileName: result.name || getDisplayName(resolvedPath, result),
                kind: result.kind || 'tree',
                wrongPassword
            });
            if (!entered) { return false; }
            password = entered;
            wrongPassword = false;
            if (!resolvedPath) {
                app.toast.showToast(app.i18n.t('error_tree_encrypted'), 4000);
                return false;
            }
            result = await app.electronAPI.loadDroppedFile(resolvedPath, lang, { password });
            continue;
        }

        if (result.wrongPassword) {
            const entered = await app.modals.showDecryptPasswordModal({
                fileName: result.name || getDisplayName(resolvedPath, result),
                kind: result.kind || 'tree',
                wrongPassword: true
            });
            if (!entered) { return false; }
            password = entered;
            wrongPassword = false;
            if (!resolvedPath) {
                app.toast.showToast(app.i18n.t('error_tree_encrypted'), 4000);
                return false;
            }
            result = await app.electronAPI.loadDroppedFile(resolvedPath, lang, { password });
            continue;
        }

        if (result.error) {
            app.toast.showToast(result.error, 4000);
            return false;
        }

        return applyLoadResult(app, result, resolvedPath);
    }
}