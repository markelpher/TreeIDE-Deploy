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
    checkForUpdates: (channel) => ipcRenderer.send('check-for-updates', channel),
    downloadUpdate: () => ipcRenderer.send('download-update'),
    installUpdate: () => ipcRenderer.send('install-update'),
    onUpdateChecking: (callback) => ipcRenderer.on('updater-checking', () => callback()),
    onUpdateAvailable: (callback) => ipcRenderer.on('updater-available', (event, info) => callback(info)),
    onUpdateNotAvailable: (callback) => ipcRenderer.on('updater-not-available', () => callback()),
    onUpdateProgress: (callback) => ipcRenderer.on('updater-progress', (event, percent) => callback(percent)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('updater-downloaded', () => callback()),
    onUpdateError: (callback) => ipcRenderer.on('updater-error', (event, message) => callback(message)),
    openExternal: (url) => ipcRenderer.send('open-external', url),
    onAttemptClose: (callback) => ipcRenderer.on('attempt-close', () => callback()),
    forceClose: () => ipcRenderer.send('force-close')
});

