/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
import path from 'node:path';
import { existsSync, readFileSync, unlinkSync, writeFileSync, rmSync } from 'node:fs';
import { ipcMain, app, shell } from 'electron';
import log from 'electron-log';
import {
    getUpdateErrorMessage,
    normalizeReleaseName,
} from '../../shared/updateErrors.js';
import { getUpdateInstallMode, isInAppUpdateInstallSupported } from '../../shared/updateInstall.js';
import { normalizeDownloadPercent } from '../../shared/updateProgress.js';
import {
    isReleaseFinalized,
    normalizeReleaseNotesEntries,
} from '../../shared/releaseFinalize.js';

const require = createRequire(import.meta.url);
const semver = require('semver');

let autoUpdater = null;
let lastDownloadPercent = 0;
let lastDownloadedUpdateFile = '';
let lastDownloadedUpdateVersion = '';
const PENDING_UPDATE_INSTALL_FILE = 'pending-update-install.json';
const GITHUB_OWNER = 'markelpher';
const GITHUB_REPO = 'treeide-deploy';

let lastAvailableUpdateInfo = null;


function getPendingUpdateInstallPath() {
    return path.join(app.getPath('userData'), PENDING_UPDATE_INSTALL_FILE);
}

function readPendingUpdateInstall() {
    const statePath = getPendingUpdateInstallPath();
    if (!existsSync(statePath)) { return null; }
    try {
        return JSON.parse(readFileSync(statePath, 'utf8'));
    } catch (err) {
        log.warn('Failed to read pending update install state: ' + (err?.message || String(err)));
        clearPendingUpdateInstall();
        return null;
    }
}

function normalizeSemver(value) {
    return semver.coerce(value);
}

export function isInstalledUpdateVersion(currentVersion, targetVersion) {
    const current = normalizeSemver(currentVersion);
    const target = normalizeSemver(targetVersion);
    if (!current || !target) { return false; }
    return semver.gte(current, target);
}

function safeDeleteFile(filePath) {
    if (!filePath || !existsSync(filePath)) { return false; }
    try {
        unlinkSync(filePath);
        return true;
    } catch (err) {
        log.warn('Failed to delete update installer ' + filePath + ': ' + (err?.message || String(err)));
        return false;
    }
}

function safeDeleteEmptyDir(dirPath) {
    if (!dirPath || !existsSync(dirPath)) { return; }
    try {
        rmSync(dirPath, { recursive: false });
    } catch {
        // Keep non-empty cache directories; only the installer file must be removed.
    }
}

function writePendingUpdateInstall({ version, installerPath }) {
    if (!version || !installerPath) { return; }
    const payload = {
        version,
        installerPath,
        platform: process.platform,
        createdAt: new Date().toISOString(),
    };
    try {
        writeFileSync(getPendingUpdateInstallPath(), JSON.stringify(payload, null, 2), 'utf8');
    } catch (err) {
        log.warn('Failed to persist pending update install state: ' + (err?.message || String(err)));
    }
}

function clearPendingUpdateInstall() {
    safeDeleteFile(getPendingUpdateInstallPath());
}

function getDownloadedUpdateFile() {
    return lastDownloadedUpdateFile || autoUpdater?.downloadedUpdateHelper?.file || '';
}

function rememberDownloadedUpdate(state) {
    if (!state?.version || !state?.installerPath || !existsSync(state.installerPath)) { return false; }
    lastDownloadedUpdateVersion = state.version;
    lastDownloadedUpdateFile = state.installerPath;
    return true;
}

function getPendingDownloadedUpdate(version, currentVersion = app.getVersion()) {
    const state = readPendingUpdateInstall();
    if (!state?.version || !state?.installerPath) { return null; }
    if (version && normalizeSemver(state.version)?.version !== normalizeSemver(version)?.version) { return null; }
    if (isInstalledUpdateVersion(currentVersion, state.version)) { return null; }
    return rememberDownloadedUpdate(state) ? state : null;
}

export function cleanupSupersededPendingUpdate(latestVersion) {
    const state = readPendingUpdateInstall();
    if (!state?.version || !latestVersion) { return { checked: false }; }
    const pending = normalizeSemver(state.version);
    const latest = normalizeSemver(latestVersion);
    if (!pending || !latest || !semver.gt(latest, pending)) { return { checked: true, deleted: false }; }

    const deleted = safeDeleteFile(state.installerPath);
    if (state.installerPath) { safeDeleteEmptyDir(path.dirname(state.installerPath)); }
    clearPendingUpdateInstall();
    if (lastDownloadedUpdateVersion === state.version) {
        lastDownloadedUpdateVersion = '';
        lastDownloadedUpdateFile = '';
    }
    log.info(`Removed superseded update installer ${state.version}; latest available is ${latestVersion}.`);
    return { checked: true, deleted, version: state.version };
}


