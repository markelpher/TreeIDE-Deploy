# Tree IDE

[Português](README.pt-BR.md)

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
- **English and Portuguese** — built-in interface translations with first-run language selection
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

Build for Windows:

```bash
npm run build
```

## Project Structure

```text
src/
|-- main/
|   |-- main.js                 # Electron main process, updater, and build IPC
|   |-- mainTranslations.js     # Main process translations
|   |-- tarCreator.js           # tar.gz export logic
|   |-- treeCreator.js          # Folder and file creation logic
|   |-- treeParser.js           # Tree syntax parser
|   |-- zipCreator.js           # ZIP export logic
|-- preload/
|   |-- preload.js              # Safe renderer API bridge via contextBridge
|-- renderer/
|   |-- index.html              # HTML entry point
|   |-- css/                    # 17 modular stylesheets
|   |-- fonts/                  # Inter and JetBrains Mono fonts
|   |-- js/                     # 21 JavaScript modules
|       |-- renderer.js         # Main renderer entry logic
|       |-- renderer-fileops.js # File open and save operations
|       |-- renderer-markdown.js# Markdown preview support
|       |-- renderer-modals.js  # Modal dialog logic
|       |-- renderer-shortcuts.js# Keyboard shortcut handling
|       |-- renderer-storage.js # Settings and localStorage
|       |-- renderer-templates.js# Template insertion UI
|       |-- renderer-toast.js   # Toast notification system
|       |-- renderer-tree.js    # Tree rendering and interaction
|       |-- renderer-undoredo.js# Undo and redo for tree edits
|       |-- renderer-validation.js# Tree structure validation
|       |-- tabs.js             # Tab management
|       |-- constants-defaults.js# Default values, themes, languages
|       |-- constants-templates.js# Starter project templates
|       |-- customSelect.js     # Custom select widget
|       |-- db-storage.js       # IndexedDB session persistence
|       |-- fileTypes.js        # File extension to icon mapping
|       |-- helpers.js          # Shared utility functions
|       |-- icons.js            # Lucide icon helpers
|       |-- lucide-local.js     # Bundled Lucide icon library
|       |-- translations.js     # English and Portuguese strings
|-- assets/                     # App icons and preview image
|-- tests/                      # Vitest test files
|-- build/                      # NSIS installer configuration
|-- build-flatpak/              # Flatpak packaging
|-- scripts/                    # Build and CI helper scripts
|-- package.json                # App metadata, scripts, and build config
```

## License

Tree IDE is licensed under the [MIT License](LICENSE).

## Credits

Developed by [Mare](https://github.com/git-mare) and contributed by [Mark Elpher](https://github.com/markelpher) creating the v2 of Tree IDE.
