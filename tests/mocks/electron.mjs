import os from 'node:os';
import path from 'node:path';

const noop = () => {};

export const app = {
    getPath: (name) => {
        if (name === 'temp') { return os.tmpdir(); }
        if (name === 'userData') { return path.join(os.tmpdir(), 'treeide-test-userdata'); }
        return os.tmpdir();
    },
    getVersion: () => '2.0.50',
    getName: () => 'Tree IDE',
    quit: noop,
    on: noop,
    whenReady: () => Promise.resolve(),
    requestSingleInstanceLock: () => true,
    setName: noop,
    setAppUserModelId: noop,
    isPackaged: false,
    commandLine: { appendSwitch: noop },
};

export const ipcMain = {
    handle: noop,
    on: noop,
};

export const ipcRenderer = {
    invoke: async () => ({}),
    on: noop,
    send: noop,
};

export const dialog = {
    showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
    showSaveDialog: async () => ({ canceled: true, filePath: '' }),
};

export class BrowserWindow {
    constructor() {
        this.webContents = {
            send: noop,
            on: noop,
            once: noop,
            reload: noop,
            toggleDevTools: noop,
            setWindowOpenHandler: noop,
            getURL: () => 'file:///index.html',
        };
    }

    loadFile() {}
    loadURL() {}
    on() {}
    once() {}
    show() {}
    setMenu() {}
    setTitle() {}
    focus() {}
    restore() {}
    close() {}
    minimize() {}
    maximize() {}
    unmaximize() {}
    isDestroyed() { return false; }
    isMinimized() { return false; }
    isMaximized() { return false; }
    static getAllWindows() { return []; }
}

export const shell = {
    openExternal: async () => {},
    openPath: async () => '',
    showItemInFolder: noop,
};

export const nativeImage = {
    createFromPath: () => ({ isEmpty: () => true }),
};

export const contextBridge = { exposeInMainWorld: noop };

export const webUtils = { getPathForFile: () => '' };