const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadTree: () => ipcRenderer.invoke('load-tree'),
    saveTree: (filePath, content) => ipcRenderer.invoke('save-tree', filePath, content),
    saveTreeAs: (content, defaultName) => ipcRenderer.invoke('save-tree-as', content, defaultName),
    createStructure: (treeData, targetPath, options) => ipcRenderer.invoke('create-structure', treeData, targetPath, options),
    inspectStructure: (treeData, targetPath) => ipcRenderer.invoke('inspect-structure', treeData, targetPath),
    exportZip: (treeData, defaultName, options) => ipcRenderer.invoke('export-zip', treeData, defaultName, options),
    selectBuildFolder: () => ipcRenderer.invoke('select-build-folder'),
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    windowClose: () => ipcRenderer.send('window-close'),
    windowReload: () => ipcRenderer.send('window-reload'),
    windowDevTools: () => ipcRenderer.send('window-dev-tools'),
    onWindowStateChanged: (callback) => ipcRenderer.on('window-state-changed', (event, value) => callback(value)),
    getAppInfo: () => ipcRenderer.invoke('get-app-info'),
    checkReleaseUpdate: () => ipcRenderer.invoke('check-release-update'),
    downloadReleaseUpdate: () => ipcRenderer.invoke('download-release-update'),
    installReleaseUpdate: () => ipcRenderer.send('install-release-update'),
    onReleaseUpdateAvailable: (callback) => ipcRenderer.on('release-update-available', (event, info) => callback(info)),
    onReleaseUpdateProgress: (callback) => ipcRenderer.on('release-update-progress', (event, percent) => callback(percent)),
    onReleaseUpdateDownloaded: (callback) => ipcRenderer.on('release-update-downloaded', () => callback()),
    onReleaseUpdateError: (callback) => ipcRenderer.on('release-update-error', (event, message) => callback(message)),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    onAttemptClose: (callback) => ipcRenderer.on('attempt-close', () => callback()),
    forceClose: () => ipcRenderer.send('force-close')
});

