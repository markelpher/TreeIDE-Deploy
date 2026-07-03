/**
 * TreeIDE - Auto-updater IPC and event wiring
 */

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, mkdirSync } from 'node:fs';
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
const GITHUB_REPO = 'TreeIDE-Deploy';

let lastAvailableUpdateInfo = null;


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

function readPackagedLinuxPackageType(resourcesPath = process.resourcesPath) {
    if (!resourcesPath) { return ''; }
    try {
        const pkgTypePath = path.join(resourcesPath, 'package-type');
        if (existsSync(pkgTypePath)) {
            return readFileSync(pkgTypePath, 'utf8').trim().toLowerCase();
        }
    } catch {
        // fall through
    }
    return '';
}

export function getCurrentLinuxSystemPackageKind(env = process.env, resourcesPath = process.resourcesPath) {
    if (env.SNAP) { return 'snap'; }
    if (env.FLATPAK_ID) { return 'flatpak'; }

    const packageType = readPackagedLinuxPackageType(resourcesPath);
    if (packageType === 'deb') { return 'deb'; }
    if (packageType === 'rpm') { return 'rpm'; }

    if (process.platform === 'linux') {
        if (commandExists('dpkg-query')) { return 'deb'; }
        if (commandExists('rpm')) { return 'rpm'; }
    }
    return '';
}
export function getLinuxReleaseArch(arch = process.arch) {
    if (arch === 'x64') { return 'x64'; }
    if (arch === 'arm64') { return 'arm64'; }
    return arch;
}

export function selectLinuxPackageAsset(assets = [], packageKind = '', version = '', arch = process.arch) {
    const releaseArch = getLinuxReleaseArch(arch).toLowerCase();
    const normalizedVersion = String(version || '').replace(/^v/i, '').toLowerCase();
    const normalizedKind = String(packageKind || '').toLowerCase();
    const extension = normalizedKind === 'tar.gz' ? '.tar.gz' : `.${normalizedKind}`;
    if (!normalizedKind) { return null; }

    return assets.find((asset) => {
        const name = String(asset?.name || '').toLowerCase();
        return name.endsWith(extension)
            && name.includes(releaseArch)
            && (!normalizedVersion || name.includes(normalizedVersion));
    }) || assets.find((asset) => {
        const name = String(asset?.name || '').toLowerCase();
        return name.endsWith(extension) && name.includes(releaseArch);
    }) || null;
}
function requestJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'TreeIDE-Updater',
            },
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                requestJson(res.headers.location).then(resolve, reject);
                return;
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                res.resume();
                reject(new Error(`GitHub request failed with HTTP ${res.statusCode}`));
                return;
            }
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', reject);
    });
}

function downloadFile(url, destination, onProgress) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, { headers: { 'User-Agent': 'TreeIDE-Updater' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                downloadFile(res.headers.location, destination, onProgress).then(resolve, reject);
                return;
            }
            if (res.statusCode < 200 || res.statusCode >= 300) {
                res.resume();
                reject(new Error(`Download failed with HTTP ${res.statusCode}`));
                return;
            }

            const total = Number(res.headers['content-length']) || 0;
            let transferred = 0;
            const file = createWriteStream(destination);
            res.on('data', (chunk) => {
                transferred += chunk.length;
                onProgress?.({ transferred, total, percent: total ? (transferred / total) * 100 : 0 });
            });
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', reject);
            res.on('error', reject);
        });
        req.on('error', reject);
    });
}

