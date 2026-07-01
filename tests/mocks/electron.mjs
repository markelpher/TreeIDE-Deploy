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
        this.webContents = { send: noop, on: noop, once: noop };
    }

    loadFile() {}
    loadURL() {}
    on() {}
    once() {}
    show() {}
    setMenu() {}
    setTitle() {}
    isMaximized() { return false; }
}

export const shell = { openExternal: async () => {} };

export const nativeImage = {
    createFromPath: () => ({ isEmpty: () => true }),
};

export const contextBridge = { exposeInMainWorld: noop };

export const webUtils = { getPathForFile: () => '' };