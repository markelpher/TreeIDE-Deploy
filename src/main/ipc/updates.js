/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
import https from 'node:https';
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
    normalizeReleaseNotesEntries,
} from '../../shared/releaseFinalize.js';

const require = createRequire(import.meta.url);
const semver = require('semver');

let autoUpdater = null;
let lastDownloadPercent = 0;
let lastDownloadedUpdateFile = '';
let lastDownloadedUpdateVersion = '';
const PENDING_UPDATE_INSTALL_FILE = 'pending-update-install.json';

let lastAvailableUpdateInfo = null;
let selectedUpdateChannel = 'stable';
let activeUpdateCheck = null;
let activeUpdateCheckChannel = null;
const UPDATE_CHECK_RETRY_DELAYS_MS = [500, 1500];
const UPDATE_CHECK_HEADERS = {
    'Cache-Control': 'no-cache, no-store, max-age=0',
    Pragma: 'no-cache',
};
const UPDATE_REPOSITORY = { owner: 'markelpher', repo: 'treeide-deploy' };
const UPDATE_RELEASES_API = `https://api.github.com/repos/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases?per_page=20`;


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
    const raw = String(value || '').trim().replace(/^v/i, '');
    return semver.parse(raw) || semver.coerce(raw);
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
    const latest = normalizeSemver(latestVersion);
    const current = normalizeSemver(currentVersion);
    if (!latest || !current) { return false; }
    return semver.gt(latest, current);
}

export function getUpdateCheckStatus(info, currentVersion) {
    const latestVersion = info?.version;
    if (!latestVersion) {
        return { ok: false, error: 'update_metadata_missing' };
    }
    const updateAvailable = isUpdateNewer(latestVersion, currentVersion);
    return {
        ok: true,
        updateAvailable,
        currentVersion,
        latestVersion,
    };
}

export function normalizeUpdateChannel(channel) {
    return channel === 'beta' ? 'beta' : 'stable';
}

export function configureUpdateChannel(updater, channel, currentVersion = app.getVersion()) {
    const normalizedChannel = normalizeUpdateChannel(channel);
    if (!updater) { return normalizedChannel; }

    const isBeta = normalizedChannel === 'beta';
    updater.allowPrerelease = isBeta;
    updater.channel = isBeta ? 'beta' : 'latest';
    updater.allowDowngrade = !isBeta && Boolean(semver.prerelease(currentVersion));
    updater.requestHeaders = {
        ...(updater.requestHeaders || {}),
        ...UPDATE_CHECK_HEADERS,
    };
    return normalizedChannel;
}

export function isRetryableUpdateError(errorKey) {
    return [
        'update_metadata_missing',
        'update_repo_inaccessible',
        'update_network_error',
    ].includes(errorKey);
}

export function selectLatestUpdateRelease(releases, channel = 'stable') {
    const normalizedChannel = normalizeUpdateChannel(channel);
    return (Array.isArray(releases) ? releases : [])
        .filter((release) => release && !release.draft)
        .filter((release) => normalizedChannel === 'beta' || !release.prerelease)
        .map((release) => {
            const version = normalizeSemver(release.tag_name || release.name);
            if (!version) { return null; }
            const metadataChannel = release.prerelease ? 'beta' : 'latest';
            const metadataName = `${metadataChannel}.yml`;
            const hasMetadata = Array.isArray(release.assets)
                && release.assets.some((asset) => asset?.name === metadataName);
            if (!hasMetadata) { return null; }
            return {
                version: version.version,
                tag: release.tag_name || `v${version.version}`,
                metadataChannel,
            };
        })
        .filter(Boolean)
        .sort((left, right) => semver.rcompare(left.version, right.version))[0] || null;
}

function requestJson(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, {
            headers: {
                'User-Agent': 'TreeIDE-Updater',
                Accept: 'application/vnd.github+json',
                ...UPDATE_CHECK_HEADERS,
            },
        }, (response) => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', (chunk) => {
                body += chunk;
                if (body.length > 2 * 1024 * 1024) {
                    request.destroy(new Error('GitHub update response is too large'));
                }
            });
            response.on('end', () => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    reject(new Error(`GitHub releases request failed with HTTP ${response.statusCode}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    reject(new Error(`Invalid GitHub releases response: ${err?.message || String(err)}`));
                }
            });
        });
        request.setTimeout(10000, () => request.destroy(new Error('GitHub releases request timed out')));
        request.on('error', reject);
    });
}

function configureGitHubUpdateProvider(updater) {
    if (typeof updater?.setFeedURL !== 'function') { return; }
    updater.setFeedURL({
        provider: 'github',
        owner: UPDATE_REPOSITORY.owner,
        repo: UPDATE_REPOSITORY.repo,
    });
}

async function checkGitHubReleaseFallback(currentVersion, channel) {
    const releases = await requestJson(`${UPDATE_RELEASES_API}&cacheBust=${Date.now()}`);
    const release = selectLatestUpdateRelease(releases, channel);
    if (!release || !isUpdateNewer(release.version, currentVersion)) { return null; }

    log.info(`GitHub API found newer ${channel} release ${release.version}; bypassing stale latest-release metadata.`);
    autoUpdater.allowPrerelease = normalizeUpdateChannel(channel) === 'beta';
    autoUpdater.channel = release.metadataChannel;
    autoUpdater.setFeedURL({
        provider: 'generic',
        url: `https://github.com/${UPDATE_REPOSITORY.owner}/${UPDATE_REPOSITORY.repo}/releases/download/${encodeURIComponent(release.tag)}`,
        channel: release.metadataChannel,
    });
    return autoUpdater.checkForUpdates();
}

