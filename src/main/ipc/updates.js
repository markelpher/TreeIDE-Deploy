/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
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
    });
}

export function registerUpdaterEvents(getMainWindow) {
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
        log.info(`Update available: ${info.version}`);
        getMainWindow()?.webContents.send('release-update-available', buildUpdatePayload({
            ok: true,
            updateAvailable: true,
            currentVersion: app.getVersion(),
            latestVersion: info.version,
            releaseName: normalizeReleaseName(info.releaseName, info.version),
            releaseNotes: normalizeReleaseNotesEntries(info.releaseNotes),
            assetName: info?.files?.[0]?.url || '',
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
        log.info(`Update downloaded: ${info.version}`);
        getMainWindow()?.webContents.send('update-downloaded', {
            version: info.version,
            releaseName: normalizeReleaseName(info.releaseName, info.version)
        });
    });

    autoUpdater.on('error', (err) => {
        // Manual checks use IPC and show their own toast; emitting here caused duplicate errors.
        log.warn(`Update error: ${err?.message || String(err)}`);
    });
}

export function registerUpdateIpc(isReadyToCloseRef) {
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
            log.info('Starting update download...');
            await autoUpdater.downloadUpdate();
            return { ok: true, installMode: resolveUpdateInstallMode() };
        } catch (err) {
            log.warn(`Download error: ${err?.message || String(err)}`);
            return { ok: false, error: getUpdateErrorMessage(err) };
        }
    });

    ipcMain.handle('install-update', () => {
        if (!autoUpdater) {
            return { ok: false, error: 'update_failed' };
        }

        const installMode = resolveUpdateInstallMode();
        if (!isInAppUpdateInstallSupported(installMode)) {
            const installerPath = autoUpdater.downloadedUpdateHelper?.file;
            if (installerPath) {
                shell.showItemInFolder(installerPath);
                return { ok: true, manual: true };
            }
            return { ok: false, error: 'update_manual_install' };
        }

        log.info('Installing update and restarting...');
        isReadyToCloseRef.value = true;
        autoUpdater.quitAndInstall(false, true);
        return { ok: true };
    });

    ipcMain.handle('get-update-capabilities', () => {
        const installMode = resolveUpdateInstallMode();
        return {
            installMode,
            inAppInstallSupported: isInAppUpdateInstallSupported(installMode),
        };
    });
}

