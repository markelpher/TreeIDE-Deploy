import { getUpdateInstallMode, isInAppUpdateInstallSupported } from '../src/shared/updateInstall.js';
import { normalizeDownloadPercent } from '../src/shared/updateProgress.js';

describe('getUpdateInstallMode', () => {
    it('returns none when the app is not packaged', () => {
        expect(getUpdateInstallMode({ isPackaged: false, platform: 'win32' })).toBe('none');
    });

    it('returns in-app for Windows and macOS', () => {
        expect(getUpdateInstallMode({ isPackaged: true, platform: 'win32' })).toBe('in-app');
        expect(getUpdateInstallMode({ isPackaged: true, platform: 'darwin' })).toBe('in-app');
    });

    it('returns in-app for Linux AppImage', () => {
        expect(getUpdateInstallMode({
            isPackaged: true,
            platform: 'linux',
            env: { APPIMAGE: '/tmp/Tree-IDE.AppImage' },
        })).toBe('in-app');
    });

    it('returns in-app for Linux deb, snap, and other packaged builds', () => {
        expect(getUpdateInstallMode({
            isPackaged: true,
            platform: 'linux',
            env: { SNAP: 'tree-ide' },
            resourcesPath: '/usr/lib/tree-ide/resources',
        })).toBe('in-app');

        expect(getUpdateInstallMode({
            isPackaged: true,
            platform: 'linux',
            env: {},
            resourcesPath: '/opt/Tree IDE/resources',
        })).toBe('in-app');
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
    it('is true only for in-app mode', () => {
        expect(isInAppUpdateInstallSupported('in-app')).toBe(true);
        expect(isInAppUpdateInstallSupported('manual')).toBe(false);
    });
});