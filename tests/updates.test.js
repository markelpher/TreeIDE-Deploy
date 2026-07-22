import { mkdir, rm, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { constants as FS } from 'node:fs';
import { app } from 'electron';
import {
    cleanupPendingUpdateInstall,
    cleanupSupersededPendingUpdate,
    getUpdateCheckStatus,
    isInstalledUpdateVersion,
    isUpdateNewer,
} from '../src/main/ipc/updates.js';

describe('isUpdateNewer', () => {
    it('returns true only when latest is strictly greater', () => {
        expect(isUpdateNewer('2.0.50', '2.0.49')).toBe(true);
        expect(isUpdateNewer('2.1.0', '2.0.99')).toBe(true);
        expect(isUpdateNewer('3.0.0', '2.9.9')).toBe(true);
    });

    it('returns false for equal or older versions', () => {
        expect(isUpdateNewer('2.0.49', '2.0.49')).toBe(false);
        expect(isUpdateNewer('2.0.48', '2.0.49')).toBe(false);
        expect(isUpdateNewer('1.9.0', '2.0.49')).toBe(false);
    });

    it('handles v-prefixed versions', () => {
        expect(isUpdateNewer('v2.0.50', '2.0.49')).toBe(true);
        expect(isUpdateNewer('2.0.49', 'v2.0.49')).toBe(false);
    });
});

describe('getUpdateCheckStatus', () => {
    const finalizedNotes = [
        { locale: 'en', notes: 'English notes' },
        { locale: 'pt-br', notes: 'Notas em português' },
        { locale: 'es', notes: 'Notas en español' },
    ];

    it('offers a newer release after every translation is finalized', () => {
        expect(getUpdateCheckStatus({ version: '2.0.107', releaseNotes: finalizedNotes }, '2.0.106')).toEqual({
            ok: true,
            updateAvailable: true,
            currentVersion: '2.0.106',
            latestVersion: '2.0.107',
        });
    });

    it('reports a newer release as pending while translations are incomplete', () => {
        expect(getUpdateCheckStatus({
            version: '2.0.107',
            releaseNotes: [{ locale: 'en', notes: 'English notes' }],
        }, '2.0.106')).toEqual({
            ok: false,
            error: 'update_release_pending',
            currentVersion: '2.0.106',
            latestVersion: '2.0.107',
        });
    });

    it('keeps the real remote version when no update is available', () => {
        expect(getUpdateCheckStatus({ version: '2.0.106' }, '2.0.106')).toEqual({
            ok: true,
            updateAvailable: false,
            currentVersion: '2.0.106',
            latestVersion: '2.0.106',
        });
    });

    it('reports missing provider metadata as an error', () => {
        expect(getUpdateCheckStatus(null, '2.0.106')).toEqual({
            ok: false,
            error: 'update_metadata_missing',
        });
    });
});

describe('isInstalledUpdateVersion', () => {
    it('returns true when current version is the installed target or newer', () => {
        expect(isInstalledUpdateVersion('2.0.84', '2.0.84')).toBe(true);
        expect(isInstalledUpdateVersion('2.0.85', '2.0.84')).toBe(true);
        expect(isInstalledUpdateVersion('2.0.83', '2.0.84')).toBe(false);
    });
});

describe('cleanupPendingUpdateInstall', () => {
    const userData = app.getPath('userData');
    const pendingPath = path.join(userData, 'pending-update-install.json');
    const installerPath = path.join(userData, 'Tree-IDE-2.0.84.exe');

    beforeEach(async () => {
        await mkdir(userData, { recursive: true });
        await rm(pendingPath, { force: true });
        await rm(installerPath, { force: true });
    });

    afterEach(async () => {
        await rm(pendingPath, { force: true });
        await rm(installerPath, { force: true });
    });

    it('deletes the installer after the target version is installed', async () => {
        await writeFile(installerPath, 'installer', 'utf8');
        await writeFile(pendingPath, JSON.stringify({
            version: '2.0.84',
            installerPath,
        }), 'utf8');

        const result = cleanupPendingUpdateInstall('2.0.84');

        expect(result).toEqual({ checked: true, ok: true, deleted: true });
        await expect(access(installerPath, FS.F_OK)).rejects.toThrow();
        await expect(access(pendingPath, FS.F_OK)).rejects.toThrow();
    });

    it('keeps the installer and pending state when the target version was not installed', async () => {
        await writeFile(installerPath, 'installer', 'utf8');
        await writeFile(pendingPath, JSON.stringify({
            version: '2.0.84',
            installerPath,
        }), 'utf8');

        const result = cleanupPendingUpdateInstall('2.0.83');

        expect(result).toEqual({
            checked: true,
            ok: false,
            error: 'not-installed',
            installerPath,
            installerKept: true,
        });
        await expect(access(installerPath, FS.F_OK)).resolves.toBeUndefined();
        await expect(access(pendingPath, FS.F_OK)).resolves.toBeUndefined();
    });

    it('deletes a downloaded installer when a newer update is available', async () => {
        await writeFile(installerPath, 'installer', 'utf8');
        await writeFile(pendingPath, JSON.stringify({
            version: '2.0.84',
            installerPath,
        }), 'utf8');

        const result = cleanupSupersededPendingUpdate('2.0.85');

        expect(result).toEqual({ checked: true, deleted: true, version: '2.0.84' });
        await expect(access(installerPath, FS.F_OK)).rejects.toThrow();
        await expect(access(pendingPath, FS.F_OK)).rejects.toThrow();
    });
});