export function cleanupPendingUpdateInstall(currentVersion = app.getVersion()) {
    const statePath = getPendingUpdateInstallPath();
    if (!existsSync(statePath)) { return { checked: false }; }

    const state = readPendingUpdateInstall();
    if (!state) { return { checked: true, ok: false, error: 'invalid-state' }; }

    if (!state?.version) {
        clearPendingUpdateInstall();
        return { checked: true, ok: false, error: 'missing-version' };
    }

    if (isInstalledUpdateVersion(currentVersion, state.version)) {
        // Delete the old installer file
        const deleted = safeDeleteFile(state.installerPath);
        // Also try to delete the parent cache directory if it becomes empty after deleting the installer
        if (state.installerPath) {
            const parentDir = path.dirname(state.installerPath);
            safeDeleteEmptyDir(parentDir);
            // Also attempt to delete known electron-updater cache subdirectories (squirrel-windows, etc.)
            try {
                const grandparent = path.dirname(parentDir);
                if (grandparent && existsSync(grandparent)) {
                    const entries = require('node:fs').readdirSync(grandparent);
                    for (const entry of entries) {
                        const full = path.join(grandparent, entry);
                        try {
                            if (require('node:fs').statSync(full).isDirectory()) {
                                safeDeleteEmptyDir(full);
                            }
                        } catch { /* ignore */ }
                    }
                }
            } catch { /* ignore */ }
        }
        clearPendingUpdateInstall();
        log.info(`Update ${state.version} installed successfully; installer cleanup ${deleted ? 'completed' : 'skipped'}.`);
        return { checked: true, ok: true, deleted };
    }

    const installerStillAvailable = rememberDownloadedUpdate(state);
    if (!installerStillAvailable) { clearPendingUpdateInstall(); }
    log.warn(`Pending update ${state.version} was not installed; current version is ${currentVersion}. Keeping current app version.`);
    return {
        checked: true,
        ok: false,
        error: 'not-installed',
        installerPath: installerStillAvailable ? state.installerPath : '',
        installerKept: installerStillAvailable,
    };
}
async function revealDownloadedInstaller(installerPath) {
    if (!installerPath) { return false; }
    try {
        if (typeof shell.showItemInFolder === 'function') {
            shell.showItemInFolder(installerPath);
            return true;
        }
        if (typeof shell.openPath === 'function') {
            await shell.openPath(path.dirname(installerPath));
            return true;
        }
    } catch (err) {
        log.warn('Failed to reveal update installer: ' + (err?.message || String(err)));
    }
    return false;
}

function resolveUpdateInstallMode() {
    return getUpdateInstallMode({
        isPackaged: app.isPackaged,
        platform: process.platform,
        env: process.env,
        resourcesPath: process.resourcesPath,
    });
}

function buildUpdatePayload(base) {
    const installMode = resolveUpdateInstallMode();
    return {
        ...base,
        installMode,
        inAppInstallSupported: isInAppUpdateInstallSupported(installMode),
    };
}

/** @returns {boolean} True only when latest is strictly newer than current. */
export function isUpdateNewer(latestVersion, currentVersion) {
    if (!latestVersion || !currentVersion) { return false; }
    const latest = semver.coerce(latestVersion);
    const current = semver.coerce(currentVersion);
    if (!latest || !current) { return false; }
    return semver.gt(latest, current);
}

try {
    const updater = require('electron-updater');
    autoUpdater = updater.autoUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.allowPrerelease = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoRunAppAfterInstall = true;
    // Ensure downloaded updates are applied immediately on Windows (NSIS)
    try {
        if (autoUpdater.updateConfigPath) {
            log.info('electron-updater config path: ' + autoUpdater.updateConfigPath);
        }
    } catch { /* ignore */ }
    autoUpdater.disableDifferentialDownload = true;
    autoUpdater.disableWebInstaller = true;
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
} catch (err) {
    log.warn('electron-updater not available:', err.message);
}

function shouldOfferUpdate(info, currentVersion) {
    const latestVersion = info?.version;
    if (!isUpdateNewer(latestVersion, currentVersion)) { return false; }
    if (!isReleaseFinalized(info?.releaseNotes)) {
        log.info(`Ignoring update ${latestVersion} — release notes are not finalized yet.`);
        return false;
    }
    return true;
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
    const currentVersion = app.getVersion();
    const latestVersion = info?.version;
    const updateAvailable = shouldOfferUpdate(info, currentVersion);
    if (updateAvailable) { lastAvailableUpdateInfo = info; }
    if (updateAvailable) { cleanupSupersededPendingUpdate(latestVersion); }
    const downloadedUpdate = updateAvailable ? getPendingDownloadedUpdate(latestVersion, currentVersion) : null;

    if (latestVersion && !updateAvailable) {
        log.info(`No newer update: current=${currentVersion}, latest=${latestVersion}`);
    }

    return buildUpdatePayload({
        ok: true,
        updateAvailable,
        currentVersion,
        latestVersion: updateAvailable ? latestVersion : currentVersion,
        releaseName: normalizeReleaseName(info?.releaseName, latestVersion),
        releaseNotes: updateAvailable ? normalizeReleaseNotesEntries(info?.releaseNotes) : [],
        assetName: updateAvailable ? (info?.files?.[0]?.url || '') : '',
        downloaded: !!downloadedUpdate,
        downloadedInstallerPath: downloadedUpdate?.installerPath || '',
    });
}

