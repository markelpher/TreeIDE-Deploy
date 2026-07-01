/**
 * TreeIDE - Preload bridge
 * Exposes safe IPC methods to the renderer process via contextBridge.
 * Each method maps to a corresponding ipcMain.handle in main.js.
 */

import { contextBridge, ipcRenderer, webUtils } from 'electron';

function wrapInvoke(method) {
    return (...args) => ipcRenderer.invoke(method, ...args).catch((err) => {
        console.error(`[TreeIDE] IPC ${method} failed:`, err);
        return { error: err.message || String(err) };
    });
}

contextBridge.exposeInMainWorld('electronAPI', {
    loadUnified: wrapInvoke('load-unified'),
    loadDroppedFile: wrapInvoke('load-dropped-file'),
    getFilePath: (file) => webUtils.getPathForFile(file),
    saveTree: wrapInvoke('save-tree'),
    saveTreeAs: wrapInvoke('save-tree-as'),
    createStructure: wrapInvoke('create-structure'),
    inspectStructure: wrapInvoke('inspect-structure'),
    exportZip: wrapInvoke('export-zip'),
    selectBuildFolder: wrapInvoke('select-build-folder'),
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    isWindowMaximized: wrapInvoke('is-window-maximized'),
    windowClose: () => ipcRenderer.send('window-close'),
    windowReload: () => ipcRenderer.send('window-reload'),
    windowDevTools: () => ipcRenderer.send('window-dev-tools'),
    onWindowStateChanged: (callback) => { ipcRenderer.removeAllListeners('window-state-changed'); ipcRenderer.on('window-state-changed', (event, value) => callback(value)); },
    getAppInfo: wrapInvoke('get-app-info'),
    getCurrentReleaseInfo: wrapInvoke('get-current-release-info'),
    checkReleaseUpdate: wrapInvoke('check-release-update'),
    setUpdateChannel: wrapInvoke('set-update-channel'),
    downloadUpdate: wrapInvoke('download-update'),
    installUpdate: wrapInvoke('install-update'),
    onReleaseUpdateAvailable: (callback) => { ipcRenderer.removeAllListeners('release-update-available'); ipcRenderer.on('release-update-available', (event, info) => callback(info)); },
    onReleaseUpdateError: (callback) => { ipcRenderer.removeAllListeners('release-update-error'); ipcRenderer.on('release-update-error', (event, message) => callback(message)); },
    onUpdateDownloadProgress: (callback) => { ipcRenderer.removeAllListeners('update-download-progress'); ipcRenderer.on('update-download-progress', (event, progress) => callback(progress)); },
    onUpdateDownloaded: (callback) => { ipcRenderer.removeAllListeners('update-downloaded'); ipcRenderer.on('update-downloaded', (event, info) => callback(info)); },
    openExternal: (url) => ipcRenderer.send('open-external', url),
    onAttemptClose: (callback) => { ipcRenderer.removeAllListeners('attempt-close'); ipcRenderer.on('attempt-close', () => callback()); },
    forceClose: () => ipcRenderer.send('force-close'),
    saveErrorLog: wrapInvoke('save-error-log')
});