# Tree IDE Installation Guide

[Português](installation.pt-BR.md) · [Español](installation.es.md) · [Main README](../../README.md)

This guide explains how to install, update, and uninstall Tree IDE on every supported platform and package format.

## Choose Your Download

Download Tree IDE from the GitHub Releases page:

```text
https://github.com/markelpher/TreeIDE-Deploy/releases
```

Choose the file that matches your operating system and CPU architecture.

| System | Recommended file | When to use it |
| --- | --- | --- |
| Windows x64 / ARM64 | `Tree-IDE-Setup-{version}-win-{arch}.exe` | Best option for most users |
| Windows x64 / ARM64 | `Tree-IDE-{version}-win-{arch}.msi` | Managed installs, IT deployment, or enterprise environments |
| Windows x64 / ARM64 | `Tree-IDE-Portable-{version}-win-{arch}.exe` | Run without installing |
| Ubuntu, Debian, Linux Mint | `Tree-IDE-{version}-{arch}.deb` | Native install on Debian-based distributions |
| Fedora, RHEL, openSUSE | `Tree-IDE-{version}-{arch}.rpm` | Native install on RPM-based distributions |
| Most Linux distributions | `Tree-IDE-{version}-{arch}.AppImage` | Portable Linux app with no system install |
| Most Linux distributions | `Tree-IDE-{version}-{arch}.tar.gz` | Portable launcher-based install and self-update path |
| Snap-enabled Linux | `Tree-IDE-{version}-{arch}.snap` | Local Snap install |
| Flatpak-enabled Linux | `Tree-IDE-{version}-{arch}.flatpak` | Local Flatpak bundle |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.dmg` | Standard macOS install |
| macOS Apple Silicon | `Tree-IDE-{version}-macOS-arm64.zip` | Portable/manual macOS app bundle |

`{arch}` is usually `x64` for Intel/AMD PCs and `arm64` for ARM devices.

## Windows

### Recommended: NSIS Setup

1. Download `Tree-IDE-Setup-{version}-win-x64.exe` or `Tree-IDE-Setup-{version}-win-arm64.exe`.
2. Double-click the installer.
3. If Windows SmartScreen appears, choose **More info** and then **Run anyway** only if you downloaded it from the official release page.
4. Choose the installation folder.
5. Finish the installer and launch Tree IDE.

### MSI

Use MSI when you need a predictable Windows Installer package.

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi
```

For a silent install:

```powershell
msiexec /i Tree-IDE-{version}-win-x64.msi /qn
```

### Portable

1. Download `Tree-IDE-Portable-{version}-win-{arch}.exe`.
2. Move it to a folder where you keep portable apps.
3. Double-click it to run Tree IDE.

Portable builds do not create a normal system install entry.

### Updating on Windows

Installed builds can use the in-app updater:

1. Open Tree IDE.
2. Go to **Settings -> Updates**.
3. Click **Check for updates**.
4. Download and install the update when prompted.

For portable builds, download the new portable `.exe` and replace the old one.

### Uninstalling on Windows

Use **Settings -> Apps -> Installed apps -> Tree IDE -> Uninstall**, or run the uninstaller from the installation folder.

## Linux

Tree IDE supports several Linux package types because Linux distributions handle desktop apps differently. If you are unsure, use:

- `.deb` on Ubuntu, Debian, Linux Mint, Pop!_OS, Zorin OS.
- `.rpm` on Fedora, RHEL, Rocky Linux, AlmaLinux, openSUSE.
- `.AppImage` when you want a portable app.
- `.tar.gz` when you want the launcher-based self-update path.

### Ubuntu, Debian, Linux Mint: DEB

Download:

```text
Tree-IDE-{version}-x64.deb
```

Install from terminal:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

If you are on ARM64:

```bash
sudo apt install ./Tree-IDE-{version}-arm64.deb
```

Do not rely on Ubuntu App Center for local `.deb` updates. It can open the package but fail to upgrade an already installed local package. Terminal installation with `apt install ./file.deb` is the reliable path.

Updating:

1. Open Tree IDE.
2. Go to **Settings -> Updates**.
3. Click **Check for updates**.
4. Tree IDE downloads the matching `.deb` package.
5. The system permission prompt appears.
6. Confirm it to let `apt` install the update.

Manual update fallback:

```bash
sudo apt install ./Tree-IDE-{new-version}-x64.deb
```

Uninstall:

```bash
sudo apt remove tree-ide
```

### Fedora, RHEL, Rocky Linux, openSUSE: RPM

Fedora/RHEL-style install:

```bash
sudo dnf install ./Tree-IDE-{version}-x64.rpm
```

openSUSE-style install:

```bash
sudo zypper install ./Tree-IDE-{version}-x64.rpm
```

Generic RPM fallback:

```bash
sudo rpm -Uvh --replacepkgs ./Tree-IDE-{version}-x64.rpm
```

