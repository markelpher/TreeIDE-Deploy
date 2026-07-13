# Tree IDE Installation Guide

[Português](installation.pt-BR.md) · [Español](installation.es.md) · [Main README](../../README.md)

Tree IDE ships official packages for Windows x64. It is a Windows-only application. NSIS and Portable packages are available.

## Choose Your Download

Download Tree IDE from the GitHub Releases page:

```text
https://github.com/markelpher/treeide-deploy/releases
```

Choose one of these files:

| System | File | Notes |
| --- | --- | --- |
| Windows x64 | `Tree-IDE-Setup-{version}-win-x64.exe` | Recommended (NSIS, supports auto-updates) |
| Windows x64 Portable | `Tree-IDE-Portable-{version}-win-x64.exe` | No installation, runs directly |

## Install on Windows

1. Download the x64 NSIS package (recommended, supports auto-updates) or Portable package.
2. Double-click the Setup installer or run the Portable .exe directly.
3. If Windows SmartScreen appears, choose **More info** and then **Run anyway** only if the file came from the official release page.
4. Wait for the installer to finish (or just launch Portable).
5. Open Tree IDE from the Start menu, desktop shortcut, or the portable executable.

The NSIS installer is per-user and installs under the current Windows user profile, normally inside `%LocalAppData%\Programs`. It does not require administrator permission for normal installation or automatic updates.

## Automatic Updates

Tree IDE uses the Windows NSIS installer channel for automatic updates.

1. Tree IDE checks GitHub Releases for a newer finalized version.
2. When an update is available, the app downloads the x64 NSIS installer in the background.
3. After the download finishes, Tree IDE closes, installs the update silently, and reopens automatically.

Use the `Tree-IDE-Setup-{version}-win-x64.exe` installer for automatic updates. Portable packages are not part of the automatic-update channel.

## Uninstall

Use **Settings -> Apps -> Installed apps -> Tree IDE -> Uninstall**, or run the uninstaller from the Tree IDE installation folder.

## Troubleshooting

### Windows asks for administrator permission

Install the latest `Tree-IDE-Setup-{version}-win-x64.exe` build. Current builds are configured as per-user installs and should not request administrator permission during normal install/update.

If an older machine-wide version was installed before this change, uninstall it first from Windows Settings, then install the new per-user setup.

### The update does not reopen the app

Open Tree IDE manually from the Start menu and check the version in **About Tree IDE**. If the version did not change, download the latest `Tree-IDE-Setup-{version}-win-x64.exe` file from GitHub Releases and run it once.