function waitForUpdateRetry(delayMs) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

try {
    const updater = require('electron-updater');
    autoUpdater = updater.autoUpdater;
    autoUpdater.autoDownload = false;
    autoUpdater.allowPrerelease = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.autoRunAppAfterInstall = true;
    configureUpdateChannel(autoUpdater, selectedUpdateChannel);
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

async function checkReleaseUpdateOnce() {
    if (!autoUpdater) {
        return { ok: false, error: 'update_unavailable' };
    }
    if (!app.isPackaged) {
        log.info('Skipping update check because the app is not packaged.');
        return { ok: false, error: 'update_unavailable' };
    }

    configureGitHubUpdateProvider(autoUpdater);
    configureUpdateChannel(autoUpdater, selectedUpdateChannel);
    log.info(`Checking for updates on ${selectedUpdateChannel} channel.`);
    let result = await autoUpdater.checkForUpdates();
    const info = result?.updateInfo;
    const currentVersion = app.getVersion();
    let status = getUpdateCheckStatus(info, currentVersion);
    if (status.ok && !status.updateAvailable) {
        const fallbackResult = await checkGitHubReleaseFallback(currentVersion, selectedUpdateChannel);
        if (fallbackResult?.updateInfo) {
            result = fallbackResult;
            status = getUpdateCheckStatus(result.updateInfo, currentVersion);
        }
    }
    const resolvedInfo = result?.updateInfo;
    if (!status.ok) {
        log.warn('Update provider returned no version information.');
        return status;
    }

    const { latestVersion, updateAvailable } = status;
    if (updateAvailable) { lastAvailableUpdateInfo = resolvedInfo; }
    if (updateAvailable) { cleanupSupersededPendingUpdate(latestVersion); }
    const downloadedUpdate = updateAvailable ? getPendingDownloadedUpdate(latestVersion, currentVersion) : null;

    if (!updateAvailable) {
        log.info(`No newer update: current=${currentVersion}, latest=${latestVersion}`);
    }

    return buildUpdatePayload({
        ...status,
        releaseName: normalizeReleaseName(resolvedInfo?.releaseName, latestVersion),
        releaseNotes: updateAvailable ? normalizeReleaseNotesEntries(resolvedInfo?.releaseNotes) : [],
        assetName: updateAvailable ? (resolvedInfo?.files?.[0]?.url || '') : '',
        downloaded: !!downloadedUpdate,
        downloadedInstallerPath: downloadedUpdate?.installerPath || '',
    });
}

async function checkReleaseUpdateWithRetry() {
    let lastResult = null;
    let lastError = null;

    for (let attempt = 0; attempt <= UPDATE_CHECK_RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            lastResult = await checkReleaseUpdateOnce();
            lastError = null;
            if (lastResult?.updateAvailable) { return lastResult; }
            if (lastResult?.ok === false && !isRetryableUpdateError(lastResult?.error)) { return lastResult; }
            if (attempt >= 1 || attempt === UPDATE_CHECK_RETRY_DELAYS_MS.length) { return lastResult; }
        } catch (err) {
            lastError = err;
            const errorKey = getUpdateErrorMessage(err);
            if (!isRetryableUpdateError(errorKey) || attempt === UPDATE_CHECK_RETRY_DELAYS_MS.length) {
                throw err;
            }
            log.warn(`Update check attempt ${attempt + 1} failed with ${errorKey}; retrying.`);
        }

        const delayMs = UPDATE_CHECK_RETRY_DELAYS_MS[attempt];
        if (delayMs) { await waitForUpdateRetry(delayMs); }
    }

    if (lastError) { throw lastError; }
    return lastResult || { ok: false, error: 'update_unavailable' };
}

async function checkReleaseUpdate(channel) {
    const requestedChannel = normalizeUpdateChannel(channel || selectedUpdateChannel);
    if (activeUpdateCheck) {
        if (activeUpdateCheckChannel === requestedChannel) { return activeUpdateCheck; }
        try {
            await activeUpdateCheck;
        } catch {
            // A check for the previous channel failed; continue with the requested channel.
        }
    }

    selectedUpdateChannel = configureUpdateChannel(autoUpdater, requestedChannel);
    activeUpdateCheckChannel = requestedChannel;
    activeUpdateCheck = checkReleaseUpdateWithRetry();
    try {
        return await activeUpdateCheck;
    } finally {
        activeUpdateCheck = null;
        activeUpdateCheckChannel = null;
    }
}

export function registerUpdaterEvents(getMainWindow) {
    cleanupPendingUpdateInstall();
    if (!autoUpdater) { return; }

    autoUpdater.on('update-available', (info) => {
        const currentVersion = app.getVersion();
        const status = getUpdateCheckStatus(info, currentVersion);
        if (!status.ok) {
            log.info(`Ignoring update ${info?.version || 'unknown'} — update metadata is incomplete.`);
            return;
        }
        if (!status.updateAvailable) {
            log.info(`Ignoring update ${info?.version || 'unknown'} — not newer than ${currentVersion}`);
            return;
        }
        cleanupSupersededPendingUpdate(info.version);
        lastAvailableUpdateInfo = info;
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
        selectedUpdateChannel = configureUpdateChannel(autoUpdater, channel);
        log.info(`Update channel set to: ${selectedUpdateChannel}`);
        return { ok: Boolean(autoUpdater), channel: selectedUpdateChannel };
    });

    ipcMain.handle('check-release-update', async (event, channel) => {
        try {
            return await checkReleaseUpdate(channel);
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





