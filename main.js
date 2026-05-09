const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;
let isReadyToClose = false;
let latestUpdateInfo = null;
let updateProviderReady = false;
const updateFeedUrl = 'https://github.com/markelpher/TreeIDE-Deploy/releases/latest/download';

autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = false;
autoUpdater.autoInstallOnAppQuit = false;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.setFeedURL({
    provider: 'generic',
    url: updateFeedUrl
});

function normalizeVersion(version = '') {
    return String(version).trim().replace(/^v/i, '').split('-')[0];
}

function compareVersions(a, b) {
    const left = normalizeVersion(a).split('.').map((part) => Number.parseInt(part, 10) || 0);
    const right = normalizeVersion(b).split('.').map((part) => Number.parseInt(part, 10) || 0);
    const length = Math.max(left.length, right.length);

    for (let i = 0; i < length; i += 1) {
        const diff = (left[i] || 0) - (right[i] || 0);
        if (diff !== 0) return diff > 0 ? 1 : -1;
    }

    return 0;
}

function buildUpdateInfo(info = {}) {
    const latestVersion = normalizeVersion(info.version);
    return {
        ok: true,
        updateAvailable: compareVersions(latestVersion, app.getVersion()) > 0,
        currentVersion: app.getVersion(),
        latestVersion,
        releaseName: `Tree IDE v${latestVersion}`,
        assetName: info.files?.[0]?.url || ''
    };
}

function parseLatestYml(content = '') {
    const version = content.match(/^version:\s*['"]?([^'"\r\n]+)['"]?/m)?.[1]?.trim();
    const assetName = content.match(/^\s*-\s*url:\s*['"]?([^'"\r\n]+)['"]?/m)?.[1]?.trim()
        || content.match(/^path:\s*['"]?([^'"\r\n]+)['"]?/m)?.[1]?.trim()
        || '';

    if (!version) return null;

    return {
        version,
        files: assetName ? [{ url: assetName }] : []
    };
}

async function fetchLatestYmlUpdateInfo() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${updateFeedUrl}/latest.yml`, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Tree-IDE-Updater'
            }
        });

        if (!response.ok) {
            throw new Error(`latest.yml returned ${response.status}`);
        }

        const text = await response.text();
        const parsedInfo = parseLatestYml(text);
        return parsedInfo ? buildUpdateInfo(parsedInfo) : null;
    } finally {
        clearTimeout(timeout);
    }
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
    let updateInfo = null;

    try {
        updateInfo = await fetchLatestYmlUpdateInfo();
        if (updateInfo) {
            log.info(updateInfo.updateAvailable
                ? `Update metadata says ${updateInfo.latestVersion} is available.`
                : `Update metadata says app is current at ${updateInfo.latestVersion}.`);
        }
    } catch (err) {
        log.warn(`Direct latest.yml check failed: ${err?.message || String(err)}`);
    }

    try {
        const result = await autoUpdater.checkForUpdates();
        updateProviderReady = true;
        updateInfo = buildUpdateInfo(result?.updateInfo);
    } catch (err) {
        updateProviderReady = false;
        if (!updateInfo) throw err;
        log.warn(`Electron updater check failed after latest.yml check: ${err?.message || String(err)}`);
    }

    latestUpdateInfo = updateInfo.updateAvailable ? updateInfo : null;
    log.info(updateInfo.updateAvailable ? `Update available: ${updateInfo.latestVersion}` : 'No update available.');
    return updateInfo;
}

autoUpdater.on('update-available', (info) => {
    updateProviderReady = true;
    latestUpdateInfo = buildUpdateInfo(info);
    log.info(`Update available event: ${latestUpdateInfo.latestVersion}`);
    mainWindow?.webContents.send('release-update-available', latestUpdateInfo);
});

autoUpdater.on('checking-for-update', () => {
    log.info(`Checking update feed: ${updateFeedUrl}`);
});

autoUpdater.on('update-not-available', () => {
    updateProviderReady = true;
    latestUpdateInfo = null;
    log.info('Update not available event.');
});

autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('release-update-progress', Math.round(progress.percent || 0));
});

autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('release-update-downloaded');
});

autoUpdater.on('error', (err) => {
    updateProviderReady = false;
    const message = getUpdateErrorMessage(err);
    log.warn(`Update error: ${err?.message || String(err)}`);
    mainWindow?.webContents.send('release-update-error', message);
});

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

ipcMain.handle('download-release-update', async () => {
    if (!latestUpdateInfo) {
        return { ok: false, error: 'No update available.' };
    }

    if (!updateProviderReady) {
        await autoUpdater.checkForUpdates();
        updateProviderReady = true;
    }

    await autoUpdater.downloadUpdate();
    return { ok: true };
});

ipcMain.on('install-release-update', () => {
    autoUpdater.quitAndInstall();
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

