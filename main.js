const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { parseTreeFile } = require('./treeParser');
const { createStructure, inspectStructure } = require('./treeCreator');
const { exportTreeZip } = require('./zipCreator');

let mainWindow;
let isReadyToClose = false;
const releaseRepo = {
    owner: 'markelpher',
    repo: 'TreeIDE-Deploy'
};
const releasesUrl = `https://github.com/${releaseRepo.owner}/${releaseRepo.repo}/releases`;
const repoApiUrl = `https://api.github.com/repos/${releaseRepo.owner}/${releaseRepo.repo}`;
const updateManifestUrl = `${releasesUrl}/latest/download/update.json`;

function normalizeVersion(version = '') {
    return String(version).trim().replace(/^v/i, '').split('-')[0];
}

function isStableVersionTag(version = '') {
    return /^v?\d+\.\d+\.\d+$/i.test(String(version).trim());
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

function sortNewestVersionFirst(items) {
    return [...items].sort((a, b) => compareVersions(b.version, a.version));
}

function pickWindowsReleaseAsset(release) {
    const assets = Array.isArray(release?.assets) ? release.assets : [];

    return assets.find((asset) => /setup.*\.exe$/i.test(asset.name))
        || assets.find((asset) => /\.exe$/i.test(asset.name) && !/portable/i.test(asset.name))
        || assets.find((asset) => /\.msi$/i.test(asset.name))
        || assets.find((asset) => /\.exe$/i.test(asset.name))
        || assets[0];
}

async function fetchGitHubJson(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                Accept: 'application/vnd.github+json',
                'User-Agent': 'Tree-IDE-Release-Notifier'
            }
        });

        if (response.status === 404) return null;
        if (!response.ok) {
            throw new Error(`GitHub update check failed with status ${response.status}`);
        }

        return response.json();
    } finally {
        clearTimeout(timeout);
    }
}

async function fetchReleaseCandidates() {
    const releases = await fetchGitHubJson(`${repoApiUrl}/releases?per_page=30`) || [];
    const releaseCandidates = releases
        .filter((release) => !release.draft)
        .map((release) => ({
            type: 'release',
            version: normalizeVersion(release.tag_name || release.name),
            tagName: release.tag_name,
            release
        }))
        .filter((candidate) => isStableVersionTag(candidate.tagName || candidate.version));

    const tags = await fetchGitHubJson(`${repoApiUrl}/tags?per_page=30`) || [];
    const tagCandidates = tags
        .map((tag) => ({
            type: 'tag',
            version: normalizeVersion(tag.name),
            tagName: tag.name,
            release: null
        }))
        .filter((candidate) => isStableVersionTag(candidate.tagName));

    const candidatesByVersion = new Map();
    for (const candidate of [...tagCandidates, ...releaseCandidates]) {
        const existing = candidatesByVersion.get(candidate.version);
        if (!existing || candidate.type === 'release') {
            candidatesByVersion.set(candidate.version, candidate);
        }
    }

    return sortNewestVersionFirst([...candidatesByVersion.values()]);
}

async function fetchUpdateManifest() {
    return fetchGitHubJson(updateManifestUrl);
}

function getUpdateInfoFromManifest(manifest, currentVersion) {
    const latestVersion = normalizeVersion(manifest?.version);

    if (!latestVersion || !isStableVersionTag(latestVersion) || compareVersions(latestVersion, currentVersion) <= 0) {
        return null;
    }

    return {
        ok: true,
        updateAvailable: true,
        currentVersion,
        latestVersion,
        releaseName: manifest.releaseName || `Tree IDE v${latestVersion}`,
        releaseUrl: manifest.releaseUrl || `${releasesUrl}/latest`,
        downloadUrl: manifest.downloadUrl || manifest.releaseUrl || `${releasesUrl}/latest`,
        assetName: manifest.assetName || ''
    };
}

async function checkReleaseUpdate() {
    const currentVersion = app.getVersion();
    const manifestUpdate = getUpdateInfoFromManifest(await fetchUpdateManifest(), currentVersion);

    if (manifestUpdate) {
        return manifestUpdate;
    }

    const candidates = await fetchReleaseCandidates();
    const latestCandidate = candidates.find((candidate) => compareVersions(candidate.version, currentVersion) > 0);

    if (!latestCandidate) {
        return {
            ok: true,
            updateAvailable: false,
            currentVersion,
            latestVersion: candidates[0]?.version || ''
        };
    }

    const release = latestCandidate.release;
    const asset = pickWindowsReleaseAsset(release);
    const tagName = latestCandidate.tagName || `v${latestCandidate.version}`;
    const releaseUrl = release?.html_url || `${releasesUrl}/tag/${tagName}`;

    return {
        ok: true,
        updateAvailable: true,
        currentVersion,
        latestVersion: latestCandidate.version,
        releaseName: release?.name || `Tree IDE ${tagName}`,
        releaseUrl,
        downloadUrl: asset?.browser_download_url || releaseUrl,
        assetName: asset?.name || ''
    };
}

async function openHttpUrl(url) {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        await shell.openExternal(parsedUrl.toString());
    }
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
        return { ok: false, error: err?.message || String(err) };
    }
});

ipcMain.handle('open-release-update-download', async (event, url) => {
    const targetUrl = url || `${releasesUrl}/latest`;
    await openHttpUrl(targetUrl);
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

