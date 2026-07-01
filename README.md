# Tree IDE

[Português](docs/README.pt-BR.md) · [Español](docs/README.es.md)

A lightweight desktop app for designing project structures in plain text, previewing them as a visual tree, and generating folders, starter files, and archives through **Build Studio**.

![Tree IDE Interface](https://github.com/markelpher/TreeIDE-Deploy/blob/main/assets/preview/preview.png)

Tree IDE v2 is a full rewrite of the [original app](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0). Same core idea — design folder structures in text, preview them live, and generate projects — with a modular Vite + Electron architecture, richer tooling, and multi-platform releases.

## Features

### Editor & tree
- **Live tree preview** with ASCII connectors, Lucide icons, collapsible folders, and active-file highlighting
- **Validation panel** — bad indentation, invalid names, duplicate siblings, unsafe paths, and empty structures; click a warning to jump to the line
- **Undo / redo** with up to 100 history states
- **Multi-project tabs** with modified indicators, scrollable tab bar, and drag-and-drop reorder
- **Per-project file preview tabs** — edit starter file contents before building; Markdown live preview for `.md` files
- **Block indent / outdent** with Tab and Shift+Tab, plus smart Backspace for indentation blocks
- **Tree keyboard navigation** — arrow keys, Home, End, and Enter
- **Editor zoom** — `Ctrl++`, `Ctrl+-`, and `Ctrl+0`
- **Resizable panels** (editor, tree, file preview) with layout persisted across sessions

### Build Studio & output
- **Build Studio** — full-screen build flow with live tree preview, per-file content preview, stats, and output options
- **Three output modes** — create folder structure on disk, export a ZIP only, or export a `.tree` project file only
- **Combined outputs** — optionally export a ZIP alongside a folder build, and include the `.tree` file inside the archive
- **Pre-build inspection** — scan the target folder for existing structure, `.tree`, or ZIP files before writing
- **Conflict handling** — choose to skip or overwrite when files or folders already exist
- **Default starter content** for 68+ file types (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, and more)
- **i18n placeholders** in generated files (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Archives & encryption
- **ZIP export** with optional AES-256 password protection via 7-Zip
- **Encrypted `.tree` projects** (TREEIDE1 / TREEIDE2 format, AES-256-GCM + scrypt)
- **Archive import** via file dialog or drag-and-drop: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, and `.7z`
- **Password prompts** for encrypted ZIP archives and encrypted `.tree` files
- **Load folder as structure** — scan an existing directory and turn it into editable tree text

### Templates
- **19 built-in starter templates** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart), and Native (C, C++, C#)
- **Templates screen** — fullscreen three-column browser with built-in and custom tabs, inline structure editing, and live tree preview
- **Custom templates** — create blank, import from the current project, rename, edit file contents inline, export, or delete
- **`.tree-template` files** — export and import shareable custom templates (JSON `treeide-template` v1)

### UI, i18n & session
- **Custom frameless window** with minimize, maximize, and close controls; menu bar (File, Edit, View, Window, About)
- **Welcome modal** on first run with language selection and grouped settings
- **Themes** — light, dark, and **System** (follows OS color scheme)
- **English, Portuguese (pt-BR), and Spanish** — interface translations plus main-process dialog translations
- **IndexedDB session storage** with autosave of open tabs, file contents, and project names
- **Session modes** — restore the last session on launch or always start clean
- **Bundled fonts** — Inter and JetBrains Mono; Lucide icons bundled locally (no CDN)

### Auto-updater
- **In-app auto-updater** — check GitHub Releases, download with progress, and restart to install
- **Stable and beta update channels**
- **Localized release notes** in the update modal (English, Portuguese, and Spanish)
- Edit release notes in `docs/changelog.md`; CI translates them for the app and publishes English on GitHub

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

1. Write or paste a project structure in the editor (or start from **Templates**)
2. Review the live tree preview and validation panel
3. Customize starter file contents in per-file preview tabs if needed
4. Click **Build** to open **Build Studio**
5. Choose output mode (folder, ZIP, `.tree`, or combined) and confirm the target path
6. Optionally save the project as a `.tree` file or export an encrypted archive

You can also open existing `.tree` projects, archives, or folders via drag-and-drop or **File → Open**.

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + N` | New project |
| `Ctrl + O` | Open project |
| `Ctrl + S` | Save current `.tree` project |
| `Ctrl + Shift + S` | Save project as |
| `Ctrl + Alt + S` | Save all projects |
| `Ctrl + B` | Open Build Studio |
| `Ctrl + Z` / `Ctrl + Y` | Undo / redo |
| `Ctrl + T` | New tab |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Next / previous tab |
| `Ctrl + W` / `Ctrl + Shift + W` | Close tab / close all tabs |
| `Ctrl + Q` | Quit app |
| `Ctrl + R` | Reload app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Zoom in / out / reset |
| `F11` | Toggle full screen |
| `Tab` / `Shift + Tab` | Increase / decrease indentation |

Shortcuts are fully configurable in **Settings → Shortcuts**.

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

Validate locale files:

```bash
npm run i18n:validate
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
assets/
|   preview/
|       preview.png             # README screenshots
|   icon.png                    # App icons
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Vitest test files
build/                          # NSIS installer configuration
build-flatpak/                  # Flatpak packaging
docs/
|   changelog.md                # Manual English release notes (edit before tagging)
|   changelogs/
|       locales.json            # Locale config for CI translation
|       pt.md                   # Portuguese release notes (overwritten by Release Finalize)
|       es.md                   # Spanish release notes (overwritten by Release Finalize)
|   README.pt-BR.md             # Translated READMEs
|   README.es.md
scripts/                        # Build, changelog, and CI helper scripts
.github/workflows/
|   windows-build.yml           # Build Windows (x64 + arm64)
|   linux-build.yml             # Build Linux (x64 + arm64 + Flatpak)
|   macos-build.yml             # Build macOS (arm64 DMG + ZIP)
|   release-finalize.yml        # Translate changelogs and publish release
```

## License

Tree IDE is licensed under the [MIT License](LICENSE).

## Credits

Developed by [Mare](https://github.com/git-mare) and contributed by [Mark Elpher](https://github.com/markelpher) creating the v2 of Tree IDE.