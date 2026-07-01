/**
 * TreeIDE - Main (Electron) process entry
 * Window management, IPC registration, auto-updater, and dev hot-reload.
 */

import { createRequire } from 'node:module';
import { existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import { createWindow, APP_NAME } from './window.js';
import { registerUpdaterEvents, registerUpdateIpc } from './ipc/updates.js';
import { registerProjectIpc } from './ipc/project.js';
import { registerAppIpc } from './ipc/app.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function collectReloadSourceFiles() {
    const files = new Set([__filename]);
    const roots = [
        __dirname,
        path.join(__dirname, '..', 'preload'),
        path.join(__dirname, '..', 'shared')
    ];

    const walk = (dir) => {
        if (!existsSync(dir)) { return; }
        for (const entry of readdirSync(dir)) {
            const fullPath = path.join(dir, entry);
            let stats;
            try {
                stats = statSync(fullPath);
            } catch {
                continue;
            }
            if (stats.isDirectory()) {
                walk(fullPath);
            } else if (/\.(js|mjs|cjs)$/.test(entry)) {
                files.add(fullPath);
            }
        }
    };

    roots.forEach(walk);
    return [...files];
}

function createReloadModuleObject() {
    const files = collectReloadSourceFiles();
    return {
        filename: __filename,
        children: files
            .filter((filePath) => filePath !== __filename)
            .map((filePath) => ({ filename: filePath, children: [] }))
    };
}

const APP_ID = 'com.treeide.treeide';

if (process.platform === 'win32') {
    app.setAppUserModelId(APP_ID);
}
app.setName(APP_NAME);
process.title = APP_NAME;

if (!app.isPackaged) {
    try {
        process.noDeprecation = true;
        require('electron-reloader')(createReloadModuleObject(), {
            // Renderer updates are handled by Vite HMR in dev (`npm run dev`).
            watchRenderer: false,
            debug: process.env.TREEIDE_RELOAD_DEBUG === '1',
            ignore: [
                'dist/**',
                'src/renderer/**',
                'scripts/.dev-electron/**',
                'node_modules/**',
                'tests/**'
            ]
        });
    } catch (_) {
        log.warn('electron-reloader not available (expected in production)');
    } finally {
        process.noDeprecation = false;
    }
}

let mainWindow = null;
const isReadyToCloseRef = { value: false };
const lastSaveDirectoryRef = { value: null };

function getMainWindow() {
    return mainWindow;
}

app.whenReady().then(() => {
    registerUpdaterEvents(getMainWindow);
    registerUpdateIpc(isReadyToCloseRef);
    registerProjectIpc(lastSaveDirectoryRef);
    registerAppIpc(getMainWindow, isReadyToCloseRef);
    mainWindow = createWindow({ app, isReadyToCloseRef });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createWindow({ app, isReadyToCloseRef });
    }
});