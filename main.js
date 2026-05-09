const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;

// Basic auto-updater config
autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = false;
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

let isReadyToClose = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,
        icon: path.join(__dirname, 'assets', 'icon-no-bg.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.setMenu(null);

    mainWindow.loadFile('index.html');

    const updateWindowState = () => {
        mainWindow.webContents.send('window-state-changed', mainWindow.isMaximized());
    };

    mainWindow.on('maximize', updateWindowState);
    mainWindow.on('unmaximize', updateWindowState);
    mainWindow.on('resize', updateWindowState);
    mainWindow.maximize();
    
    // Check for updates after load
    mainWindow.webContents.once('did-finish-load', () => {
        updateWindowState();
        autoUpdater.checkForUpdates();
    });

    mainWindow.on('close', (e) => {
        if (!isReadyToClose) {
            e.preventDefault();
            mainWindow.webContents.send('attempt-close');
        }
    });
}


function checkForUpdates() {
    autoUpdater.checkForUpdates();
}

autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater-checking');
});

autoUpdater.on('update-available', (info) => {
    // Get version and size (if available)
    const version = info.version;
    const size = info.files && info.files[0] ? (info.files[0].size / (1024 * 1024)).toFixed(2) + ' MB' : '---';
    mainWindow?.webContents.send('updater-available', { version, size });
});

autoUpdater.on('update-not-available', () => {
    mainWindow?.webContents.send('updater-not-available');
});

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater-progress', progressObj.percent.toFixed(0));
});

autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('updater-downloaded');
});

autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater-error', err.message);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC for Manual Update Check & Action
ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
});

ipcMain.on('download-update', () => {
    autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

// IPC handlers
ipcMain.handle('load-tree', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'Tree files', extensions: ['tree'] }],
        properties: ['openFile']
    });
    if (canceled) return { canceled: true };

    const treeData = parseTreeFile(filePaths[0]);
    const content = fs.readFileSync(filePaths[0], 'utf-8');
    return { canceled: false, treeData, content, filePath: filePaths[0] };
});

ipcMain.handle('save-tree', async (event, filePath, content) => {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
});

ipcMain.handle('select-build-folder', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });

    if (canceled || !filePaths[0]) return { canceled: true };
    return { canceled: false, path: filePaths[0] };
});

ipcMain.handle('inspect-structure', async (event, treeData, targetPath = '') => {
    if (!targetPath) return { canceled: true };

    try {
        return { canceled: false, ...inspectStructure(treeData, targetPath) };
    } catch (err) {
        return { canceled: false, error: err.message };
    }
});

ipcMain.handle('create-structure', async (event, treeData, targetPath = '', options = {}) => {
    let selectedPath = targetPath;

    if (!selectedPath) {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        if (!canceled) selectedPath = filePaths[0];
    }

    if (!selectedPath) return { canceled: true };

    try {
        const summary = createStructure(treeData, selectedPath, options);
        return { canceled: false, path: selectedPath, summary };
    } catch (err) {
        return { canceled: false, error: err.message };
    }
});

ipcMain.handle('export-zip', async (event, treeData, defaultName = 'project', options = {}) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Export ZIP',
        defaultPath: `${defaultName}.zip`,
        filters: [{ name: 'ZIP files', extensions: ['zip'] }]
    });

    if (canceled || !filePath) return { canceled: true };

    try {
        const result = exportTreeZip(treeData, filePath, options);
        return { canceled: false, ...result };
    } catch (err) {
        return { canceled: false, error: err.message };
    }
});

ipcMain.handle('save-tree-as', async (event, content, defaultName = 'project') => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Project',
        defaultPath: `${defaultName}.tree`,
        filters: [{ name: 'Tree files', extensions: ['tree'] }]
    });


    if (canceled || !filePath) return { canceled: true };

    fs.writeFileSync(filePath, content, 'utf-8');
    return { canceled: false, filePath };
});

ipcMain.on('window-minimize', () => {
    mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) {
        mainWindow.unmaximize();
    } else {
        mainWindow?.maximize();
    }
});

ipcMain.on('window-close', () => {
    mainWindow?.close();
});

ipcMain.on('window-reload', () => {
    mainWindow?.webContents.reload();
});

ipcMain.on('window-dev-tools', () => {
    mainWindow?.webContents.toggleDevTools();
});

ipcMain.on('force-close', () => {
    isReadyToClose = true;
    mainWindow?.close();
});


ipcMain.on('open-external', (event, url) => {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            shell.openExternal(parsedUrl.toString());
        }
    } catch {
        // Ignore invalid URLs from the renderer.
    }
});

