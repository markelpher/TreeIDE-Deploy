## What's new in v2.0.114

Tree IDE v2 is a full rewrite and expansion of the original app [Tree IDE v1.0.0](https://github.com/TreeIDE/TreeIDE-Legacy/releases/tag/v1.0.0). Same core idea — design folder structures in plain text, preview them in real time, and generate projects — with a new architecture, richer tooling, and Windows-only releases.

### Added

#### Installation, storage & package protection
- **Explicit data retention choices** — manually installing over an existing Tree IDE version and uninstalling now present clear Keep or Delete options, with Keep selected by default
- **First-install aware Setup** — the data choice is skipped when no previous Tree IDE profile or updater data exists and does not interrupt silent automatic updates
- **Correct assisted data flow** — manual installs over an existing version and uninstall now display Keep/Delete choices; in-app silent updates skip the prompt and retain data
- **Welcome follows data choice** — onboarding appears for a fresh profile or after selecting Delete, while selecting Keep preserves the completed onboarding state
- **Correct uninstaller completion action** — the final page now labels its primary button as Finish instead of Next in English, Portuguese, and Spanish
- **Protected production package** — application code remains organized in `app.asar`, now with Electron ASAR integrity validation and loading restricted to the validated archive
- **Lean Windows x64 runtime** — removed the unused Squirrel packaging toolchain and non-Windows/non-x64 7-Zip binaries from distributed application files
- **Complete optional cleanup** — deleting data covers preferences, cache, logs, saved session, current and legacy profile folders, and updater data

#### Build Studio & project output
- **Build Studio** — full-screen build flow with live tree preview, per-file content preview, stats, and output options
- **Three output modes** — create folder structure on disk, export a ZIP only, or export a `.tree` project file only
- **Combined outputs** — optionally export a ZIP alongside a folder build, and include the `.tree` file inside the archive
- **Content-aware create-with-ZIP button** — combined folder-and-ZIP builds now label the action as Create File, Files, Folder, Folders, File and Folder, or Files and Folders followed by `+ ZIP`, based on the selected structure
- **Pre-build inspection** — scan the target folder for existing structure, `.tree`, or ZIP files before writing
- **Conflict handling** — choose to skip or overwrite when files or folders already exist
- **Default starter content** for 68+ file types (HTML, CSS, JS/TS/JSX/TSX, Python, Go, Rust, Docker, Terraform, Vue, Svelte, and more)
- **i18n placeholders** in generated files (`{hello}`, `{lang}`, `{projectName}`, etc.)

#### Archives & encryption
- **Tree IDE 1 file compatibility** — Tree IDE 1 identifies the first-generation `.tree` file format used by Tree IDE Legacy; original headerless UTF-8 files remain readable with both tab and `...` indentation styles
- **ZIP export** with optional AES-256 password protection via 7-Zip
- **High-strength encrypted `.tree` projects** — TREEIDE2 uses authenticated AES-256-GCM with Argon2id (256 MiB, 4 passes, 4 lanes), authenticates its cryptographic header, and keeps the original headerless Tree IDE Legacy format readable as generation 1
- **Explicit `.tree` protection** — a dedicated checkbox enables the otherwise disabled password and confirmation fields, explains that TREEIDE2 encryption will be applied, and shows the unrecoverable-password warning only while protection is selected
- **Archive import** via file dialog or drag-and-drop: `.tree`, `.zip`, `.tar.gz` / `.tgz` / `.tar`, `.rar`, and `.7z`
- **Password prompts** for encrypted ZIP archives and encrypted `.tree` files
- **Load folder as structure** — scan an existing directory and turn it into editable tree text

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
- **Template search** — filter built-in and custom templates as you type, with case- and accent-insensitive matching and localized empty-result feedback
- **Template favorites** — mark templates with a locally bundled Lucide star, browse them in a dedicated Favorites tab, and keep the selection across app sessions

#### Command Palette & accessibility
- **Expanded Command Palette** — use `Ctrl+Shift+P` to search 23 actions, adding Save All, Undo, Redo, New Tab, next/previous project tab, close project/file tab, Reload, zoom controls, Check for Updates, and About to the existing project, build, settings, fullscreen, and reporting commands
- **Context-aware commands** — Save All and project/file tab actions remain visible for discoverability but are disabled when the current session cannot execute them safely
- **Keyboard-first command flow** — Arrow keys change the active command, Enter runs it, Escape closes the palette, and focus returns to the previous control
- **Improved screen-reader support** — localized accessible names, semantic combobox/listbox/tab patterns, active-descendant tracking, live result counts, and clearer status announcements across commands and templates
- **Accessible template actions** — favorite, rename, edit, export, and delete controls expose localized labels and state through `aria-pressed`, `aria-selected`, and live regions

#### Rich Presence
- **Privacy-first default** — Discord Rich Presence now starts disabled, and its status bar, language, and privacy controls remain unavailable until the user explicitly enables the integration
- **Ready-to-use Discord RPC** — Tree IDE ships with its public Discord Application ID, automatically connects to the running desktop client, reports connection status, retries after disconnects, and requires no setup from the user
- **Specific activity states** — Editing Structure, Editing Code, Editing Text, Viewing File, Browsing Templates, Customizing Template, Settings, and build-aware Creating File, Creating Files, Creating Folder, Creating Folders, Creating File and Folder, or Creating Files and Folders states; the Build Studio option uses the same dynamic title and description, while `.tree` outputs remain available for valid flat projects and exports use one generic Exporting File state.
- **Editor-aware idle state** — Presence starts as Idle and only reports Editing Structure after direct interaction with the structure editor; five minutes without interaction returns to Idle with a keyboard icon
- **Three privacy levels** — Basic shows only Tree IDE, Activity adds the current action, and Detailed may also show the project name and file type; file paths and contents are never shared
- **Power-aware Presence** — lock and suspend clear the activity, while unlock and resume restore it automatically
- **Localized Presence** — follow the Tree IDE language or choose English, Portuguese, or Spanish independently; the setting updates the RPC immediately and persists between sessions
- **Localization scope explained** — Discord receives one localized activity payload, so every viewer sees the publisher's selected Presence language rather than a translation based on the viewer's Discord locale

#### Editor, tree & validation
- **Validation panel** — bad indentation, invalid names, duplicate siblings, unsafe paths, and empty structures; click a warning to jump to the line
- **Undo / redo** with up to 100 history states
- **Multi-project tabs** with modified indicators, a scrollable tab bar, and drag-and-drop reorder
- **Per-project file editor tabs** — edit starter file contents before building and reorder open files with drag and drop while preserving the active tab
- **Deleted-file tab synchronization** — removing files or changing extensions in the structure editor now closes every stale file tab, selects the nearest valid tab when needed, and prevents deleted content from reappearing
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
- **Clean first installed launch** — the app stays hidden until the restored interface has finished its first paint, while online release metadata loads in the background instead of exposing a frozen startup screen
- **Menu bar** — File, Edit, View, Window, and About
- **Welcome modal** on first run — redesigned layout with hero header, grouped setting cards (General, Appearance, Session), and a pinned **Get Started** button
- **Settings modal** with tabs: General, Appearance, Shortcuts, and Updates
- **About modal** with live app version (evolved from the v1 credits screen)
- **Unsaved-changes dialog** when closing with modified projects
- **Drag-and-drop overlay** for `.tree` files and archives
- **Bundled fonts** — Inter and JetBrains Mono

#### Privacy-first diagnostics & GitHub reports
- **Structured report form** — collect issue title, problem description, reproduction steps, and expected behavior in localized, auto-growing fields with character counters
- **Repository label selector** — load the current GitHub labels with an offline fallback, display them translated to the app's language, add the selected label to the title prefix, and preselect it in the GitHub draft
- **Clean localized issue draft** — open GitHub automatically after a visible redirect delay with the title, Markdown sections, and selected label already filled in for review; click the popup or press Enter/Space to hide the notice without changing the timer, and the issue is never submitted automatically
- **Current-execution logs** — include only log entries from the latest app launch, separated into main-process and renderer sections, capped at 256 KB, and stamped with a localized 12-hour time, day period, and timezone
- **Sanitized diagnostic package** — redact local paths, email addresses, IP addresses, and URL secrets while excluding project names and contents
- **Interactive screenshots** — after explicit opt-in, hide the issue form and capture a selected region or the full app window, keep taking screenshots with `Shift+P` even when the floating toolbar is collapsed, and automatically hide instructions and controls while dragging so they cannot cover the selected content
- **Screenshot review before saving** — collect up to 10 captures, open thumbnail previews at full size, remove unwanted images, and write every retained PNG to the local diagnostic ZIP; the desktop and other windows are never captured
- **Local-first attachments** — save the ZIP to the path chosen by the user without opening File Explorer or uploading it; logs and screenshots remain local until manually attached
- **Safer report modal** — text selection and dragging no longer dismiss the dialog, fields resize automatically, light/dark theme contrast follows the rest of the app, and the form resets after success, Cancel, or closing with the X button

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
- **Windows x64** — NSIS setup and Portable packages; multi-language installer (English, Portuguese, and Spanish)
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
