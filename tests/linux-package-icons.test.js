import { access, readFile } from 'node:fs/promises';
import { constants as FS } from 'node:fs';

const ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];

describe('Linux package icons', () => {
    it('uses the Tree IDE icon for electron-builder Linux targets', async () => {
        const pkg = JSON.parse(await readFile('package.json', 'utf8'));

        expect(pkg.build.linux.icon).toBe('assets/icon-no-bg.png');
        expect(pkg.build.deb.icon).toBe('assets/icon-no-bg.png');
    });

    it('ships hicolor PNGs for Linux app stores and launchers', async () => {
        await expect(access('build/icons/icon.png', FS.F_OK)).resolves.toBeUndefined();
        await Promise.all(ICON_SIZES.map((size) => (
            expect(access(`build/icons/${size}x${size}.png`, FS.F_OK)).resolves.toBeUndefined()
        )));
    });

    it('uses the same Tree IDE hicolor icons in the Flatpak manifest', async () => {
        const manifest = await readFile('build-flatpak/flatpak/com.treeide.treeide.yml', 'utf8');

        expect(manifest).toContain('build/icons/${size}x${size}.png');
        expect(manifest).toContain('/app/share/icons/hicolor/${size}x${size}/apps/com.treeide.treeide.png');
    });
});