import { ipcMain } from 'electron';

function isMainWindowSender(event, win) {
    return Boolean(win && !win.isDestroyed?.() && event?.sender === win.webContents);
}

function registerDiscordPresenceIpc(getMainWindow, presence) {
    ipcMain.handle('discord-presence-configure', async (event, options) => {
        if (!isMainWindowSender(event, getMainWindow())) {
            return { error: 'invalid-sender' };
        }
        return presence.configure(options);
    });

    ipcMain.handle('discord-presence-update', async (event, activity) => {
        if (!isMainWindowSender(event, getMainWindow())) {
            return { error: 'invalid-sender' };
        }
        return presence.updateActivity(activity);
    });

    ipcMain.handle('discord-presence-reconnect', async (event) => {
        if (!isMainWindowSender(event, getMainWindow())) {
            return { error: 'invalid-sender' };
        }
        return presence.reconnect();
    });

    ipcMain.handle('discord-presence-status', (event) => {
        if (!isMainWindowSender(event, getMainWindow())) {
            return { error: 'invalid-sender' };
        }
        return presence.getStatus();
    });
}

export { registerDiscordPresenceIpc };
