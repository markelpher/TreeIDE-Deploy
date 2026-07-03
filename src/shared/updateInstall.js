import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** @typedef {'in-app' | 'launcher' | 'system' | 'manual' | 'none'} UpdateInstallMode */

/**
 * Whether in-app install is safe on this packaged build.
 * Linux package managers are not reliable from inside a running desktop app:
 * failed elevation or package-manager errors can leave the app closed and the
 * update not installed. AppImage is the Linux case we can safely replace.
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

    if (env.TREEIDE_LAUNCHER === '1' && env.TREEIDE_LAUNCHER_BIN) {
        return 'launcher';
    }

    if (env.APPIMAGE) {
        return 'in-app';
    }

    if (env.SNAP || env.FLATPAK_ID) {
        return 'system';
    }

    const resourcesPath = ctx.resourcesPath;
    if (resourcesPath) {
        try {
            const pkgTypePath = path.join(resourcesPath, 'package-type');
            if (existsSync(pkgTypePath)) {
                const pkgType = readFileSync(pkgTypePath, 'utf8').trim();
                if (pkgType === 'deb' || pkgType === 'rpm' || pkgType === 'pacman') {
                    return 'system';
                }
            }
        } catch {
            // fall through
        }

        const normalizedResourcesPath = resourcesPath.replace(/\\/g, '/');
        if (normalizedResourcesPath.startsWith('/opt/') || normalizedResourcesPath.startsWith('/usr/')) {
            return 'system';
        }
    }

    return 'manual';
}

export function isInAppUpdateInstallSupported(mode) {
    return mode === 'in-app' || mode === 'launcher' || mode === 'system';
}