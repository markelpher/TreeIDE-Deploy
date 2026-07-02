const { execSync } = require('node:child_process');
const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

function patchTextFile(filePath, replacements) {
    if (!existsSync(filePath)) { return false; }

    let content = readFileSync(filePath, 'utf-8');
    const original = content;

    for (const [from, to, guard = to] of replacements) {
        if (content.includes(guard)) { continue; }
        content = content.split(from).join(to);
    }

    if (content !== original) {
        writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    return false;
}

function patchNsisTemplates() {
    const nsisDir = path.join(__dirname, '..', 'node_modules', 'app-builder-lib', 'templates', 'nsis');

    const assistedInstaller = path.join(nsisDir, 'assistedInstaller.nsh');
    const directoryPageDefines = [
        '!insertmacro customInstallDirectoryPage',
        '!ifdef MUI_PAGE_CUSTOMFUNCTION_PRE',
        '  !undef MUI_PAGE_CUSTOMFUNCTION_PRE',
        '!endif'
    ].join('\n    ');

    const patchedDirectoryCallback = patchTextFile(assistedInstaller, [
        [
            [
                '!define MUI_PAGE_CUSTOMFUNCTION_SHOW TreeIdeOnPageShow',
                '    !define MUI_DIRECTORYPAGE_TEXT_TOP "$(treeIdeDirText)"',
                '    !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "$(treeIdeDirDestination)"',
                '    !insertmacro MUI_PAGE_DIRECTORY'
            ].join('\n'),
            directoryPageDefines,
            'customInstallDirectoryPage'
        ],
        [
            '!define MUI_PAGE_CUSTOMFUNCTION_SHOW TreeIdeOnPageShow\n    !insertmacro MUI_PAGE_DIRECTORY',
            directoryPageDefines,
            'customInstallDirectoryPage'
        ],
        [
            '!insertmacro MUI_PAGE_DIRECTORY',
            directoryPageDefines,
            'customInstallDirectoryPage'
        ]
    ]);
    if (patchedDirectoryCallback) {
        console.log('[beforePack] Patched assistedInstaller.nsh: localized directory page callback');
    }

    patchTextFile(assistedInstaller, [[
        '    !insertmacro skipPageIfUpdated\n    !insertmacro customInstallDirectoryPage',
        '    !insertmacro customInstallDirectoryPage',
        'treeIdeDirectorySkipPageMacroRemovedAfterPatch'
    ]]);


    const patchedInstaller = patchTextFile(path.join(nsisDir, 'installer.nsi'), [[
        'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "Unable to elevate, error $0"',
        'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "$(treeIdeUnableToElevate)"'
    ]]);
    if (patchedInstaller) {
        console.log('[beforePack] Patched installer.nsi: localized elevation error');
    }

    const patchedMultiUser = patchTextFile(path.join(nsisDir, 'multiUserUi.nsh'), [
        [
            'SendMessage $MultiUser.InstallModePage.AllUsers ${WM_SETTEXT} 0 "STR:$8 (must run as admin)"',
            'SendMessage $MultiUser.InstallModePage.AllUsers ${WM_SETTEXT} 0 "STR:$8 ($(treeIdeMustRunAsAdmin))"'
        ],
        [
            'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "Logon service not running, aborting!" ; "Unable to elevate, Secondary Logon service not running!"',
            'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "$(treeIdeLogonServiceNotRunning)"'
        ],
        [
            'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "Unable to elevate, error $0"',
            'MessageBox mb_IconStop|mb_TopMost|mb_SetForeground "$(treeIdeUnableToElevate)"'
        ]
    ]);
    if (patchedMultiUser) {
        console.log('[beforePack] Patched multiUserUi.nsh: localized elevation and admin messages');
    }

    const patchedUninstaller = patchTextFile(path.join(nsisDir, 'uninstaller.nsh'), [
        [
            'DetailPrint "File is busy, aborting: $R0"',
            'StrCpy $0 $R0\n        DetailPrint "$(treeIdeFileBusy)"'
        ],
        [
            'Abort `Can\'t rename "$INSTDIR" to "$PLUGINSDIR\\old-install".`',
            'Abort "$(treeIdeCannotRenameInstallDir)"'
        ]
    ]);
    if (patchedUninstaller) {
        console.log('[beforePack] Patched uninstaller.nsh: localized file removal errors');
    }
}


function patchMsiTemplate() {
    const templatePath = path.join(__dirname, '..', 'node_modules', 'app-builder-lib', 'templates', 'msi', 'template.xml');
    const patched = patchTextFile(templatePath, [
        [
            'Language="1033" Codepage="65001"',
            'Language="1046" Codepage="65001"',
            'Language="1046" Codepage="65001"'
        ],
        [
            '<Condition Message="Windows 7 and above is required"><![CDATA[Installed OR VersionNT >= 601]]></Condition>',
            '<Condition Message="É necessário Windows 7 ou superior"><![CDATA[Installed OR VersionNT >= 601]]></Condition>',
            'É necessário Windows 7 ou superior'
        ],
        [
            '<MajorUpgrade AllowSameVersionUpgrades="yes" DowngradeErrorMessage=\'A newer version of "[ProductName]" is already installed.\'/>',
            '<MajorUpgrade AllowSameVersionUpgrades="yes" DowngradeErrorMessage=\'Uma versão mais recente do "[ProductName]" já está instalada.\'/>',
            'Uma versão mais recente do "[ProductName]" já está instalada.'
        ],
        [
            '<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="Run ${productName}"/>',
            '<Property Id="WIXUI_EXITDIALOGOPTIONALCHECKBOXTEXT" Value="Executar ${productName}"/>',
            'Executar ${productName}'
        ]
    ]);
    if (patched) {
        console.log('[beforePack] Patched MSI template: pt-BR WiX UI defaults');
    }
}
exports.default = async function beforePack() {
    execSync('npm run build:renderer', { stdio: 'inherit' });

    const indexHtml = path.join(__dirname, '..', 'dist', 'renderer', 'index.html');
    const assetsDir = path.join(__dirname, '..', 'dist', 'renderer', 'assets');

    if (!existsSync(indexHtml)) {
        throw new Error('Renderer build failed: dist/renderer/index.html is missing');
    }
    if (!existsSync(assetsDir)) {
        throw new Error('Renderer build failed: dist/renderer/assets is missing');
    }

    patchNsisTemplates();
    patchMsiTemplate();
};








