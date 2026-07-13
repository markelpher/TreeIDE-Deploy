/**
 * TreeIDE - App IPC: window controls, app info, external links
 */

import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';
import { ipcMain, app, shell } from 'electron';
import log from 'electron-log';

const REPO_FULL_NAME = 'markelpher/treeide-deploy';

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
