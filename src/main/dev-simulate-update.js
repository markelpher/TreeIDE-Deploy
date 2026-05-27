const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;
let isReadyToClose = false;

const currentVersion = app.getVersion();
const simulatedVersion = incrementVersion(currentVersion);
let simulatedProgress = 0;
let simulatedInterval = null;

function incrementVersion(version) {
    const parts = version.split('.');
    parts[2] = String(parseInt(parts[2] || '0') + 1);
    return parts.join('.');
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: false,
        icon: path.join(__dirname, '..', '..', 'assets', 'icon-no-bg.png'),
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    mainWindow.setMenu(null);

    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
    mainWindow.webContents.openDevTools({ mode: 'detach' });

    const updateWindowState = () => {
        mainWindow.webContents.send('window-state-changed', mainWindow.isMaximized());
    };

    mainWindow.on('maximize', updateWindowState);
    mainWindow.on('unmaximize', updateWindowState);
    mainWindow.on('resize', updateWindowState);
    mainWindow.maximize();

    mainWindow.webContents.once('did-finish-load', () => {
        updateWindowState();
        log.info('[SIM] Simulating update available event...');
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('release-update-available', {
                    ok: true,
                    updateAvailable: true,
                    currentVersion: currentVersion,
                    latestVersion: simulatedVersion,
                    releaseName: `Tree IDE v${simulatedVersion}`,
                    assetName: `Tree-IDE-Setup-${simulatedVersion}.exe`
                });
            }
        }, 2000);
    });

    mainWindow.on('close', (e) => {
        if (!isReadyToClose) {
            e.preventDefault();
            mainWindow.webContents.send('attempt-close');
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    isPackaged: false,
    isSimulated: true
}));

ipcMain.handle('check-release-update', () => ({
    ok: true,
    updateAvailable: true,
    currentVersion: currentVersion,
    latestVersion: simulatedVersion,
    releaseName: `Tree IDE v${simulatedVersion}`,
    assetName: `Tree-IDE-Setup-${simulatedVersion}.exe`
}));

ipcMain.handle('download-update', async () => {
    log.info('[SIM] Starting simulated update download...');
    simulatedProgress = 0;

    return new Promise((resolve) => {
        simulatedInterval = setInterval(() => {
            simulatedProgress += 5;

            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('update-download-progress', {
                    percent: Math.min(simulatedProgress, 100),
                    bytesPerSecond: 5 * 1024 * 1024,
                    transferred: Math.round((simulatedProgress / 100) * 50 * 1024 * 1024),
                    total: 50 * 1024 * 1024
                });
            }

            if (simulatedProgress >= 100) {
                clearInterval(simulatedInterval);
                simulatedInterval = null;

                setTimeout(() => {
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('update-downloaded', {
                            version: simulatedVersion,
                            releaseName: `Tree IDE v${simulatedVersion}`
                        });
                    }
                }, 500);

                resolve({ ok: true });
            }
        }, 200);
    });
});

ipcMain.handle('install-update', () => {
    log.info('[SIM] Install requested (no-op in simulation).');
    return { ok: true };
});

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
