/** i18n keys returned by the main-process updater — never raw English to the UI. */
export const UPDATE_ERROR_KEYS = new Set([
    'update_failed',
    'update_repo_inaccessible',
    'update_metadata_missing',
    'update_release_pending',
    'update_network_error',
    'update_unavailable',
    'update_manual_install',
]);

/**
 * Maps electron-updater / GitHub provider failures to stable i18n keys.
 * @param {unknown} err
 * @returns {string}
 */
export function getUpdateErrorMessage(err) {
    const code = String(err?.code || '').toUpperCase();
    const rawMessage = err?.message || String(err || '');
    const message = rawMessage.toLowerCase();

    if (
        code === 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND'
        || code === 'ERR_UPDATER_INVALID_UPDATE_INFO'
        || message.includes('channel_file_not_found')
        || message.includes('cannot find latest')
        || message.includes('latest.yml')
    ) {
        return 'update_metadata_missing';
    }

    if (
        code === 'ERR_UPDATER_LATEST_VERSION_NOT_FOUND'
        || code === 'ERR_UPDATER_NO_PUBLISHED_VERSIONS'
        || code === 'ERR_UPDATER_INVALID_RELEASE_FEED'
        || message.includes('releases.atom')
        || message.includes('authentication token')
        || message.includes('unable to find latest version')
        || message.includes('no published versions')
    ) {
        return 'update_repo_inaccessible';
    }

    if (
        code === 'ERR_UPDATER_INVALID_VERSION'
        || message.includes('not a valid semver')
    ) {
        return 'update_metadata_missing';
    }

    if (
        message.includes('net::')
        || message.includes('network')
        || message.includes('enotfound')
        || message.includes('econnreset')
        || message.includes('etimedout')
        || message.includes('econnrefused')
        || message.includes('socket hang up')
    ) {
        return 'update_network_error';
    }

    if (message.includes('404') && (message.includes('release') || message.includes('github'))) {
        return 'update_repo_inaccessible';
    }

    return 'update_failed';
}

/**
 * @param {{ t: (key: string) => string, hasKey?: (key: string) => boolean }} i18n
 * @param {string | undefined | null} key
 */
export function translateUpdateError(i18n, key) {
    if (key && typeof i18n?.hasKey === 'function' && i18n.hasKey(key)) {
        return i18n.t(key);
    }
    return i18n.t('update_failed');
}

/**
 * electron-builder sometimes leaves releaseName as a literal template.
 * @param {string | undefined | null} releaseName
 * @param {string | undefined | null} version
 */
export function normalizeReleaseName(releaseName, version) {
    const ver = String(version || '').replace(/^v/, '');
    if (!ver) {
        return releaseName || 'Tree IDE';
    }
    if (!releaseName || releaseName.includes('${version}')) {
        return `Tree IDE v${ver}`;
    }
    return releaseName;
}
