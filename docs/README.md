# Tree IDE

Tree IDE is a lightweight desktop app for designing project structures in text, previewing them as a visual tree, and generating folders, starter files, and ZIP archives in a few clicks.

![Tree IDE Interface](https://raw.githubusercontent.com/markelpher/TreeIDE-Deploy/main/assets/preview.png)

## Highlights

- **Live tree preview:** write a structure in plain text and see it rendered immediately.
- **Project generation:** create folders and files in a selected output directory.
- **ZIP export:** package the current structure as a ZIP after building or on demand.
- **Starter templates:** insert ready-made structures for Node.js, React, Python, MVC, and static sites.
- **File previews:** inspect generated starter content before building.
- **Validation:** catch bad indentation, duplicate names, invalid paths, and empty structures before writing files.
- **Smart icons:** show contextual icons for common folders, programming languages, media, archives, and config files.
- **English and Portuguese:** built-in interface translations with first-run language selection.
- **Themes and settings:** dark/light themes, build folder selection, and autosaved sessions.
- **Release notifications:** notify when a newer GitHub Release is available and open the installer download.

## Structure Syntax

Tree IDE reads a simple indentation-based format. Use tabs or groups of four spaces to nest items.

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

1. Write or paste a project structure in the editor.
2. Review the live tree preview and validation panel.
3. Choose a build folder in settings.
4. Click **Build** to create the structure.
5. Optionally export the same structure as a ZIP file.

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

Clone the repository:

```bash
git clone https://github.com/markelpher/TreeIDE-Deploy.git
cd TreeIDE-Deploy
```

Install dependencies:

```bash
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

Build the Windows installer:

```bash
npm run build
```

## Project Structure

```text
TreeIDE/
|-- assets/             # App icons and preview image
|-- docs/               # Documentation and license
|-- tests/              # Core parser/creator tests
|-- index.html          # Electron renderer shell
|-- main.js             # Electron main process and build IPC
|-- preload.js          # Safe renderer API bridge
|-- renderer.js         # Editor, preview, templates, validation, and UI logic
|-- styles.css          # Desktop app styles
|-- translations.js     # English and Portuguese strings
|-- treeCreator.js      # Folder/file creation logic
|-- treeParser.js       # Tree syntax parser
|-- zipCreator.js       # ZIP export logic
|-- package.json        # App metadata, scripts, and build config
`-- package-lock.json   # Dependency lockfile
```

## License

Tree IDE is licensed under the [MIT License](https://github.com/markelpher/TreeIDE-Deploy/blob/main/docs/LICENSE).

Developed by [Mare](https://github.com/git-mare) and [Mark Elpher](https://github.com/markelpher).