export function registerUpdaterEvents(getMainWindow) {
    cleanupPendingUpdateInstall();
    if (!autoUpdater) { return; }

    autoUpdater.on('update-available', (info) => {
        const currentVersion = app.getVersion();
        if (!shouldOfferUpdate(info, currentVersion)) {
            if (isUpdateNewer(info.version, currentVersion) && !isReleaseFinalized(info?.releaseNotes)) {
                log.info(`Ignoring update ${info.version} — release is not finalized yet.`);
            } else if (!isUpdateNewer(info.version, currentVersion)) {
                log.info(`Ignoring update ${info.version} — not newer than ${currentVersion}`);
            }
            return;
        }
        cleanupSupersededPendingUpdate(info.version);
        const downloadedUpdate = getPendingDownloadedUpdate(info.version, currentVersion);
        log.info(`Update available: ${info.version}`);
        getMainWindow()?.webContents.send('release-update-available', buildUpdatePayload({
            ok: true,
            updateAvailable: true,
            currentVersion: app.getVersion(),
            latestVersion: info.version,
            releaseName: normalizeReleaseName(info.releaseName, info.version),
            releaseNotes: normalizeReleaseNotesEntries(info.releaseNotes),
            assetName: info?.files?.[0]?.url || '',
            downloaded: !!downloadedUpdate,
            downloadedInstallerPath: downloadedUpdate?.installerPath || '',
        }));
    });

    autoUpdater.on('checking-for-update', () => {
        log.info('Checking for update...');
    });

    autoUpdater.on('update-not-available', () => {
        log.info('Update not available event.');
    });

    autoUpdater.on('download-progress', (progress) => {
        lastDownloadPercent = normalizeDownloadPercent(lastDownloadPercent, progress);
        log.info(`Download progress: ${lastDownloadPercent}%`);
        getMainWindow()?.webContents.send('update-download-progress', {
            percent: lastDownloadPercent,
            bytesPerSecond: progress.bytesPerSecond,
            transferred: progress.transferred,
            total: progress.total
        });
    });

    autoUpdater.on('update-downloaded', (info) => {
        lastDownloadedUpdateFile = info?.downloadedFile || autoUpdater?.downloadedUpdateHelper?.file || '';
        lastDownloadedUpdateVersion = info?.version || '';
        log.info(`Update downloaded: ${info.version}`);
        getMainWindow()?.webContents.send('update-downloaded', {
            version: info.version,
            releaseName: normalizeReleaseName(info.releaseName, info.version),
            autoInstall: false
        });

        writePendingUpdateInstall({
            version: lastDownloadedUpdateVersion,
            installerPath: lastDownloadedUpdateFile
        });
    });

    autoUpdater.on('error', (err) => {
        // Manual checks use IPC and show their own toast; emitting here caused duplicate errors.
        log.warn(`Update error: ${err?.message || String(err)}`);
    });
}

export function registerUpdateIpc(isReadyToCloseRef, getMainWindow = () => null) {
    ipcMain.handle('set-update-channel', (event, channel) => {
        if (!autoUpdater) { return; }
        const isBeta = channel === 'beta';
        autoUpdater.allowPrerelease = isBeta;
        log.info(`Update channel set to: ${channel} (allowPrerelease=${isBeta})`);
    });

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
            lastDownloadPercent = 0;
            const installMode = resolveUpdateInstallMode();
            if (lastAvailableUpdateInfo?.version) { cleanupSupersededPendingUpdate(lastAvailableUpdateInfo.version); }
            log.info('Starting update download...');
            await autoUpdater.downloadUpdate();
            return { ok: true, installMode };
        } catch (err) {
            log.warn(`Download error: ${err?.message || String(err)}`);
            return { ok: false, error: getUpdateErrorMessage(err) };
        }
    });

    ipcMain.handle('install-update', async () => {
        if (!autoUpdater) {
            return { ok: false, error: 'update_failed' };
        }

        const installMode = resolveUpdateInstallMode();
        if (!isInAppUpdateInstallSupported(installMode)) {
            const installerPath = getDownloadedUpdateFile();
            if (installerPath) {
                await revealDownloadedInstaller(installerPath);
                return { ok: true, manual: true, installerPath };
            }
            return { ok: false, error: 'update_manual_install' };
        }

        try {
            const installerPath = getDownloadedUpdateFile();
            writePendingUpdateInstall({ version: lastDownloadedUpdateVersion, installerPath });
            log.info('Installing update and restarting...');
            isReadyToCloseRef.value = true;
            // Ensure the update file won't be deleted by safeDeleteFile until after install succeeds
            autoUpdater.quitAndInstall(true, true);
            return { ok: true };
        } catch (err) {
            log.warn(`Install error: ${err?.message || String(err)}`);
            clearPendingUpdateInstall();
            return { ok: false, error: getUpdateErrorMessage(err) };
        }
    });

    ipcMain.handle('get-update-capabilities', () => {
        const installMode = resolveUpdateInstallMode();
        return {
            installMode,
            inAppInstallSupported: isInAppUpdateInstallSupported(installMode),
        };
    });
}





