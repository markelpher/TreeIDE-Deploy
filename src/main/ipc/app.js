/**
 * TreeIDE - App IPC: window controls, app info, external links
 */

import fs from 'node:fs';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ipcMain, app, dialog, shell } from 'electron';
import log from 'electron-log';
import {
    buildDiagnosticReport,
    extractCurrentSessionLog,
    formatCurrentSessionLog,
    readFileTail,
    sanitizeDiagnosticText,
} from '../diagnostics.js';

const REPO_FULL_NAME = 'markelpher/treeide-deploy';
const require = createRequire(import.meta.url);
const AdmZip = require('adm-zip');
const MAX_LOG_BYTES = 256 * 1024;
const MAX_LOG_SCAN_BYTES = 2 * 1024 * 1024;
const FALLBACK_REPOSITORY_LABELS = [
    { name: 'bug', color: 'd73a4a', description: "Something isn't working" },
    { name: 'documentation', color: '0075ca', description: 'Improvements or additions to documentation' },
    { name: 'duplicate', color: 'cfd3d7', description: 'This issue or pull request already exists' },
    { name: 'enhancement', color: 'a2eeef', description: 'New feature or request' },
    { name: 'good first issue', color: '7057ff', description: 'Good for newcomers' },
    { name: 'help wanted', color: '008672', description: 'Extra attention is needed' },
    { name: 'invalid', color: 'e4e669', description: "This doesn't seem right" },
    { name: 'question', color: 'd876e3', description: 'Further information is requested' },
    { name: 'wontfix', color: 'ffffff', description: 'This will not be worked on' },
];

function isMainWindowSender(event, win) {
    return Boolean(win && !win.isDestroyed?.() && event?.sender === win.webContents);
}

function registerWindowIpc(getMainWindow, isReadyToCloseRef) {
    ipcMain.on('window-minimize', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        win.minimize();
    });

    ipcMain.on('window-maximize', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });

    ipcMain.handle('is-window-maximized', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return false; }
        return win.isMaximized();
    });

    ipcMain.on('window-close', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        win.close();
    });

    ipcMain.on('window-reload', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        win.webContents.reload();
    });

    ipcMain.on('window-dev-tools', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win) || app.isPackaged) { return; }
        win.webContents.toggleDevTools();
    });

    ipcMain.on('cancel-close', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        isReadyToCloseRef.cancelPendingClose?.();
    });

    ipcMain.on('force-close', (event) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return; }
        isReadyToCloseRef.value = true;
        win.close();
    });
}

async function openHttpUrl(url) {
    if (typeof url !== 'string' || !url) { return; }
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        await shell.openExternal(parsedUrl.toString());
    }
}