async function downloadGitHubReleaseAsset({ updateInfo, getMainWindow, packageKind, cacheDirName, missingAssetMessage }) {
    const version = updateInfo?.version || lastAvailableUpdateInfo?.version;
    if (!version) { throw new Error('Missing update version.'); }

    const releaseUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/v${String(version).replace(/^v/i, '')}`;
    const release = await requestJson(releaseUrl);
    const asset = selectLinuxPackageAsset(release?.assets || [], packageKind, version, process.arch);
    if (!asset?.browser_download_url || !asset?.name) {
        throw new Error(missingAssetMessage || `No ${packageKind} update asset found.`);
    }

    const updatesDir = path.join(app.getPath('userData'), cacheDirName);
    mkdirSync(updatesDir, { recursive: true });
    const destination = path.join(updatesDir, asset.name);
    await downloadFile(asset.browser_download_url, destination, (progress) => {
        lastDownloadPercent = normalizeDownloadPercent(lastDownloadPercent, progress);
        getMainWindow()?.webContents.send('update-download-progress', {
            ...progress,
            percent: lastDownloadPercent,
        });
    });

    lastDownloadedUpdateFile = destination;
    lastDownloadedUpdateVersion = String(version).replace(/^v/i, '');
    getMainWindow()?.webContents.send('update-downloaded', {
        version: lastDownloadedUpdateVersion,
        releaseName: normalizeReleaseName(updateInfo?.releaseName || release?.name, lastDownloadedUpdateVersion),
    });
    return destination;
}

async function downloadSystemPackageUpdate(updateInfo, getMainWindow) {
    const packageKind = getCurrentLinuxSystemPackageKind();
    if (!packageKind) { throw new Error('Unable to detect Linux package type for update.'); }
    return downloadGitHubReleaseAsset({
        updateInfo,
        getMainWindow,
        packageKind,
        cacheDirName: 'system-updates',
        missingAssetMessage: `No ${packageKind} update asset found.`,
    });
}
async function downloadLauncherUpdate(updateInfo, getMainWindow) {
    return downloadGitHubReleaseAsset({
        updateInfo,
        getMainWindow,
        packageKind: 'tar.gz',
        cacheDirName: 'launcher-updates',
        missingAssetMessage: 'No launcher tar.gz update asset found.',
    });
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

export function getLinuxPackageKind(installerPath) {
    const lowerPath = String(installerPath || '').toLowerCase();
    if (lowerPath.endsWith('.tar.gz') || lowerPath.endsWith('.tgz')) { return 'tar.gz'; }
    const ext = path.extname(lowerPath);
    return ext.startsWith('.') ? ext.slice(1) : ext;
}

export function getLinuxPackageInstallCommand(installerPath, env = process.env, version = '') {
    const ext = getLinuxPackageKind(installerPath);
    if (ext === 'snap') {
        return { command: 'snap', args: ['install', '--dangerous', '--amend', installerPath], elevated: true };
    }
    if (ext === 'deb') {
        return { command: 'apt-get', args: ['install', '-y', '--allow-downgrades', installerPath], elevated: true };
    }
    if (ext === 'rpm') {
        return { command: 'rpm', args: ['-Uvh', '--replacepkgs', installerPath], elevated: true };
    }
    if (ext === 'tar.gz' && env.TREEIDE_LAUNCHER === '1' && env.TREEIDE_LAUNCHER_BIN && version) {
        return {
            command: 'sh',
            args: [env.TREEIDE_LAUNCHER_BIN, '--install-update', installerPath, version],
            elevated: false,
        };
    }
    if (ext === 'appimage' && env.APPIMAGE) {
        return {
            command: 'sh',
            args: ['-c', 'sleep 1; install -m 755 "$2" "$1" && "$1" >/dev/null 2>&1 &', 'tree-ide-appimage-update', env.APPIMAGE, installerPath],
            elevated: false,
        };
    }
    if (ext === 'flatpak') {
        const args = ['install', '--reinstall', '-y', installerPath];
        if (env.FLATPAK_ID && commandExists('flatpak-spawn')) {
            return { command: 'flatpak-spawn', args: ['--host', 'flatpak', ...args], elevated: false };
        }
        return { command: 'flatpak', args, elevated: false };
    }
    return null;
}

function installLinuxDownloadedPackage(installerPath, version = '') {
    const installCommand = getLinuxPackageInstallCommand(installerPath, process.env, version);
    if (!installCommand) { return false; }
    if (installCommand.elevated) {
        const elevated = getElevatedCommand(installCommand.command, installCommand.args);
        spawnDetached(elevated.command, elevated.args);
    } else {
        spawnDetached(installCommand.command, installCommand.args);
    }
    return true;
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
            log.info('Starting update download...');
            if (installMode === 'launcher') {
                await downloadLauncherUpdate(lastAvailableUpdateInfo, getMainWindow);
                return { ok: true, installMode };
            }
            if (installMode === 'system') {
                await downloadSystemPackageUpdate(lastAvailableUpdateInfo, getMainWindow);
                return { ok: true, installMode };
            }
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
            if (process.platform === 'linux' && installerPath && installLinuxDownloadedPackage(installerPath, lastDownloadedUpdateVersion)) {
                log.info(`Installing Linux update package: ${installerPath}`);
                if (installMode === 'system') {
                    return { ok: true, system: true };
                }
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

