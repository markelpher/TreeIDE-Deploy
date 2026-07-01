import {
    getUpdateErrorMessage,
    normalizeReleaseName,
    translateUpdateError,
} from '../src/shared/updateErrors.js';
import { createI18n } from '../src/shared/i18n.js';

describe('getUpdateErrorMessage', () => {
    it('maps channel file not found to update_metadata_missing', () => {
        const err = new Error('Cannot find latest.yml in the latest release artifacts');
        err.code = 'ERR_UPDATER_CHANNEL_FILE_NOT_FOUND';
        expect(getUpdateErrorMessage(err)).toBe('update_metadata_missing');
    });

    it('maps GitHub feed failures to update_repo_inaccessible', () => {
        expect(getUpdateErrorMessage(new Error('Unable to find latest version on GitHub'))).toBe('update_repo_inaccessible');
    });

    it('maps network errors to update_network_error', () => {
        expect(getUpdateErrorMessage(new Error('net::ERR_INTERNET_DISCONNECTED'))).toBe('update_network_error');
        expect(getUpdateErrorMessage(new Error('getaddrinfo ENOTFOUND github.com'))).toBe('update_network_error');
    });

    it('falls back to update_failed for unknown errors', () => {
        expect(getUpdateErrorMessage(new Error('something unexpected'))).toBe('update_failed');
    });
});

describe('normalizeReleaseName', () => {
    it('replaces electron-builder template literals', () => {
        expect(normalizeReleaseName('Tree IDE v${version}', '2.0.58')).toBe('Tree IDE v2.0.58');
    });

    it('keeps explicit release names', () => {
        expect(normalizeReleaseName('Tree IDE v2.0.58', '2.0.58')).toBe('Tree IDE v2.0.58');
    });
});

describe('translateUpdateError', () => {
    it('translates known keys and falls back otherwise', () => {
        const i18n = createI18n('pt');
        expect(translateUpdateError(i18n, 'update_metadata_missing'))
            .toBe(i18n.t('update_metadata_missing'));
        expect(translateUpdateError(i18n, 'Cannot parse update info'))
            .toBe(i18n.t('update_failed'));
    });
});