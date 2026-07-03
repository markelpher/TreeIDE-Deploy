import { readFile } from 'node:fs/promises';

const APPDATA_PATH = 'build-flatpak/flatpak/com.treeide.treeide.appdata.xml';
const WORKFLOW_PATH = '.github/workflows/linux-build.yml';

describe('Flatpak AppStream metadata', () => {
    it('links the app metadata to the installed desktop entry', async () => {
        const metadata = await readFile(APPDATA_PATH, 'utf8');

        expect(metadata).toContain('<id>com.treeide.treeide</id>');
        expect(metadata).toContain('<launchable type="desktop-id">com.treeide.treeide.desktop</launchable>');
        expect(metadata).toContain('<provides>');
        expect(metadata).toContain('<id>com.treeide.treeide.desktop</id>');
    });

    it('keeps release metadata templated for the Flatpak build workflow', async () => {
        const metadata = await readFile(APPDATA_PATH, 'utf8');
        const workflow = await readFile(WORKFLOW_PATH, 'utf8');

        expect(metadata).toContain('<release version="@VERSION@" date="@DATE@"/>');
        expect(workflow).toContain('s/@VERSION@/${VERSION}/g; s/@DATE@/${RELEASE_DATE}/g');
    });
});