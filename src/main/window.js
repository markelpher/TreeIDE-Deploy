/**
 * TreeIDE - Browser window creation and lifecycle
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BrowserWindow, nativeImage } from 'electron';
import log from 'electron-log';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const APP_NAME = 'Tree IDE';

function getAppIconPath() {
    const assetsDir = path.join(__dirname, '..', '..', 'assets');
    if (process.platform === 'win32') {
        return path.join(assetsDir, 'icon-no-bg.ico');
    }
    return path.join(assetsDir, 'icon-no-bg.png');
}

function getWindowIcon() {
    const iconPath = getAppIconPath();
    try {
        const image = nativeImage.createFromPath(iconPath);
        if (!image.isEmpty()) { return image; }
    } catch (err) {
        log.warn('Failed to load app icon:', err?.message || err);
    }
    return iconPath;
}

function lockWindowTitle(win) {
    if (!win) { return; }
    win.setTitle(APP_NAME);
    win.on('page-title-updated', (event) => {
        event.preventDefault();
        win.setTitle(APP_NAME);
    });
}

function createWindow({ app, isReadyToCloseRef }) {
    const iconPath = getAppIconPath();
    const windowIcon = getWindowIcon();
    let closeFallbackTimer = null;
    let closeRequestPending = false;

    if (process.platform === 'linux') {
        app.commandLine.appendSwitch('icon', iconPath);
    }

    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 860,
        minHeight: 560,
        show: false,
        frame: false,
        title: APP_NAME,
        icon: windowIcon,
        backgroundColor: '#1a1a1a',
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, '..', 'preload', 'index.mjs'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: true,
            allowRunningInsecureContent: false,
            navigateOnDragDrop: false,
            devTools: !app.isPackaged || process.env.TREEIDE_ENABLE_DEVTOOLS === '1'
        }
    });
    mainWindow.setMenu(null);
    lockWindowTitle(mainWindow);

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        log.warn('Blocked renderer window.open:', url);
        return { action: 'deny' };
    });

    mainWindow.webContents.on('will-navigate', (event, url) => {
        const currentUrl = mainWindow.webContents.getURL();
        if (url !== currentUrl) {
            event.preventDefault();
            log.warn('Blocked renderer navigation:', url);
        }
    });

    const devServer = process.env.TREEIDE_DEV_SERVER;
    if (devServer) {
        mainWindow.loadURL(devServer);
    } else {
        mainWindow.loadFile(path.join(__dirname, '..', '..', 'dist', 'renderer', 'index.html'));
    }

    const updateWindowState = () => {
        mainWindow.webContents.send('window-state-changed', mainWindow.isMaximized());
    };

    mainWindow.on('maximize', updateWindowState);
    mainWindow.on('unmaximize', updateWindowState);

    let resizeStateTimer = null;
    mainWindow.on('resize', () => {
        clearTimeout(resizeStateTimer);
        resizeStateTimer = setTimeout(updateWindowState, 50);
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.maximize();
        updateWindowState();
    });

    mainWindow.webContents.once('did-finish-load', () => {
        updateWindowState();
    });

    isReadyToCloseRef.cancelPendingClose = () => {
        closeRequestPending = false;
        clearTimeout(closeFallbackTimer);
        closeFallbackTimer = null;
    };

    mainWindow.on('close', (e) => {
        if (!isReadyToCloseRef.value) {
            e.preventDefault();
            if (closeRequestPending) { return; }
            closeRequestPending = true;
            mainWindow.webContents.send('attempt-close');
            closeFallbackTimer = setTimeout(() => {
                if (isReadyToCloseRef.value || mainWindow.isDestroyed()) { return; }
                log.warn('Renderer did not confirm close in time; forcing shutdown.');
                isReadyToCloseRef.value = true;
                mainWindow.close();
            }, 8000);
        }
    });

    mainWindow.on('closed', () => {
        clearTimeout(closeFallbackTimer);
        delete isReadyToCloseRef.cancelPendingClose;
    });

    return mainWindow;
}

export {
    APP_NAME,
    getAppIconPath,
    getWindowIcon,
    lockWindowTitle,
    createWindow
};