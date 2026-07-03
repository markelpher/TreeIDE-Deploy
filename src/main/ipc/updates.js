/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
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


function getPendingUpdateInstallPath() {
    return path.join(app.getPath('userData'), PENDING_UPDATE_INSTALL_FILE);
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

export function cleanupPendingUpdateInstall(currentVersion = app.getVersion()) {
    const statePath = getPendingUpdateInstallPath();
    if (!existsSync(statePath)) { return { checked: false }; }

    let state;
    try {
        state = JSON.parse(readFileSync(statePath, 'utf8'));
    } catch (err) {
        log.warn('Failed to read pending update install state: ' + (err?.message || String(err)));
        clearPendingUpdateInstall();
        return { checked: true, ok: false, error: 'invalid-state' };
    }

    if (!state?.version) {
        clearPendingUpdateInstall();
        return { checked: true, ok: false, error: 'missing-version' };
    }

    if (isInstalledUpdateVersion(currentVersion, state.version)) {
        const deleted = safeDeleteFile(state.installerPath);
        safeDeleteEmptyDir(state.installerPath ? path.dirname(state.installerPath) : '');
        clearPendingUpdateInstall();
        log.info(`Update ${state.version} installed successfully; installer cleanup ${deleted ? 'completed' : 'skipped'}.`);
        return { checked: true, ok: true, deleted };
    }

    if (!existsSync(state.installerPath || '')) {
        clearPendingUpdateInstall();
    }
    log.warn(`Pending update ${state.version} was not installed; current version is ${currentVersion}.`);
    return { checked: true, ok: false, error: 'not-installed', installerPath: state.installerPath };
}
function commandExists(command) {
    const result = spawnSync('sh', ['-c', 'command -v ' + command], { stdio: 'ignore' });
    return result.status === 0;
}

function getDownloadedUpdateFile() {
    return lastDownloadedUpdateFile || autoUpdater?.downloadedUpdateHelper?.file || '';
}

function getElevatedCommand(command, args) {
    if (typeof process.getuid === 'function' && process.getuid() === 0) {
        return { command, args };
    }
    if (commandExists('pkexec')) {
        return { command: 'pkexec', args: [command, ...args] };
    }
    if (commandExists('sudo')) {
        return { command: 'sudo', args: [command, ...args] };
    }
    throw new Error('No graphical privilege escalation command found. Install pkexec or sudo.');
}

function spawnDetached(command, args) {
    const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
    });
    child.on('error', (err) => {
        log.warn('Detached installer failed to start: ' + (err?.message || String(err)));
    });
    child.unref();
}

export function getLinuxPackageInstallCommand(installerPath, env = process.env) {
    const ext = path.extname(installerPath).toLowerCase();
    if (ext === '.snap') {
        return { command: 'snap', args: ['install', '--dangerous', '--amend', installerPath], elevated: true };
    }
    if (ext === '.deb') {
        return { command: 'apt-get', args: ['install', '-y', '--allow-downgrades', installerPath], elevated: true };
    }
    if (ext === '.appimage' && env.APPIMAGE) {
        return {
            command: 'sh',
            args: ['-c', 'sleep 1; install -m 755 "$2" "$1" && "$1" >/dev/null 2>&1 &', 'tree-ide-appimage-update', env.APPIMAGE, installerPath],
            elevated: false,
        };
    }
    if (ext === '.flatpak') {
        const args = ['install', '--reinstall', '-y', installerPath];
        if (env.FLATPAK_ID && commandExists('flatpak-spawn')) {
            return { command: 'flatpak-spawn', args: ['--host', 'flatpak', ...args], elevated: false };
        }
        return { command: 'flatpak', args, elevated: false };
    }
    return null;
}

function installLinuxDownloadedPackage(installerPath) {
    const installCommand = getLinuxPackageInstallCommand(installerPath);
    if (!installCommand) { return false; }
    if (installCommand.elevated) {
        const elevated = getElevatedCommand(installCommand.command, installCommand.args);
        spawnDetached(elevated.command, elevated.args);
    } else {
        spawnDetached(installCommand.command, installCommand.args);
    }
    return true;
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
        lastDownloadedUpdateFile = info?.downloadedFile || autoUpdater?.downloadedUpdateHelper?.file || '';
        lastDownloadedUpdateVersion = info?.version || '';
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
            const installerPath = getDownloadedUpdateFile();
            if (installerPath) {
                shell.showItemInFolder(installerPath);
                return { ok: true, manual: true };
            }
            return { ok: false, error: 'update_manual_install' };
        }

        try {
            const installerPath = getDownloadedUpdateFile();
            writePendingUpdateInstall({ version: lastDownloadedUpdateVersion, installerPath });
            if (process.platform === 'linux' && installerPath && installLinuxDownloadedPackage(installerPath)) {
                log.info(`Installing Linux update package: ${installerPath}`);
                isReadyToCloseRef.value = true;
                app.quit();
                return { ok: true };
            }

            log.info('Installing update and restarting...');
            isReadyToCloseRef.value = true;
            autoUpdater.quitAndInstall(false, true);
            return { ok: true };
        } catch (err) {
            log.warn(`Install error: ${err?.message || String(err)}`);
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