function registerAppInfoHandlers(getMainWindow) {
    ipcMain.handle('get-app-info', () => ({
        version: app.getVersion(),
        isPackaged: app.isPackaged
    }));

    ipcMain.handle('get-current-release-info', async () => {
        const version = app.getVersion();
        try {
            const data = await new Promise((resolve, reject) => {
                const req = https.get(`https://api.github.com/repos/${REPO_FULL_NAME}/releases/tags/v${version}`, {
                    headers: { 'User-Agent': 'TreeIDE', Accept: 'application/vnd.github+json' },
                    timeout: 10000
                }, (res) => {
                    let body = '';
                    res.on('data', chunk => body += chunk);
                    res.on('end', () => {
                        if (res.statusCode === 200) { resolve(body); }
                        else { reject(new Error(`HTTP ${res.statusCode}`)); }
                    });
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
            });
            const json = JSON.parse(data);
            return { version, releaseDate: json.published_at || null, releaseName: json.name || null };
        } catch {
            return { version, releaseDate: null, releaseName: null };
        }
    });

    ipcMain.handle('save-error-log', async (event, content) => {
        try {
            const logDir = path.join(app.getPath('userData'), 'logs');
            if (!fs.existsSync(logDir)) { fs.mkdirSync(logDir, { recursive: true }); }
            const logPath = path.join(logDir, `crash-${Date.now()}.log`);
            fs.writeFileSync(logPath, content, 'utf-8');
            return { ok: true };
        } catch (err) {
            log.error('Failed to save error log:', err);
            return { ok: false };
        }
    });

    ipcMain.handle('get-repository-labels', async (event) => {
        if (!isMainWindowSender(event, getMainWindow())) { return FALLBACK_REPOSITORY_LABELS; }
        try {
            const data = await new Promise((resolve, reject) => {
                const req = https.get(`https://api.github.com/repos/${REPO_FULL_NAME}/labels?per_page=100`, {
                    headers: { 'User-Agent': 'TreeIDE', Accept: 'application/vnd.github+json' },
                    timeout: 8000,
                }, (res) => {
                    let body = '';
                    res.on('data', (chunk) => { body += chunk; });
                    res.on('end', () => res.statusCode === 200 ? resolve(body) : reject(new Error(`HTTP ${res.statusCode}`)));
                });
                req.on('error', reject);
                req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
            });
            const labels = JSON.parse(data);
            if (!Array.isArray(labels)) { return FALLBACK_REPOSITORY_LABELS; }
            return labels.slice(0, 100).map((label) => ({
                name: String(label?.name || '').slice(0, 50),
                color: /^[0-9a-f]{6}$/i.test(label?.color) ? label.color : '808080',
                description: String(label?.description || '').slice(0, 200),
            })).filter((label) => label.name);
        } catch {
            return FALLBACK_REPOSITORY_LABELS;
        }
    });

    ipcMain.handle('create-diagnostic-report', async (event, options = {}) => {
        const win = getMainWindow();
        if (!isMainWindowSender(event, win)) { return { error: 'invalid-sender' }; }

        const saveResult = await dialog.showSaveDialog(win, {
            title: 'Save Tree IDE diagnostic report',
            defaultPath: `Tree-IDE-Diagnostics-${app.getVersion()}-${Date.now()}.zip`,
            filters: [{ name: 'ZIP archive', extensions: ['zip'] }],
        });
        if (saveResult.canceled || !saveResult.filePath) { return { canceled: true }; }

        try {
            const privatePaths = [
                os.homedir(),
                app.getPath('userData'),
                app.getPath('temp'),
                app.getAppPath?.(),
                process.cwd(),
            ].filter(Boolean);
            const includeLog = options.includeLog !== false;
            const includeScreenshot = options.includeScreenshot === true;
            const report = buildDiagnosticReport({
                appVersion: app.getVersion(),
                isPackaged: app.isPackaged,
                versions: process.versions,
                system: {
                    platform: os.platform(),
                    release: os.release(),
                    arch: os.arch(),
                    locale: Intl.DateTimeFormat().resolvedOptions().locale,
                    cpuCount: os.cpus()?.length || 0,
                    memoryGiB: Math.round(os.totalmem() / (1024 ** 3)),
                },
                renderer: {
                    ...(options.context || {}),
                    errors: includeLog ? options.context?.errors : [],
                },
                description: options.description,
                issueDetails: options.issueDetails,
                includesLog: includeLog,
                includesScreenshot: includeScreenshot,
                privatePaths,
            });

            const zip = new AdmZip();
            zip.addFile('diagnostics.json', Buffer.from(JSON.stringify(report, null, 2), 'utf8'));

            if (includeLog) {
                try {
                    const logPath = log.transports.file.getFile().path;
                    const scanned = readFileTail(logPath, MAX_LOG_SCAN_BYTES).toString('utf8');
                    const currentSession = extractCurrentSessionLog(scanned);
                    const sanitized = sanitizeDiagnosticText(currentSession, privatePaths);
                    const limited = Buffer.from(sanitized, 'utf8')
                        .subarray(Math.max(0, Buffer.byteLength(sanitized, 'utf8') - MAX_LOG_BYTES))
                        .toString('utf8');
                    const formatted = formatCurrentSessionLog({
                        mainLog: limited,
                        rendererErrors: report.session.rendererErrors,
                        generatedAt: report.generatedAt,
                        locale: report.session.language,
                    });
                    zip.addFile('current-session.log', Buffer.from(formatted, 'utf8'));
                } catch (err) {
                    const unavailable = sanitizeDiagnosticText(
                        `Log unavailable: ${err?.message || String(err)}`,
                        privatePaths,
                    );
                    const formatted = formatCurrentSessionLog({
                        mainLog: unavailable,
                        rendererErrors: report.session.rendererErrors,
                        generatedAt: report.generatedAt,
                        locale: report.session.language,
                    });
                    zip.addFile('current-session.log', Buffer.from(formatted, 'utf8'));
                }
            }

            if (includeScreenshot && typeof win.capturePage === 'function') {
                const image = await win.capturePage();
                if (image && !image.isEmpty?.()) {
                    zip.addFile('app-window.png', image.toPNG());
                }
            }

            zip.writeZip(saveResult.filePath);
            log.info('Diagnostic report saved locally.');
            return { ok: true, filePath: saveResult.filePath };
        } catch (err) {
            log.error('Failed to create diagnostic report:', err);
            return { error: 'diagnostic-report-failed' };
        }
    });

    ipcMain.on('open-external', async (event, url) => {
        if (!isMainWindowSender(event, getMainWindow())) { return; }
        try {
            await openHttpUrl(url);
        } catch {
            // Ignore invalid URLs from the renderer.
        }
    });
}

export function registerAppIpc(getMainWindow, isReadyToCloseRef) {
    registerWindowIpc(getMainWindow, isReadyToCloseRef);
    registerAppInfoHandlers(getMainWindow);
}
