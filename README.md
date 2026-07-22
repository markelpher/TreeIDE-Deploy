# Tree IDE

[Português (Brasil)](docs/README.pt-BR.md) · [Español](docs/README.es.md) · [Installation guide](docs/installation/installation.md)

![Tree IDE Interface](https://github.com/markelpher/treeide-deploy/blob/main/assets/previews/preview.png)

Tree IDE v2 is a full rewrite of the [original app](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Same core idea: design folder structures in text, preview them in real time, and generate projects. With a modular Vite + Electron architecture, richer tooling, and Windows-focused releases.

## Features

### Editor & tree
- **Live tree preview** with ASCII connectors, Lucide icons, collapsible folders, and active-file highlighting
- **Validation panel** — bad indentation, invalid names, duplicate siblings, unsafe paths, and empty structures; click a warning to jump to the line
- **Undo / redo** with up to 100 history states
- **Multi-project tabs** with modified indicators, scrollable tab bar, and drag-and-drop reorder
- **Per-project file editor tabs** — edit starter file contents before building, reorder tabs by dragging, and automatically close tabs for deleted files; Markdown live preview for `.md` files
- **Block indent / outdent** with Tab and Shift+Tab, plus smart Backspace for indentation blocks
- **Tree keyboard navigation** — arrow keys, Home, End, and Enter
- **Editor zoom** — `Ctrl++`, `Ctrl+-`, and `Ctrl+0`
- **Resizable panels** (editor, tree, file preview) with layout persisted across sessions

### Build Studio & output
- **Build Studio** — full-screen build flow with live tree preview, per-file content preview, stats, and output options
- **Three output modes** — create folder structure on disk, export a ZIP only, or export a `.tree` project file only
- **Combined outputs** — optionally export a ZIP alongside a folder build, and include the `.tree` file inside the archive
- **Content-aware build action** — when creating a structure with an additional ZIP, the action button identifies whether it will create a file, files, a folder, folders, or a combination, followed by `+ ZIP`
- **Pre-build inspection** — scan the target folder for existing structure, `.tree`, or ZIP files before writing
- **Conflict handling** — choose to skip or overwrite when files or folders already exist
- **Default starter content** for 68+ file types (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, and more)
- **i18n placeholders** in generated files (`{hello}`, `{lang}`, `{projectName}`, etc.)

### Archives & encryption
- **Tree IDE 1 file compatibility** — Tree IDE 1 is the first-generation `.tree` file format used by Tree IDE Legacy; its headerless UTF-8 files remain fully readable, including tab- and `...`-based indentation
- **ZIP export** with optional AES-256 password protection via 7-Zip
- **High-strength encrypted `.tree` projects** — TREEIDE2 uses authenticated AES-256-GCM with Argon2id (256 MiB, 4 passes, 4 lanes), while original Tree IDE Legacy plaintext files remain readable as the first-generation format
- **Explicit `.tree` password protection** — password fields stay visible but disabled until protection is selected; enabling it shows the unrecoverable-password warning and requires matching values before saving
- **Archive import** via file dialog or drag-and-drop: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, and `.7z`
- **Password prompts** for encrypted ZIP archives and encrypted `.tree` files
- **Load folder as structure** — scan an existing directory and turn it into editable tree text

### Templates
- **19 built-in starter templates** — Frontend (HTML, React, Vite), Stacks (Node.js, MVC, Python, PHP), Systems (Go, Java, Kotlin, Rust, Ruby, Swift, Dart), and Native (C, C++, C#)
- **Templates screen** — fullscreen three-column browser with built-in and custom tabs, inline structure editing, and live tree preview
- **Template search and favorites** — accent-insensitive filtering across built-in and custom templates, plus locally persisted favorites with an offline bundled star icon
- **Custom templates** — create blank, import from the current project, rename, edit file contents inline, export, or delete
- **Markdown template preview** — `.md` files show the editor and rendered document side by side, updating live while custom templates are edited
- **`.tree-template` files** — export and import shareable custom templates (JSON `treeide-template` v1)

### UI, i18n & session
- **Custom frameless window** with minimize, maximize, and close controls; menu bar (File, Edit, View, Window, About)
- **Welcome modal** on first run with language selection and grouped settings
- **Themes** — light, dark, and **System** (follows OS color scheme)
- **English, Portuguese (pt-BR), and Spanish** — interface translations plus main-process dialog translations
- **Structured problem reports** — enter the issue title, description, reproduction steps, and expected behavior in an auto-growing, localized form inside the app
- **GitHub label integration** — choose from the repository's live label list in the same custom dropdown used by the app; the localized issue draft opens with its title, Markdown body, and label already filled in for review
- **Privacy-first diagnostics** — save a local ZIP with allowlisted system/app metadata, sanitized renderer errors, and logs limited to the current app execution; project names and contents are excluded
- **Optional app-only screenshot** — capture only the Tree IDE window after explicit opt-in; the diagnostic ZIP, log, and screenshot remain local until you attach them manually
- **IndexedDB session storage** with autosave of open tabs, file contents, and project names
- **Session modes** — restore the last session on launch or always start clean
- **Bundled fonts** — Inter and JetBrains Mono; Lucide icons bundled locally (no CDN)
- **Command Palette** — use `Ctrl+Shift+P` to access 23 project, editing, tab navigation, build, view, update, and help actions; unavailable contextual tab commands are shown disabled
- **Accessibility improvements** — localized screen-reader labels, live result announcements, semantic listboxes and tabs, visible focus, and keyboard navigation for command and template workflows
- **Optional Rich Presence** — localized contextual editor/file/template/build/settings states, dedicated activity and idle icons, five-minute idle detection, automatic pause on lock or suspend, reconnect, and three privacy levels

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
6. Optionally protect the `.tree` file or ZIP archive with a password

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
| `Ctrl + Shift + P` | Open Command Palette |
| `Ctrl + Z` / `Ctrl + Y` | Undo / redo |
| `Ctrl + T` | New tab |
| `Ctrl + Tab` / `Ctrl + Shift + Tab` | Next / previous tab |
| `Ctrl + W` / `Ctrl + Shift + W` | Close project tab / close file tab |
| `Ctrl + Q` | Quit app |
| `Ctrl + R` | Reload app |
| `Ctrl + +` / `Ctrl + -` / `Ctrl + 0` | Zoom in / out / reset |
| `F11` | Toggle full screen |
| `Tab` / `Shift + Tab` | Increase / decrease indentation |

Shortcuts are fully configurable in **Settings → Shortcuts**.

## Rich Presence

Open **Settings → Rich Presence** and enable Rich Presence. The Tree IDE Discord application is already configured, and the Discord desktop app must be running. Presence starts as Idle and changes to Editing Structure only after direct interaction with the structure editor. Contextual states cover file preview, templates, settings, file creation, folder-structure creation, combined folder-and-file creation, and file export without exposing names, paths, formats, or encryption; each group uses a dedicated small icon while the Tree IDE logo remains the large image.

Choose Basic, Activity, or Detailed privacy; only Detailed may include the project name and file type. File paths and contents are never sent. After five minutes without interaction, Presence returns to Idle with its keyboard icon. It is cleared while Windows is locked or suspended and restored when the device resumes.

The Presence language follows the Tree IDE language by default, or it can be fixed to English, Portuguese, or Spanish independently. Discord receives one localized text payload, so every viewer sees the language selected by the Tree IDE user rather than an automatic translation based on each viewer's Discord language. Developers can override the bundled application ID with `TREEIDE_DISCORD_CLIENT_ID`.

Contextual Presence PNGs are versioned in `assets/discord-presence/` and can be recreated with `scripts/generate-discord-presence-icons.ps1`.

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/markelpher/treeide-deploy.git
cd TreeIDE
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

Build:

### Windows (x64)

```bash
npm run build
```

For an explicit Windows build:

```bash
npm run build:win
```

Tree IDE is Windows-only and supports x64. It provides NSIS setup and Portable packages. The NSIS installer supports per-user installation and silent automatic updates without administrator prompts.

Production builds keep the application code organized in a single integrity-validated `app.asar` package. Windows profile data remains separate from the executable, as expected for per-user applications. When Setup finds data from an existing installation, a manual install asks whether to keep it (the safe default) or delete settings, cache, logs, session, and update data. The uninstaller presents the same explicit choice.

The assisted manual installer and uninstaller show the data-retention choices. Silent updates started inside the app skip those pages and always retain data. The welcome setup appears on a fresh profile or after choosing to delete data, but not when existing data is retained.

The uninstaller uses the same localized assisted flow through its final **Finish** action.

| Windows identifier | Value |
| --- | --- |
| Application ID | `com.treeide.treeide` |
| Executable name | `Tree IDE` |
| Installer types | NSIS setup (x64), Portable (x64) |
| Installer languages | English (`en_US`), Portuguese (`pt_BR`), Spanish (`es_ES`) |
| Updater metadata | `latest.yml` (x64) |
| CI workflow | `Build Windows` — `.github/workflows/windows-build.yml` |
| CI artifact name | `tree-ide-windows-x64` |
| Release files | `Tree-IDE-Setup-{version}-win-x64.exe`, `Tree-IDE-Portable-{version}-win-x64.exe` |

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
|   previews/
|       preview.png             # README screenshots
|   discord-presence/           # Versioned contextual Discord Presence PNGs
|   icon.png                    # App icons
|   icon-no-bg.png
|   icon-no-bg.ico
tests/                          # Vitest test files
build/                          # NSIS installer configuration
docs/
|   changelog.md                # Manual English release notes (edit before tagging)
|   changelogs/
|       locales.json            # Locale config for CI translation
|       pt-br.md                # Brazilian Portuguese release notes (overwritten by Release Finalize)
|       es.md                   # Spanish release notes (overwritten by Release Finalize)
|   README.pt-BR.md             # Translated READMEs
|   README.es.md
|   installation/
|       installation.md         # Installation guide (English)
|       installation.pt-BR.md   # Installation guide (Portuguese)
|       installation.es.md      # Installation guide (Spanish)
scripts/                        # Build, changelog, CI, and Presence artwork scripts
.github/workflows/
|   windows-build.yml           # Build Windows x64 (NSIS + Portable)
|   release-finalize.yml        # Translate changelogs and publish release
```

## License

Tree IDE is licensed under the [MIT License](LICENSE).

## Credits

Developed by [Mare](https://github.com/git-mare) and contributed by [Mark Elpher](https://github.com/markelpher) creating the v2 of Tree IDE.