Updating:

1. Use **Settings -> Updates** inside Tree IDE.
2. Tree IDE downloads the matching `.rpm`.
3. It starts the system package install with elevated permissions.

Uninstall:

```bash
sudo dnf remove tree-ide
```

or:

```bash
sudo zypper remove tree-ide
```

### AppImage

AppImage is portable and does not require installation.

1. Download `Tree-IDE-{version}-x64.AppImage`.
2. Make it executable:

```bash
chmod +x Tree-IDE-{version}-x64.AppImage
```

3. Run it:

```bash
./Tree-IDE-{version}-x64.AppImage
```

Updating:

Tree IDE can replace the current AppImage when running from AppImage. Use **Settings -> Updates**.

Uninstall:

Delete the `.AppImage` file. If you created menu entries manually, remove those too.

### tar.gz Launcher Install

The `.tar.gz` package is the best Linux option if you want a portable install with the launcher-based update flow.

1. Download `Tree-IDE-{version}-x64.tar.gz`.
2. Extract it:

```bash
mkdir -p ~/.local/share/tree-ide/manual
tar -xzf Tree-IDE-{version}-x64.tar.gz -C ~/.local/share/tree-ide/manual
```

3. Find and run the launcher:

```bash
~/.local/share/tree-ide/manual/tree-ide-launcher
```

Depending on the extracted folder structure, the launcher may be inside the extracted Tree IDE folder.

Updating:

1. Start Tree IDE through `tree-ide-launcher`.
2. Use **Settings -> Updates**.
3. Tree IDE downloads the matching `.tar.gz`.
4. The launcher extracts the new version into a versioned directory and switches the `current` link.

This update path does not need root permissions.

Uninstall:

```bash
rm -rf ~/.local/share/tree-ide
```

### Snap

Install a local Snap package:

```bash
sudo snap install --dangerous ./Tree-IDE-{version}-x64.snap
```

Update an already installed local Snap:

```bash
sudo snap install --dangerous --amend ./Tree-IDE-{version}-x64.snap
```

Tree IDE uses the amend flow when installing downloaded Snap updates.

Uninstall:

```bash
sudo snap remove tree-ide
```

### Flatpak

Install a local Flatpak bundle:

```bash
flatpak install --user ./Tree-IDE-{version}-x86_64.flatpak
```

System-wide install:

```bash
sudo flatpak install ./Tree-IDE-{version}-x86_64.flatpak
```

Run:

```bash
flatpak run com.treeide.treeide
```

Update/reinstall a local Flatpak bundle:

```bash
flatpak install --reinstall ./Tree-IDE-{version}-x86_64.flatpak
```

Uninstall:

```bash
flatpak uninstall com.treeide.treeide
```

## macOS

Tree IDE supports Apple Silicon Macs (`arm64`). Intel Macs are not supported.

### DMG

1. Download `Tree-IDE-{version}-macOS-arm64.dmg`.
2. Open the `.dmg`.
3. Drag **Tree IDE** into **Applications**.
4. Open Tree IDE from Applications.

If macOS blocks the app, open **System Settings -> Privacy & Security** and allow it only if you downloaded it from the official release page.

### ZIP

1. Download `Tree-IDE-{version}-macOS-arm64.zip`.
2. Extract it.
3. Move `Tree IDE.app` to Applications or another folder.
4. Open the app.

### Updating on macOS

Use **Settings -> Updates** inside Tree IDE for installed builds. If that is unavailable, download the latest `.dmg` and replace the app in Applications.

### Uninstalling on macOS

1. Quit Tree IDE.
2. Delete `Tree IDE.app` from Applications.
3. Optional: remove user data from `~/Library/Application Support/Tree IDE`.

## Troubleshooting

### The app does not start on Linux

Run it from a terminal to see the error:

```bash
tree-ide
```

or, for AppImage:

```bash
./Tree-IDE-{version}-x64.AppImage
```

### Ubuntu opens the package in App Center

Use terminal installation instead:

```bash
sudo apt install ./Tree-IDE-{version}-x64.deb
```

This avoids the App Center local-package update issue.

### Permission prompt does not appear during update

Install `pkexec` or make sure `sudo` is available:

```bash
sudo apt install policykit-1
```

Then try the update again.

### Which Linux file should I choose?

Use this quick rule:

| Distribution | Pick |
| --- | --- |
| Ubuntu/Debian/Linux Mint | `.deb` |
| Fedora/RHEL/openSUSE | `.rpm` |
| Any distro, no install wanted | `.AppImage` |
| Any distro, best self-update path | `.tar.gz` |
| Snap users | `.snap` |
| Flatpak users | `.flatpak` |

## Verify You Installed Tree IDE

Open Tree IDE and check **Settings -> Updates** or **About Tree IDE**. The displayed version should match the release you installed.
