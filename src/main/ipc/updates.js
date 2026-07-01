/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
import { ipcMain, app } from 'electron';
import log from 'electron-log';
import {
    getUpdateErrorMessage,
    normalizeReleaseName,
} from '../../shared/updateErrors.js';

const require = createRequire(import.meta.url);
const semver = require('semver');

let autoUpdater = null;

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
    autoUpdater.logger = log;
    autoUpdater.logger.transports.file.level = 'info';
} catch (err) {
    log.warn('electron-updater not available:', err.message);
}

function serializeReleaseNotes(value) {
    if (!value) { return []; }
    if (typeof value === 'string') { return [{ locale: 'en', notes: value }]; }
    if (Array.isArray(value)) {
        return value
            .map((entry) => {
                if (typeof entry === 'string') { return { locale: 'en', notes: entry }; }
                if (entry && typeof entry === 'object') {
                    const locale = entry.locale || 'en';
                    const notes = entry.notes ?? entry.note ?? '';
                    return { locale, notes };
                }
                return null;
            })
            .filter((entry) => entry && entry.notes);
    }
    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([locale, entry]) => ({
                locale,
                notes: typeof entry === 'string' ? entry : (entry?.notes ?? entry?.note ?? '')
            }))
            .filter((entry) => entry.notes);
    }
    return [];
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
    const updateAvailable = isUpdateNewer(latestVersion, currentVersion);

    if (latestVersion && !updateAvailable) {
        log.info(`No newer update: current=${currentVersion}, latest=${latestVersion}`);
    }

    return {
        ok: true,
        updateAvailable,
        currentVersion,
        latestVersion: updateAvailable ? latestVersion : currentVersion,
        releaseName: normalizeReleaseName(info?.releaseName, latestVersion),
        releaseNotes: serializeReleaseNotes(info?.releaseNotes),
        assetName: info?.files?.[0]?.url || ''
    };
}

export function registerUpdaterEvents(getMainWindow) {
    if (!autoUpdater) { return; }

    autoUpdater.on('update-available', (info) => {
        const currentVersion = app.getVersion();
        if (!isUpdateNewer(info.version, currentVersion)) {
            log.info(`Ignoring update ${info.version} — not newer than ${currentVersion}`);
            return;
        }
        log.info(`Update available: ${info.version}`);
        getMainWindow()?.webContents.send('release-update-available', {
            ok: true,
            updateAvailable: true,
            currentVersion: app.getVersion(),
            latestVersion: info.version,
            releaseName: normalizeReleaseName(info.releaseName, info.version),
            releaseNotes: serializeReleaseNotes(info.releaseNotes),
            assetName: info?.files?.[0]?.url || ''
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
        getMainWindow()?.webContents.send('update-download-progress', {
            percent: Math.round(progress.percent),
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
        isReadyToCloseRef.value = true;
        autoUpdater.quitAndInstall(true, true);
        return { ok: true };
    });
}

export { checkReleaseUpdate };