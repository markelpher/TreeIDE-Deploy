const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const log = require('electron-log');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;
let isReadyToClose = false;
let autoUpdater = null;

// Safely load electron-updater (may not be available in dev)
try {
    const updater = require('electron-updater');
    autoUpdater = updater.autoUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.allowPrerelease = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
} catch (err) {
    log.warn('electron-updater not available:', err.message);
}

function getUpdateErrorMessage(err) {
    const rawMessage = err?.message || String(err || '');
    const message = rawMessage.toLowerCase();

    if (message.includes('releases.atom') || message.includes('authentication token') || message.includes('404')) {
        return 'update_repo_inaccessible';
    }

    if (message.includes('latest.yml') || message.includes('latest-mac.yml') || message.includes('latest-linux.yml')) {
        return 'update_metadata_missing';
    }

    if (message.includes('net::') || message.includes('network') || message.includes('enotfound') || message.includes('econnreset')) {
        return 'update_network_error';
    }

    return rawMessage.replace(/\s+/g, ' ').slice(0, 180) || 'update_failed';
}

async function openHttpUrl(url) {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        await shell.openExternal(parsedUrl.toString());
    }
}

async function checkReleaseUpdate() {
    if (!autoUpdater) {
        return { ok: true, updateAvailable: false, currentVersion: app.getVersion(), latestVersion: app.getVersion() };
    }

    if (!app.isPackaged) {
        log.info('Skipping update check because the app is not packaged.');
        return {
            ok: true,
            updateAvailable: false,
            currentVersion: app.getVersion(),
            latestVersion: app.getVersion()
        };
    }

    log.info('Checking for updates.');
    const result = await autoUpdater.checkForUpdates();
    const info = result?.updateInfo;
    const latestVersion = info?.version;
    const updateAvailable = latestVersion && latestVersion !== app.getVersion();

    const updateInfo = {
        ok: true,
        updateAvailable,
        currentVersion: app.getVersion(),
        latestVersion: latestVersion || app.getVersion(),
        releaseName: info?.releaseName || `Tree IDE v${latestVersion}`,
        assetName: info?.files?.[0]?.url || ''
    };

    log.info(updateAvailable ? `Update available: ${latestVersion}` : 'No update available.');
    return updateInfo;
}

// Auto-updater event handlers (only registered if updater is available)
if (autoUpdater) {
    autoUpdater.on('update-available', (info) => {
        log.info(`Update available: ${info.version}`);
        mainWindow?.webContents.send('release-update-available', {
            ok: true,
            updateAvailable: true,
            currentVersion: app.getVersion(),
            latestVersion: info.version,
            releaseName: info.releaseName || `Tree IDE v${info.version}`,
            assetName: info.files?.[0]?.url || ''
        });
    });

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    });

    autoUpdater.on('update-not-available', () => {
        log.info('Update not available event.');
    });

    autoUpdater.on('download-progress', (progress) => {
        log.info(`Download progress: ${Math.round(progress.percent)}%`);
        mainWindow?.webContents.send('update-download-progress', {
            percent: Math.round(progress.percent),
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        log.info(`Update downloaded: ${info.version}`);
        mainWindow?.webContents.send('update-downloaded', {
            version: info.version,
            releaseName: info.releaseName || `Tree IDE v${info.version}`
        });
    });

    autoUpdater.on('error', (err) => {
        const message = getUpdateErrorMessage(err);
        log.warn(`Update error: ${err?.message || String(err)}`);
        mainWindow?.webContents.send('release-update-error', message);
    });
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

    const updateWindowState = () => {
        mainWindow.webContents.send('window-state-changed', mainWindow.isMaximized());
    };

    mainWindow.on('maximize', updateWindowState);
    mainWindow.on('unmaximize', updateWindowState);
    mainWindow.on('resize', updateWindowState);
    mainWindow.maximize();

    mainWindow.webContents.once('did-finish-load', () => {
        updateWindowState();
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

// IPC handlers
ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged
}));

ipcMain.handle('check-release-update', async () => {
    try {
        return await checkReleaseUpdate();
    } catch (err) {
        return { ok: false, error: getUpdateErrorMessage(err) };
    }
});

ipcMain.handle('download-update', async () => {
    if (!autoUpdater) {
        return { ok: false, error: 'update_failed' };
    }
    try {
        log.info('Starting update download...');
        await autoUpdater.downloadUpdate();
        return { ok: true };
    } catch (err) {
        log.warn(`Download error: ${err?.message || String(err)}`);
        return { ok: false, error: getUpdateErrorMessage(err) };
    }
});

ipcMain.handle('install-update', () => {
    if (!autoUpdater) {
        return { ok: false, error: 'update_failed' };
    }
    log.info('Installing update and restarting...');
    isReadyToClose = true;
    autoUpdater.quitAndInstall(true, true);
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
        openHttpUrl(url);
    } catch {
        // Ignore invalid URLs from the renderer.
    }
});
