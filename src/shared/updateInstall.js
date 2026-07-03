import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** @typedef {'in-app' | 'manual' | 'none'} UpdateInstallMode */

/**
 * Whether quitAndInstall is safe on this packaged build.
 * Linux .deb/.rpm installs while the app is running often corrupt the install.
 * @param {{ isPackaged?: boolean, platform?: string, env?: Record<string, string | undefined>, resourcesPath?: string }} ctx
 * @returns {UpdateInstallMode}
 */
export function getUpdateInstallMode(ctx = {}) {
    const isPackaged = ctx.isPackaged ?? false;
    if (!isPackaged) { return 'none'; }

    const platform = ctx.platform ?? process.platform;
    const env = ctx.env ?? process.env;

    if (platform === 'win32' || platform === 'darwin') {
        return 'in-app';
    }

    if (platform !== 'linux') {
        return 'manual';
    }

    if (env.SNAP || env.FLATPAK_ID || env.APPIMAGE) {
        return 'in-app';
    }

    const resourcesPath = ctx.resourcesPath;
    if (resourcesPath) {
        try {
            const pkgTypePath = path.join(resourcesPath, 'package-type');
            if (existsSync(pkgTypePath)) {
                const pkgType = readFileSync(pkgTypePath, 'utf8').trim();
                if (pkgType === 'deb' || pkgType === 'rpm' || pkgType === 'pacman') {
                    return 'in-app';
                }
            }
        } catch {
            // fall through
        }
    }

    return 'in-app';
}

export function isInAppUpdateInstallSupported(mode) {
    return mode === 'in-app';
}