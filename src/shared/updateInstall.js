/** @typedef {'in-app' | 'none'} UpdateInstallMode */

/**
 * Automatic in-app updates are supported only by the Windows NSIS installer.
 * @param {{ isPackaged?: boolean }} ctx
 * @returns {UpdateInstallMode}
 */
export function getUpdateInstallMode(ctx = {}) {
    const isPackaged = ctx.isPackaged ?? false;
    if (!isPackaged) { return 'none'; }

    return 'in-app';
}

export function isInAppUpdateInstallSupported(mode) {
    return mode === 'in-app';
}
