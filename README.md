# Tree IDE

[Português](docs/README.pt-BR.md) · [Español](docs/README.es.md)

A lightweight desktop app for designing project structures in text, previewing them as a visual tree, and generating folders, starter files, and ZIP archives in a few clicks.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/preview.png)

## Features

- **Live tree preview** — write a structure in plain text and see it rendered immediately
- **Project generation** — create folders and files in a selected output directory
- **ZIP and tar.gz export** — package the current structure after building or on demand
- **Archive extraction** — extract ZIP, tar.gz, RAR, and 7z archives via drag-and-drop
- **Starter templates** — insert ready-made structures for Node.js, React, Python, MVC, and static sites
- **File previews** — inspect generated starter content before building
- **Validation** — catch bad indentation, duplicate names, invalid paths, and empty structures before writing files
- **Smart icons** — contextual icons for common folders, programming languages, media, archives, and config files
- **Undo and redo** — full undo/redo history for tree editing
- **Session persistence** — projects are automatically saved to IndexedDB
- **English, Portuguese, and Spanish** — built-in interface translations with first-run language selection
- **Themes and settings** — dark and light themes, build folder selection, and autosaved sessions
- **Auto-updater** — check GitHub Releases with Electron updater, download updates in-app, and restart to install

## Structure Syntax

Tree IDE uses a simple indentation-based format. Use tabs or groups of four spaces to nest items.

```text
my-project/
    src/
        main.js
        utils.ts
    assets/
        logo.png
        preview.png
    README.md
    package.json
```

Folders can end with `/` for clarity. Tree IDE also detects folders when they contain nested children.

## Workflow

1. Write or paste a project structure in the editor
2. Review the live tree preview and validation panel
3. Choose a build folder in settings
4. Click **Build** to create the structure
5. Optionally export the same structure as a ZIP or tar.gz file

You can also start from the Templates panel and customize the generated tree and file contents before building.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + S` | Save current `.tree` project |
| `Ctrl + Shift + S` | Save project as |
| `Ctrl + O` | Open project |
| `Ctrl + N` | New project |
| `Ctrl + R` | Reload app |
| `Ctrl + +` / `Ctrl + -` | Zoom in / out |
| `Ctrl + 0` | Reset zoom |
| `F11` | Toggle full screen |
| `Tab` | Increase indentation |
| `Shift + Tab` | Decrease indentation |

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/markelpher/TreeIDE-Deploy.git
cd TreeIDE-Deploy
npm install
```

Run the app locally:

```bash
npm start
```

Run tests:

```bash
npm test
```

### Windows (x64 + arm64)

```bash
npm run build
```

On arm64 hosts, add `--arm64` to build ARM64 packages: `vite build && electron-builder --win nsis msi portable --arm64`.

| Windows identifier | Value |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Executable name | `Tree IDE` |
| Installer languages | English (`en_US`), Portuguese (`pt_BR`), Spanish (`es_ES`) |
| Updater metadata | `latest.yml` (x64), `latest-arm64.yml` (arm64) |
| CI workflow | `Build Windows` — `.github/workflows/windows-build.yml` |
| CI artifact names | `tree-ide-windows-x64`, `tree-ide-windows-arm64` |
| Release files (x64 / arm64) | `Tree-IDE-Setup-{version}-win-{arch}.exe` (NSIS), `Tree-IDE-{version}-win-{arch}.msi`, `Tree-IDE-Portable-{version}-win-{arch}.exe` |

### Linux (x64 + arm64)

```bash
vite build && electron-builder --linux AppImage deb snap
```

On arm64 hosts, add `--arm64` to build ARM64 packages. Flatpak bundles are built separately in CI.

| Linux identifier | Value |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Desktop entry | `com.treeide.treeide.desktop` |
| App category | `Development` |
| Updater metadata | `latest-linux.yml` (x64), `latest-linux-arm64.yml` (arm64) |
| CI workflow | `Build Linux` — `.github/workflows/linux-build.yml` |
| CI artifact names | `tree-ide-linux-x64`, `tree-ide-linux-arm64`, `tree-ide-linux-flatpak-x64`, `tree-ide-linux-flatpak-arm64` |
| Release files (x64) | `Tree-IDE-{version}-x64.AppImage`, `.deb`, `.snap`, `Tree-IDE-{version}-x86_64.flatpak` |
| Release files (arm64) | `Tree-IDE-{version}-arm64.AppImage`, `.deb`, `Tree-IDE-{version}-aarch64.flatpak` |

### macOS (Apple Silicon / arm64)

```bash
npm run build:mac
```

Intel Macs are not supported.

| macOS identifier | Value |
| --- | --- |
| Bundle ID | `com.treeide.treeide` |
| App category | `public.app-category.developer-tools` |
| Updater metadata | `latest-mac.yml` |
| CI workflow | `Build macOS` — `.github/workflows/macos-build.yml` |
| CI artifact name | `tree-ide-macos-arm64` |
| Release files | `Tree-IDE-{version}-macOS-arm64.dmg`, `Tree-IDE-{version}-macOS-arm64.zip` |

## Project Structure

```text
src/
|-- main/                       # Electron main process, IPC, project/archive logic
|-- preload/                    # contextBridge API exposed to the renderer
|-- renderer/
|   |-- index.html              # HTML entry point
|   |-- main.js                 # Renderer bootstrap
|   |-- modules/                # Editor, tree, modals, build studio, tabs, etc.
|   |-- data/                   # Default file contents and starter templates
|   |-- css/                    # Modular stylesheets
|   |-- fonts/                  # Inter and JetBrains Mono fonts
|-- shared/                     # Shared helpers, i18n, updater logic
assets/                         # App icons
tests/                          # Vitest test files
build/                          # NSIS installer configuration
build-flatpak/                  # Flatpak packaging
docs/                           # Manual changelog, locale config, translated READMEs
scripts/                        # Build and CI helper scripts
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + arm64)
|   linux-build.yml             # Build Linux (x64 + arm64 + Flatpak)
|   macos-build.yml             # Build macOS (arm64 DMG + ZIP)
|   release-finalize.yml        # Localize changelogs and publish release
```

## License

Tree IDE is licensed under the [MIT License](LICENSE).

## Credits

Developed by [Mare](https://github.com/git-mare) and contributed by [Mark Elpher](https://github.com/markelpher) creating the v2 of Tree IDE.
