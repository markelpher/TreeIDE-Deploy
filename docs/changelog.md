## What's new in v2.0.88

Tree IDE v2 is a full rewrite and expansion of the original app ([Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE/releases/tag/v1.0.0)). Same core idea — design folder structures in plain text, preview them live, and generate projects — with a new architecture, richer tooling, and multi-platform releases.

### Added

#### Build Studio & project output
- **Build Studio** — full-screen build flow with live tree preview, per-file content preview, stats, and output options
- **Three output modes** — create folder structure on disk, export a ZIP only, or export a `.tree` project file only
- **Combined outputs** — optionally export a ZIP alongside a folder build, and include the `.tree` file inside the archive
- **Pre-build inspection** — scan the target folder for existing structure, `.tree`, or ZIP files before writing
- **Conflict handling** — choose to skip or overwrite when files or folders already exist
- **Default starter content** for 68+ file types (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, and more)
- **i18n placeholders** in generated files (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archives & encryption
- **ZIP export** with optional AES-256 password protection via 7-Zip
- **Encrypted `.tree` projects** (TREEIDE1 / TREEIDE2 format, AES-256-GCM + scrypt)
- **Archive import** via file dialog or drag-and-drop: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, and `.7z`
- **Password prompts** for encrypted ZIP archives and encrypted `.tree` files
- **Load folder as structure** — scan an existing directory and turn it into editable tree text
- **Windows ARM64 fallback** for 7-Zip when native binaries are unavailable

#### Templates
- **19 built-in starter templates** grouped by category:
  - Frontend: HTML, HTML & CSS, HTML/CSS/JS, React, Vite + React
  - Stacks: Node.js, MVC, Python, PHP
  - Systems: Go, Java, Kotlin, Rust, Ruby, Swift, Dart
  - Native: C, C++, C#
- **Templates screen** — fullscreen three-column browser with built-in and custom tabs, inline structure editing, and live tree preview
- **Custom templates** — create blank, import from the current project, rename, edit file contents inline, open in the main editor, export, or delete without leaving the screen
- **`.tree-template` files** — export and import shareable custom templates (JSON `treeide-template` v1) via native save/open dialogs or per-row export in the custom list
- **Custom templates footer** — when custom templates exist: **New template**, **From current project**, and **Import .tree-template**; empty state offers blank start, project import, and file import
- **Per-file preview** — clicking a file in the structure preview opens a full-width monospace editor panel with file-type badge (same single-pane layout for built-in and custom templates)

#### Editor, tree & validation
- **Validation panel** — bad indentation, invalid names, duplicate siblings, unsafe paths, and empty structures; click a warning to jump to the line
- **Undo / redo** with up to 100 history states
- **Multi-project tabs** with modified indicators, a scrollable tab bar, and drag-and-drop reorder
- **Per-project file preview tabs** — edit starter file contents before building
- **Markdown live preview** for `.md` files in the file preview panel
- **Collapsible folders** in the tree preview
- **Tree keyboard navigation** — arrow keys, Home, End, and Enter
- **Smart file rename matching** when tree lines are edited
- **Block indent / outdent** with Tab and Shift+Tab, plus smart Backspace for indentation blocks
- **Editor zoom** — `Ctrl++`, `Ctrl+-`, and `Ctrl+0`
- **Resizable panels** (editor, tree, file preview) with layout persisted across sessions

#### Icons & file types
- **Lucide icons** bundled locally (no CDN dependency)
- **Contextual icons** for common folders, programming languages, Docker, config files, archives, and media
- **100+ file extension labels** in the file-type map

#### UI & first-run experience
- **Custom frameless window** with minimize, maximize, and close controls
- **Menu bar** — File, Edit, View, Window, and About
- **Welcome modal** on first run — redesigned layout with hero header, grouped setting cards (General, Appearance, Session), and a pinned **Get Started** button
- **Settings modal** with tabs: General, Appearance, Shortcuts, and Updates
- **About modal** with live app version (evolved from the v1 credits screen)
- **Unsaved-changes dialog** when closing with modified projects
- **Drag-and-drop overlay** for `.tree` files and archives
- **Bundled fonts** — Inter and JetBrains Mono

#### Internationalization
- **English, Portuguese (pt-BR), and Spanish** interface translations
- **First-run language selection** in the welcome flow and settings
- **Main-process translations** for native dialogs and error messages
- **`npm run i18n:validate`** script to keep locale files in sync

#### Session persistence
- **IndexedDB session storage** with automatic migration from legacy `localStorage`
- **Autosave** of open tabs, file contents, and project names
- **Session modes** — restore the last session on launch or always start clean

#### Auto-updater & release notes
- **In-app auto-updater** — check GitHub Releases, download with progress, and restart to install
- **Stable and beta update channels**
- **Localized release notes** in the update modal (English, Portuguese, and Spanish)
- **Readable update changelog** — wider dialog, **What’s new** expanded by default, dedicated scroll area, clearer heading hierarchy, and action buttons pinned in the footer
- **Manual `docs/changelog.md` workflow** — edit release notes in the repo; CI translates them for the app and publishes English on GitHub
- **Split release notes** — app update modal shows changelog text only; locale navigation links appear in `docs/changelog.md` and on the GitHub release description (pointing to readable files in `docs/changelogs/`); the compare link (`Full Changelog`) is GitHub-only
- **GitHub Models translation** — Portuguese and Spanish release notes are generated in CI via the `models.github.ai` API

#### Keyboard shortcuts
- **Fully configurable shortcuts** with capture UI and restore-defaults action
- New defaults include `Ctrl+N`, `Ctrl+O`, `Ctrl+B` (build), `Ctrl+Z` / `Ctrl+Y`, `Ctrl+R`, `F11`, `Ctrl+T`, `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+W`, `Ctrl+Shift+W`, `Ctrl+Q`, `Ctrl+Alt+S` (save all), and editor zoom shortcuts

#### Platforms & distribution
- **Windows** — NSIS installer, MSI, and portable builds for x64 and ARM64; multi-language installer (English, Portuguese, and Spanish) with localized language-picker title
- **Linux** — AppImage, deb, rpm, tar.gz, and snap for x64 plus AppImage, deb, rpm, and tar.gz for ARM64; Flatpak builds (x86_64 and aarch64, runtime 25.08) with `zypak-wrapper` launcher
- **macOS** — DMG and ZIP for Apple Silicon (arm64)
- **GitHub Releases** published automatically on version tags from CI
- **Renderer build before pack** — `beforePack` runs `vite build` and validates `dist/renderer/` so every installer ships the UI bundle

#### Architecture, dev tooling & quality
- **Vite** renderer build with hot module replacement in development
- **Modular codebase** — `src/main/`, `src/preload/`, `src/renderer/modules/`, `src/shared/`, and 20 CSS modules
- **ES modules**, Node.js 24+, Electron 42
- **Split IPC handlers** for project, updates, and app lifecycle
- **`contextBridge` preload API** for a hardened renderer boundary
- **Vitest** test suite with Electron mocks for CI-friendly runs; changelog and updater error helpers covered by dedicated tests
- **ESLint and Prettier** integrated into npm scripts
- **electron-reloader** for main-process hot reload during development
- **Error log export** on crash for easier debugging
- **`semver`** as a direct dependency for reliable in-app version comparison