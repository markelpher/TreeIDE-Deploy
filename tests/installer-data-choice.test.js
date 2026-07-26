import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const installerScript = readFileSync(new URL('../build/installer.nsh', import.meta.url), 'utf8');
const packageConfig = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

describe('Windows installer data choices', () => {
    it('aligns both header lines with the window caption in installer and uninstaller flows', () => {
        expect(installerScript).toMatch(/!macro TreeIdeAlignHeaderControls[\s\S]*GetDlgItem \$0 \$HWNDPARENT 1037[\s\S]*GetDlgItem \$1 \$HWNDPARENT 1038[\s\S]*SetWindowPos/);
        expect(installerScript).toMatch(/!macro customInstallmode[\s\S]*Call un\.TreeIdeAlignHeader[\s\S]*Call TreeIdeAlignHeader/);
        expect(installerScript).toMatch(/Function TreeIdeSetHeader[\s\S]*Call TreeIdeAlignHeader/);
        expect(installerScript).toMatch(/Function un\.TreeIdeSetHeader[\s\S]*Call un\.TreeIdeAlignHeader/);
        expect(installerScript).toMatch(/Function TreeIdeAlignHeader\s+!insertmacro TreeIdeAlignHeaderControls/);
        expect(installerScript).toMatch(/Function un\.TreeIdeAlignHeader\s+!insertmacro TreeIdeAlignHeaderControls/);
    });

    it('lets assisted installs choose whether to create a desktop shortcut', () => {
        expect(packageConfig.build.nsis.createDesktopShortcut).toBe(true);
        expect(installerScript).toContain('PageCallbacks TreeIdeDesktopShortcutPre TreeIdeDesktopShortcutLeave');
        expect(installerScript).toContain('${NSD_CreateLabel} 0u 0u 300u 18u "$(treeIdeShortcutIntro)"');
        expect(installerScript).toContain('${NSD_CreateCheckbox} 0u 24u 300u 18u "$(treeIdeShortcutOption)"');
        expect(installerScript).toContain('${NSD_Check} $TreeIdeDesktopShortcutCheckbox');
        expect(installerScript).toContain('${NSD_GetState} $TreeIdeDesktopShortcutCheckbox $0');
        expect(installerScript).toMatch(/!macro customInstall[\s\S]*CreateShortCut "\$newDesktopLink"[\s\S]*Delete "\$newDesktopLink"/);
        expect(installerScript).toMatch(/Function TreeIdeDesktopShortcutPre\s+IfSilent 0 \+2\s+Abort/);
    });

    it('keeps the traditional installation progress determinate and monotonic', () => {
        expect(installerScript).not.toContain('PBM_SETMARQUEE');
        expect(installerScript).toMatch(/Function TreeIdeStabilizeInstallProgress[\s\S]*PBM_GETRANGE[\s\S]*PBM_GETPOS[\s\S]*PBM_SETPOS/);
        expect(installerScript).toMatch(/Function TreeIdeOnPageShow[\s\S]*StrCpy \$TreeIdeInstallProgressHighWater 0[\s\S]*Call TreeIdeStabilizeInstallProgress[\s\S]*TreeIdeStabilizeInstallProgress 25/);
        expect(installerScript).toMatch(/Function TreeIdeFinishPageShow[\s\S]*KillTimer \/NOUNLOAD TreeIdeStabilizeInstallProgress/);
    });
    it('asks only manual installs that find existing Tree IDE data', () => {
        expect(installerScript).toContain('IfFileExists "$0\\Tree IDE\\*.*" treeIdeExistingDataFound');
        expect(installerScript).toContain('IfFileExists "$1\\tree-ide-updater\\*.*" treeIdeExistingDataFound');
        expect(installerScript).toMatch(/IfFileExists "\$1\\tree-ide-updater\\\*\.\*" treeIdeExistingDataFound 0\s+Abort/);
    });

    it('defaults to keeping data during a manual upgrade', () => {
        expect(installerScript).toContain('${NSD_CreateRadioButton} 0u 8u 300u 18u "$(cleanInstallKeepOption)"');
        expect(installerScript).toContain('${NSD_CreateRadioButton} 0u 38u 300u 30u "$(cleanInstallDeleteOption)"');
        expect(installerScript).toContain('${NSD_Check} $CleanInstallKeepRadio');
        expect(installerScript).toContain('${NSD_GetState} $CleanInstallDeleteRadio $0');
    });

    it('uses assisted pages manually and skips the data prompt for app updates', () => {
        expect(packageConfig.build.nsis.oneClick).toBe(false);
        expect(installerScript).toMatch(/Function TreeIdeCleanInstallPre\s+IfSilent 0 \+2\s+Abort/);
        expect(installerScript).not.toContain('.show-welcome-on-next-launch');
    });

    it('defaults to keeping data during uninstall', () => {
        expect(installerScript).toContain('${NSD_CreateRadioButton} 0u 8u 300u 18u "$(uninstallDataKeepOption)"');
        expect(installerScript).toContain('${NSD_CreateRadioButton} 0u 38u 300u 30u "$(uninstallDataDeleteOption)"');
        expect(installerScript).toContain('${NSD_Check} $UninstallKeepRadio');
        expect(installerScript).toContain('${NSD_GetState} $UninstallDeleteRadio $0');
        expect(installerScript).toMatch(/!macro customUnInstall\s+\$\{If\} \$UninstallDataRequested == "1"\s+Call un\.RemoveTreeIdeUserData/);
    });

    it('marks the uninstaller finish page before localizing its buttons', () => {
        expect(installerScript).toMatch(/Function un\.TreeIdeFinishPagePre\s+StrCpy \$TreeIdeIsFinishPage "1"\s+FunctionEnd/);
        expect(installerScript).toMatch(/!macro customUninstallPage[\s\S]*!define MUI_PAGE_CUSTOMFUNCTION_PRE un\.TreeIdeFinishPagePre/);
        expect(installerScript).not.toMatch(/!ifndef BUILD_UNINSTALLER\s+Function un\.TreeIdeFinishPagePre/);
    });
});

describe('packaged application protection', () => {
    it('loads only the integrity-validated ASAR in production builds', () => {
        expect(packageConfig.build.asar).toBe(true);
        expect(packageConfig.build.asarUnpack).toEqual(['node_modules/7zip-bin/win/x64/**/*']);
        expect(packageConfig.build.files).toEqual(expect.arrayContaining([
            '!node_modules/7zip-bin/linux/**/*',
            '!node_modules/7zip-bin/mac/**/*',
            '!node_modules/7zip-bin/win/ia32/**/*',
        ]));
        expect(packageConfig.build.electronFuses).toMatchObject({
            runAsNode: false,
            enableNodeOptionsEnvironmentVariable: false,
            enableNodeCliInspectArguments: false,
            enableEmbeddedAsarIntegrityValidation: true,
            onlyLoadAppFromAsar: true,
        });
    });
});
