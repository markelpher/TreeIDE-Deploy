const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;
const updateFeed = {
    provider: 'github',
    owner: 'markelpher',
    repo: 'TreeIDE-Deploy'
};
const updateRepoUrl = `https://github.com/${updateFeed.owner}/${updateFeed.repo}`;
const releasesApiUrl = `https://api.github.com/repos/${updateFeed.owner}/${updateFeed.repo}/releases`;

// Basic auto-updater config
autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = false;
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.setFeedURL(updateFeed);

let isReadyToClose = false;
let latestUpdateInfo = null;

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

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '---';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function pickReleaseAsset(release) {
    const assets = Array.isArray(release?.assets) ? release.assets : [];
    const platform = process.platform;

    if (platform === 'win32') {
        return assets.find((asset) => /setup.*\.exe$/i.test(asset.name))
            || assets.find((asset) => /\.exe$/i.test(asset.name) && !/portable/i.test(asset.name))
            || assets.find((asset) => /\.msi$/i.test(asset.name))
            || assets.find((asset) => /\.exe$/i.test(asset.name));
    }

    if (platform === 'darwin') {
        return assets.find((asset) => /\.(dmg|zip)$/i.test(asset.name));
    }

    return assets.find((asset) => /\.(appimage|deb|rpm|tar\.gz)$/i.test(asset.name));
}

function releaseToUpdateInfo(release) {
    const asset = pickReleaseAsset(release);
    const version = normalizeVersion(release?.tag_name || release?.name);
    const hasUpdaterMetadata = Array.isArray(release?.assets)
        && release.assets.some((item) => /^latest.*\.ya?ml$/i.test(item.name));

    return {
        version,
        size: formatBytes(asset?.size),
        releaseName: release?.name || `v${version}`,
        releaseUrl: release?.html_url || `${updateRepoUrl}/releases`,
        downloadUrl: asset?.browser_download_url || release?.html_url || `${updateRepoUrl}/releases`,
        canInstall: app.isPackaged && process.platform === 'win32' && hasUpdaterMetadata,
        manual: !app.isPackaged || !hasUpdaterMetadata,
        prerelease: Boolean(release?.prerelease)
    };
}

function sendManualUpdateFallback(errorMessage = '') {
    if (!latestUpdateInfo) return false;

    latestUpdateInfo = {
        ...latestUpdateInfo,
        canInstall: false,
        manual: true,
        error: errorMessage
    };

    mainWindow?.webContents.send('updater-available', latestUpdateInfo);
    return true;
}

async function fetchJson(url) {
    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'Tree-IDE-Updater'
        }
    });

    if (!response.ok) {
        const error = new Error(`GitHub update check failed with status ${response.status}`);
        error.statusCode = response.status;
        throw error;
    }

    return response.json();
}

async function getLatestRelease(channel = 'release') {
    const releases = await fetchJson(`${releasesApiUrl}?per_page=20`);
    const usableReleases = releases
        .filter((release) => !release.draft)
        .filter((release) => channel === 'beta' || !release.prerelease);

    return usableReleases[0] || null;
}

function getUpdateErrorMessage(err) {
    const rawMessage = err?.message || String(err || '');
    const statusCode = err?.statusCode || err?.response?.statusCode;
    const message = rawMessage.toLowerCase();

    if (statusCode === 404 || message.includes('404')) {
        return 'update_not_found';
    }

    if (message.includes('authentication token') || message.includes('unauthorized') || message.includes('401')) {
        return 'update_check_failed';
    }

    if (message.includes('latest.yml') || message.includes('latest-mac.yml') || message.includes('latest-linux.yml')) {
        return 'update_not_found';
    }

    if (message.includes('net::') || message.includes('network') || message.includes('enotfound') || message.includes('econnreset')) {
        return 'update_network_error';
    }

    if (!rawMessage.trim()) {
        return 'update_check_failed';
    }

    return rawMessage.replace(/\s+/g, ' ').slice(0, 180);
}

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
        if (app.isPackaged) {
            checkForUpdates();
        }
    });

    mainWindow.on('close', (e) => {
        if (!isReadyToClose) {
            e.preventDefault();
            mainWindow.webContents.send('attempt-close');
        }
    });
}


async function checkForUpdates(channel = 'release') {
    latestUpdateInfo = null;
    autoUpdater.allowPrerelease = channel === 'beta';
    mainWindow?.webContents.send('updater-checking');

    try {
        const release = await getLatestRelease(channel);

        if (!release) {
            mainWindow?.webContents.send('updater-not-available');
            return { ok: true, updateAvailable: false };
        }

        const updateInfo = releaseToUpdateInfo(release);
        if (compareVersions(updateInfo.version, app.getVersion()) <= 0) {
            mainWindow?.webContents.send('updater-not-available');
            return { ok: true, updateAvailable: false };
        }

        latestUpdateInfo = updateInfo;
        mainWindow?.webContents.send('updater-available', updateInfo);

        return { ok: true };
    } catch (err) {
        const message = getUpdateErrorMessage(err);
        mainWindow?.webContents.send('updater-error', message);
        return { ok: false, error: message };
    }
}

autoUpdater.on('checking-for-update', () => {
    mainWindow?.webContents.send('updater-checking');
});

autoUpdater.on('update-available', (info) => {
    // Get version and size (if available)
    const version = info.version;
    const size = info.files && info.files[0] ? (info.files[0].size / (1024 * 1024)).toFixed(2) + ' MB' : '---';
    latestUpdateInfo = {
        ...latestUpdateInfo,
        version,
        size,
        canInstall: true,
        manual: false
    };
    mainWindow?.webContents.send('updater-available', latestUpdateInfo);
});

autoUpdater.on('update-not-available', () => {
    if (latestUpdateInfo && compareVersions(latestUpdateInfo.version, app.getVersion()) > 0) {
        return;
    }

    mainWindow?.webContents.send('updater-not-available');
});

autoUpdater.on('download-progress', (progressObj) => {
    mainWindow?.webContents.send('updater-progress', progressObj.percent.toFixed(0));
});

autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('updater-downloaded');
});

autoUpdater.on('error', (err) => {
    mainWindow?.webContents.send('updater-error', getUpdateErrorMessage(err));
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged
}));

// IPC for Manual Update Check & Action
ipcMain.handle('check-for-updates', async () => {
    return checkForUpdates();
});

ipcMain.handle('check-for-updates-channel', async (event, channel) => {
    return checkForUpdates(channel);
});

ipcMain.handle('download-update', async () => {
    if (latestUpdateInfo?.manual) {
        await shell.openExternal(latestUpdateInfo.downloadUrl || latestUpdateInfo.releaseUrl);
        return { ok: true, manual: true };
    }

    try {
        if (latestUpdateInfo?.canInstall) {
            await autoUpdater.checkForUpdates();
        }

        await autoUpdater.downloadUpdate();
        return { ok: true };
    } catch (err) {
        const message = getUpdateErrorMessage(err);
        const hasManualFallback = sendManualUpdateFallback(message);
        mainWindow?.webContents.send('updater-error', hasManualFallback ? 'update_manual_fallback' : message);
        return { ok: false, error: message, manualAvailable: hasManualFallback };
    }
});

ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.handle('open-update-download', async () => {
    const url = latestUpdateInfo?.downloadUrl || `${updateRepoUrl}/releases/latest`;
    await shell.openExternal(url);
    return { ok: true };
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

