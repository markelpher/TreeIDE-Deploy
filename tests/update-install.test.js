import { getUpdateInstallMode, isInAppUpdateInstallSupported } from '../src/shared/updateInstall.js';
import { normalizeDownloadPercent } from '../src/shared/updateProgress.js';

describe('getUpdateInstallMode', () => {
    it('returns none when the app is not packaged', () => {
        expect(getUpdateInstallMode({ isPackaged: false, platform: 'win32' })).toBe('none');
    });

    it('returns in-app only for packaged Windows builds', () => {
        expect(getUpdateInstallMode({ isPackaged: true, platform: 'win32' })).toBe('in-app');
        // Non-Windows platforms are not supported
    });
});

describe('normalizeDownloadPercent', () => {
    it('never decreases the reported percent', () => {
        expect(normalizeDownloadPercent(40, { percent: 15 })).toBe(40);
        expect(normalizeDownloadPercent(40, { percent: 55 })).toBe(55);
    });

    it('prefers transferred/total when available', () => {
        expect(normalizeDownloadPercent(0, { percent: 5, transferred: 250, total: 1000 })).toBe(25);
    });
});

describe('isInAppUpdateInstallSupported', () => {
    it('is true only for the Windows in-app updater mode', () => {
        expect(isInAppUpdateInstallSupported('in-app')).toBe(true);
        expect(isInAppUpdateInstallSupported('launcher')).toBe(false);
        expect(isInAppUpdateInstallSupported('system')).toBe(false);
        expect(isInAppUpdateInstallSupported('manual')).toBe(false);
        expect(isInAppUpdateInstallSupported('none')).toBe(false);
    });
});
