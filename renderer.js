const editor = document.getElementById('editor');
const treeView = document.getElementById('treeView');
const filePreviewPanel = document.getElementById('filePreviewPanel');
const filePreviewEditor = document.getElementById('filePreviewEditor');
const filePreviewName = document.getElementById('filePreviewName');
const filePreviewMode = document.getElementById('filePreviewMode');
const markdownPreview = document.getElementById('markdownPreview');
const fileIcons = {};
const folderIcons = {};
const defaultProjectNames = ['Untitled', 'Sem Título'];

let currentFilePath = '';
let currentTree = {};
let lastSavedProjectName = '';
let isModified = false;
let installationId = localStorage.getItem('installation_id');
let buildFolderPath = localStorage.getItem('build_folder_path') || '';
let fileContents = {};
let activePreviewPath = '';

const defaultFileContentsByExtension = {
    html: `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Document</title>
    <link rel="icon" href="favicon.ico">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <main>
        <h1>Hello, Tree IDE</h1>
    </main>
    <script src="app.js"></script>
</body>
</html>
`,
    css: `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
}
`,
    js: `function main() {
    console.log('Hello from Tree IDE');
}

main();
`,
    mjs: `export function main() {
    console.log('Hello from Tree IDE');
}
`,
    ts: `function main(): void {
    console.log('Hello from Tree IDE');
}

main();
`,
    jsx: `export default function App() {
    return <h1>Hello, Tree IDE</h1>;
}
`,
    tsx: `export default function App() {
    return <h1>Hello, Tree IDE</h1>;
}
`,
    py: `def main():
    print("Hello from Tree IDE")


if __name__ == "__main__":
    main()
`,
    md: `# New Document

Write your content here.
`,
    markdown: `# New Document

Write your content here.
`,
    json: `{
  "name": "Tree IDE-project",
  "version": "1.0.0"
}
`,
    yml: `name: Tree IDE-project
`,
    yaml: `name: Tree IDE-project
`,
    sh: `#!/usr/bin/env sh

echo "Hello from Tree IDE"
`,
    bat: `@echo off
echo Hello from Tree IDE
`,
    ps1: `Write-Host "Hello from Tree IDE"
`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Tree IDE");
    }
}
`,
    c: `#include <stdio.h>

int main(void) {
    printf("Hello from Tree IDE\\n");
    return 0;
}
`,
    cpp: `#include <iostream>

int main() {
    std::cout << "Hello from Tree IDE\\n";
    return 0;
}
`,
    go: `package main

import "fmt"

func main() {
    fmt.Println("Hello from Tree IDE")
}
`,
    rs: `fn main() {
    println!("Hello from Tree IDE");
}
`,
    php: `<?php

echo "Hello from Tree IDE";
`
};

const templates = {
    node: {
        label: 'Node.js',
        tree: `app/
    src/
        index.js
        config.js
    tests/
        app.test.js
    package.json
    README.md
    .gitignore`,
        files: {
            'app/src/index.js': `const { appName, port } = require('./config');

function start() {
    console.log(\`\${appName} running on port \${port}\`);
}

start();
`,
            'app/src/config.js': `module.exports = {
    appName: 'Tree IDE Node App',
    port: process.env.PORT || 3000
};
`,
            'app/tests/app.test.js': `const assert = require('assert');

assert.strictEqual(1 + 1, 2);
`,
            'app/package.json': `{
  "name": "Tree IDE-node-app",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "node tests/app.test.js"
  }
}
`,
            'app/README.md': `# Tree IDE Node App

Generated with Tree IDE.
`,
            'app/.gitignore': `node_modules/
.env
dist/
`
        }
    },
    react: {
        label: 'React',
        tree: `react-app/
    src/
        App.jsx
        main.jsx
        styles.css
    public/
        index.html
        favicon.ico
    package.json
    README.md`,
        files: {
            'react-app/src/App.jsx': `export default function App() {
    return (
        <main className="app">
            <h1>Tree IDE React App</h1>
            <p>Edit this component to start building.</p>
        </main>
    );
}
`,
            'react-app/src/main.jsx': `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
`,
            'react-app/src/styles.css': `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
}

.app {
    min-height: 100vh;
    display: grid;
    place-items: center;
}
`,
            'react-app/public/index.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tree IDE React App</title>
    <link rel="icon" href="/favicon.ico">
</head>
<body>
    <div id="root"></div>
</body>
</html>
`,
            'react-app/public/favicon.ico': '',
            'react-app/package.json': `{
  "name": "Tree IDE-react-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {}
}
`,
            'react-app/README.md': `# Tree IDE React App

Run \`npm install\` and \`npm run dev\`.
`
        }
    },
    python: {
        label: 'Python',
        tree: `python-app/
    src/
        main.py
        __init__.py
    tests/
        test_main.py
    requirements.txt
    README.md`,
        files: {
            'python-app/src/main.py': `def greet(name: str = "Tree IDE") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())
`,
            'python-app/src/__init__.py': `from .main import greet
`,
            'python-app/tests/test_main.py': `from src.main import greet


def test_greet():
    assert greet("World") == "Hello, World!"
`,
            'python-app/requirements.txt': `pytest
`,
            'python-app/README.md': `# Tree IDE Python App

Run tests with \`pytest\`.
`
        }
    },
    html: {
        label: 'HTML',
        tree: `site/
    index.html
    assets/
        favicon.ico`,
        files: {
            'site/index.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tree IDE Site</title>
    <link rel="icon" href="assets/favicon.ico">
</head>
<body>
    <main>
        <h1>Tree IDE Site</h1>
        <p>Start editing your new page.</p>
    </main>
</body>
</html>
`,
            'site/assets/favicon.ico': ''
        }
    },
    htmlCss: {
        label: 'HTML CSS',
        tree: `site/
    index.html
    styles/
        styles.css
    assets/
        favicon.ico`,
        files: {
            'site/index.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tree IDE Site</title>
    <link rel="icon" href="assets/favicon.ico">
    <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
    <main>
        <h1>Tree IDE Site</h1>
        <p>Start editing your new page.</p>
    </main>
</body>
</html>
`,
            'site/styles/styles.css': `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
    background: #111;
    color: #f4f4f4;
}

main {
    min-height: 100vh;
    display: grid;
    place-items: center;
}
`,
            'site/assets/favicon.ico': ''
        }
    },
    cssJavascript: {
        label: 'HTML CSS JAVASCRIPT',
        tree: `site/
    index.html
    styles/
        styles.css
    scripts/
        app.js
    assets/
        favicon.ico
        images/`,
        files: {
            'site/index.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tree IDE Site</title>
    <link rel="icon" href="assets/favicon.ico">
    <link rel="stylesheet" href="styles/styles.css">
</head>
<body>
    <main>
        <h1>Tree IDE Site</h1>
        <p>Start editing your new page.</p>
    </main>
    <script src="scripts/app.js"></script>
</body>
</html>
`,
            'site/styles/styles.css': `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
    background: #111;
    color: #f4f4f4;
}

main {
    min-height: 100vh;
    display: grid;
    place-items: center;
}
`,
            'site/scripts/app.js': `console.log('Tree IDE site ready');
`,
            'site/assets/favicon.ico': ''
        }
    },
    mvc: {
        label: 'MVC',
        tree: `mvc-app/
    src/
        app.js
        server.js
        controllers/
            homeController.js
            userController.js
        models/
            userModel.js
        routes/
            index.js
            userRoutes.js
        views/
            home.html
            users.html
        public/
            styles.css
            favicon.ico
    tests/
        userModel.test.js
    package.json
    README.md
    .gitignore`,
        files: {
            'mvc-app/src/app.js': `const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.static('src/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', routes);

module.exports = app;
`,
            'mvc-app/src/server.js': `const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(\`MVC app running at http://localhost:\${port}\`);
});
`,
            'mvc-app/src/controllers/homeController.js': `const path = require('path');

function index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
}

module.exports = { index };
`,
            'mvc-app/src/controllers/userController.js': `const path = require('path');
const userModel = require('../models/userModel');

function list(req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'users.html'));
}

function apiList(req, res) {
    res.json(userModel.findAll());
}

module.exports = { list, apiList };
`,
            'mvc-app/src/models/userModel.js': `const users = [
    { id: 1, name: 'Ada Lovelace', role: 'Admin' },
    { id: 2, name: 'Grace Hopper', role: 'Developer' }
];

function findAll() {
    return users;
}

function findById(id) {
    return users.find(user => user.id === Number(id));
}

module.exports = { findAll, findById };
`,
            'mvc-app/src/routes/index.js': `const router = require('express').Router();
const homeController = require('../controllers/homeController');
const userRoutes = require('./userRoutes');

router.get('/', homeController.index);
router.use('/users', userRoutes);

module.exports = router;
`,
            'mvc-app/src/routes/userRoutes.js': `const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/', userController.list);
router.get('/api', userController.apiList);

module.exports = router;
`,
            'mvc-app/src/views/home.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>MVC App</title>
    <link rel="icon" href="/favicon.ico">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <main>
        <h1>MVC App</h1>
        <p>A small Model-View-Controller starter.</p>
        <a href="/users">View users</a>
    </main>
</body>
</html>
`,
            'mvc-app/src/views/users.html': `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Users</title>
    <link rel="icon" href="/favicon.ico">
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <main>
        <h1>Users</h1>
        <p>Fetch JSON data from <code>/users/api</code>.</p>
        <a href="/">Back home</a>
    </main>
</body>
</html>
`,
            'mvc-app/src/public/styles.css': `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
    background: #111;
    color: #f4f4f4;
}

main {
    max-width: 720px;
    margin: 0 auto;
    padding: 64px 24px;
}

a {
    color: #8ab4ff;
}
`,
            'mvc-app/src/public/favicon.ico': '',
            'mvc-app/tests/userModel.test.js': `const assert = require('assert');
const userModel = require('../src/models/userModel');

assert.strictEqual(userModel.findAll().length, 2);
assert.strictEqual(userModel.findById(1).name, 'Ada Lovelace');
`,
            'mvc-app/package.json': `{
  "name": "Tree IDE-mvc-app",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "test": "node tests/userModel.test.js"
  },
  "dependencies": {
    "express": "latest"
  }
}
`,
            'mvc-app/README.md': `# Tree IDE MVC App

This starter follows a simple MVC structure:

- **Models** hold data access.
- **Views** hold HTML.
- **Controllers** coordinate requests.
- **Routes** map URLs to controllers.

Run:

\`\`\`bash
npm install
npm start
\`\`\`
`,
            'mvc-app/.gitignore': `node_modules/
.env
dist/
`
        }
    }
};

editor.addEventListener('keydown', function(e) {
    if (e.key === "Tab") {
        e.preventDefault();

        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;

        // Get the lines affected by the selection
        const startLineIndex = value.lastIndexOf('\n', start - 1) + 1;
        const endLineIndex = value.indexOf('\n', end);
        const actualEnd = endLineIndex === -1 ? value.length : endLineIndex;
        
        const selectionBefore = value.substring(0, startLineIndex);
        const selectionContent = value.substring(startLineIndex, actualEnd);
        const selectionAfter = value.substring(actualEnd);

        const lines = selectionContent.split('\n');
        let newLines = [];
        let totalOffsetStart = 0;
        let totalOffsetEnd = 0;

        if (e.shiftKey) {
            // Outdent
            newLines = lines.map((line, index) => {
                let removed = 0;
                let newLine = line;
                if (line.startsWith('\t')) {
                    newLine = line.slice(1);
                    removed = 1;
                } else if (line.startsWith('    ')) {
                    newLine = line.slice(4);
                    removed = 4;
                }

                if (index === 0) totalOffsetStart -= removed;
                totalOffsetEnd -= removed;
                return newLine;
            });
        } else {
            // Indent
            newLines = lines.map((line, index) => {
                if (index === 0) totalOffsetStart += 1;
                totalOffsetEnd += 1;
                return '\t' + line;
            });
        }

        this.value = selectionBefore + newLines.join('\n') + selectionAfter;
        
        // Adjust selection
        this.selectionStart = Math.max(startLineIndex, start + totalOffsetStart);
        this.selectionEnd = end + totalOffsetEnd;

        isModified = true;
        
        // update tree
        currentTree = parseEditorContent(this.value);
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        refreshIcons();
        updateValidationPanel();
    }
});

function insertTabInTextarea(textarea, e) {
    if (e.key !== 'Tab') return;

    e.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const selected = value.slice(start, end);

    if (selected.includes('\n')) {
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const blockEnd = value.indexOf('\n', end);
        const actualEnd = blockEnd === -1 ? value.length : blockEnd;
        const block = value.slice(lineStart, actualEnd);
        const lines = block.split('\n');
        const updatedLines = e.shiftKey
            ? lines.map(line => line.startsWith('\t') ? line.slice(1) : line.replace(/^ {1,4}/, ''))
            : lines.map(line => `\t${line}`);

        textarea.value = value.slice(0, lineStart) + updatedLines.join('\n') + value.slice(actualEnd);
        textarea.selectionStart = lineStart;
        textarea.selectionEnd = lineStart + updatedLines.join('\n').length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
    }

    if (e.shiftKey) return;

    textarea.value = value.slice(0, start) + '\t' + value.slice(end);
    textarea.selectionStart = textarea.selectionEnd = start + 1;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}



function getIconDetails(name, isFolder) {
    if (isFolder) {
        return { icon: 'folder', class: 'tree-icon-folder' };
    }

    const lowerName = name.toLowerCase();
    const ext = name.split('.').pop().toLowerCase();

    // Specific Filenames (Priority)
    const fileMap = {
        'makefile': { icon: 'settings', class: 'tree-icon-default' },
        'dockerfile': { icon: 'settings', class: 'tree-icon-default' },
        'docker-compose.yml': { icon: 'settings', class: 'tree-icon-default' },
        'docker-compose.yaml': { icon: 'settings', class: 'tree-icon-default' },
        'package.json': { icon: 'file-json', class: 'tree-icon-json' },
        'package-lock.json': { icon: 'lock', class: 'tree-icon-default' },
        'composer.json': { icon: 'file-json', class: 'tree-icon-json' },
        'composer.lock': { icon: 'lock', class: 'tree-icon-default' },
        'pnpm-lock.yaml': { icon: 'lock', class: 'tree-icon-default' },
        'pnpm-workspace.yaml': { icon: 'settings', class: 'tree-icon-default' },
        'bun.lockb': { icon: 'lock', class: 'tree-icon-default' },
        'bunfig.toml': { icon: 'settings', class: 'tree-icon-default' },
        'deno.json': { icon: 'file-json', class: 'tree-icon-json' },
        'deno.jsonc': { icon: 'file-json', class: 'tree-icon-json' },
        'gemfile': { icon: 'file-code', class: 'tree-icon-code' },
        'rakefile': { icon: 'file-code', class: 'tree-icon-code' },
        'procfile': { icon: 'settings', class: 'tree-icon-default' },
        'go.mod': { icon: 'settings', class: 'tree-icon-default' },
        'go.sum': { icon: 'lock', class: 'tree-icon-default' },
        'cargo.toml': { icon: 'settings', class: 'tree-icon-default' },
        'cargo.lock': { icon: 'lock', class: 'tree-icon-default' },
        'webpack.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'webpack.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'vite.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'vite.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'next.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'next.config.mjs': { icon: 'settings', class: 'tree-icon-default' },
        'tailwind.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'tailwind.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'tsconfig.json': { icon: 'file-json', class: 'tree-icon-json' },
        '.gitignore': { icon: 'settings', class: 'tree-icon-default' },
        '.gitattributes': { icon: 'settings', class: 'tree-icon-default' },
        '.editorconfig': { icon: 'settings', class: 'tree-icon-default' },
        '.env': { icon: 'settings', class: 'tree-icon-default' },
        '.env.local': { icon: 'settings', class: 'tree-icon-default' },
        '.env.development': { icon: 'settings', class: 'tree-icon-default' },
        '.env.production': { icon: 'settings', class: 'tree-icon-default' },
        '.env.example': { icon: 'settings', class: 'tree-icon-default' },
    };

    if (fileMap[lowerName]) return fileMap[lowerName];

    const map = {

        // Programming Languages & Scripts
        'js': { icon: 'file-code', class: 'tree-icon-code' },
        'mjs': { icon: 'file-code', class: 'tree-icon-code' },
        'cjs': { icon: 'file-code', class: 'tree-icon-code' },
        'ts': { icon: 'file-code', class: 'tree-icon-code' },
        'mts': { icon: 'file-code', class: 'tree-icon-code' },
        'cts': { icon: 'file-code', class: 'tree-icon-code' },
        'jsx': { icon: 'file-code', class: 'tree-icon-code' },
        'tsx': { icon: 'file-code', class: 'tree-icon-code' },
        'py': { icon: 'file-code', class: 'tree-icon-code' },
        'pyw': { icon: 'file-code', class: 'tree-icon-code' },
        'pyc': { icon: 'file-code', class: 'tree-icon-code' },
        'ipynb': { icon: 'file-code', class: 'tree-icon-code' },
        'java': { icon: 'file-code', class: 'tree-icon-code' },
        'class': { icon: 'file-code', class: 'tree-icon-code' },
        'jar': { icon: 'archive', class: 'tree-icon-archive' },
        'c': { icon: 'file-code', class: 'tree-icon-code' },
        'cpp': { icon: 'file-code', class: 'tree-icon-code' },
        'cc': { icon: 'file-code', class: 'tree-icon-code' },
        'cxx': { icon: 'file-code', class: 'tree-icon-code' },
        'h': { icon: 'file-code', class: 'tree-icon-code' },
        'hpp': { icon: 'file-code', class: 'tree-icon-code' },
        'hh': { icon: 'file-code', class: 'tree-icon-code' },
        'hxx': { icon: 'file-code', class: 'tree-icon-code' },
        'cs': { icon: 'file-code', class: 'tree-icon-code' },
        'fs': { icon: 'file-code', class: 'tree-icon-code' },
        'fsx': { icon: 'file-code', class: 'tree-icon-code' },
        'fsi': { icon: 'file-code', class: 'tree-icon-code' },
        'go': { icon: 'file-code', class: 'tree-icon-code' },
        'mod': { icon: 'settings', class: 'tree-icon-default' },
        'sum': { icon: 'lock', class: 'tree-icon-default' },
        'rs': { icon: 'file-code', class: 'tree-icon-code' },
        'rb': { icon: 'file-code', class: 'tree-icon-code' },
        'php': { icon: 'file-code', class: 'tree-icon-code' },
        'phtml': { icon: 'file-code', class: 'tree-icon-code' },
        'swift': { icon: 'file-code', class: 'tree-icon-code' },
        'kt': { icon: 'file-code', class: 'tree-icon-code' },
        'kts': { icon: 'file-code', class: 'tree-icon-code' },
        'dart': { icon: 'file-code', class: 'tree-icon-code' },
        'lua': { icon: 'file-code', class: 'tree-icon-code' },
        'zig': { icon: 'file-code', class: 'tree-icon-code' },
        'nim': { icon: 'file-code', class: 'tree-icon-code' },
        'mojo': { icon: 'file-code', class: 'tree-icon-code' },
        'carbon': { icon: 'file-code', class: 'tree-icon-code' },
        'gleam': { icon: 'file-code', class: 'tree-icon-code' },
        'odin': { icon: 'file-code', class: 'tree-icon-code' },
        'sol': { icon: 'file-code', class: 'tree-icon-code' },
        'move': { icon: 'file-code', class: 'tree-icon-code' },
        'grain': { icon: 'file-code', class: 'tree-icon-code' },
        'v': { icon: 'file-code', class: 'tree-icon-code' },
        'sh': { icon: 'file-code', class: 'tree-icon-code' },
        'bash': { icon: 'file-code', class: 'tree-icon-code' },
        'zsh': { icon: 'file-code', class: 'tree-icon-code' },
        'fish': { icon: 'file-code', class: 'tree-icon-code' },
        'bat': { icon: 'file-code', class: 'tree-icon-code' },
        'cmd': { icon: 'file-code', class: 'tree-icon-code' },
        'ps1': { icon: 'file-code', class: 'tree-icon-code' },
        'r': { icon: 'file-code', class: 'tree-icon-code' },
        'rmd': { icon: 'file-text', class: 'tree-icon-text' },
        'jl': { icon: 'file-code', class: 'tree-icon-code' },
        'scala': { icon: 'file-code', class: 'tree-icon-code' },
        'sc': { icon: 'file-code', class: 'tree-icon-code' },
        'pl': { icon: 'file-code', class: 'tree-icon-code' },
        'pm': { icon: 'file-code', class: 'tree-icon-code' },
        't': { icon: 'file-code', class: 'tree-icon-code' },
        'erl': { icon: 'file-code', class: 'tree-icon-code' },
        'hrl': { icon: 'file-code', class: 'tree-icon-code' },
        'ex': { icon: 'file-code', class: 'tree-icon-code' },
        'exs': { icon: 'file-code', class: 'tree-icon-code' },
        'leex': { icon: 'file-code', class: 'tree-icon-code' },
        'heex': { icon: 'file-code', class: 'tree-icon-code' },
        'clj': { icon: 'file-code', class: 'tree-icon-code' },
        'cljs': { icon: 'file-code', class: 'tree-icon-code' },
        'cljc': { icon: 'file-code', class: 'tree-icon-code' },
        'edn': { icon: 'file-json', class: 'tree-icon-json' },
        'elm': { icon: 'file-code', class: 'tree-icon-code' },
        'hs': { icon: 'file-code', class: 'tree-icon-code' },
        'lhs': { icon: 'file-code', class: 'tree-icon-code' },
        'prisma': { icon: 'file-code', class: 'tree-icon-code' },
        'graphql': { icon: 'file-code', class: 'tree-icon-code' },
        'gql': { icon: 'file-code', class: 'tree-icon-code' },
        'asm': { icon: 'file-code', class: 'tree-icon-code' },
        's': { icon: 'file-code', class: 'tree-icon-code' },
        'v': { icon: 'file-code', class: 'tree-icon-code' },
        'vhdl': { icon: 'file-code', class: 'tree-icon-code' },
        'vhd': { icon: 'file-code', class: 'tree-icon-code' },
        'sv': { icon: 'file-code', class: 'tree-icon-code' },
        'pas': { icon: 'file-code', class: 'tree-icon-code' },
        'pp': { icon: 'file-code', class: 'tree-icon-code' },
        'lisp': { icon: 'file-code', class: 'tree-icon-code' },
        'lsp': { icon: 'file-code', class: 'tree-icon-code' },
        'scm': { icon: 'file-code', class: 'tree-icon-code' },
        'rkt': { icon: 'file-code', class: 'tree-icon-code' },
        'cl': { icon: 'file-code', class: 'tree-icon-code' },
        'fortran': { icon: 'file-code', class: 'tree-icon-code' },
        'f': { icon: 'file-code', class: 'tree-icon-code' },
        'f90': { icon: 'file-code', class: 'tree-icon-code' },
        'f95': { icon: 'file-code', class: 'tree-icon-code' },
        'f03': { icon: 'file-code', class: 'tree-icon-code' },
        'f08': { icon: 'file-code', class: 'tree-icon-code' },
        
        // Databases
        'sql': { icon: 'database', class: 'tree-icon-default' },
        'db': { icon: 'database', class: 'tree-icon-default' },
        'sqlite': { icon: 'database', class: 'tree-icon-default' },
        'sqlite3': { icon: 'database', class: 'tree-icon-default' },
        'db3': { icon: 'database', class: 'tree-icon-default' },
        's3db': { icon: 'database', class: 'tree-icon-default' },
        'sl3': { icon: 'database', class: 'tree-icon-default' },
        'psql': { icon: 'database', class: 'tree-icon-default' },
        'plsql': { icon: 'database', class: 'tree-icon-default' },
        'tsql': { icon: 'database', class: 'tree-icon-default' },
        'mysql': { icon: 'database', class: 'tree-icon-default' },
        'mongodb': { icon: 'database', class: 'tree-icon-default' },
        'mongo': { icon: 'database', class: 'tree-icon-default' },
        'redis': { icon: 'database', class: 'tree-icon-default' },
        'cassandra': { icon: 'database', class: 'tree-icon-default' },
        'couchdb': { icon: 'database', class: 'tree-icon-default' },
        'neo4j': { icon: 'database', class: 'tree-icon-default' },
        'surreal': { icon: 'database', class: 'tree-icon-default' },
        'parquet': { icon: 'database', class: 'tree-icon-default' },
        'avro': { icon: 'database', class: 'tree-icon-default' },
        'proto': { icon: 'file-code', class: 'tree-icon-code' },

        // Web & Styling
        'html': { icon: 'file-code', class: 'tree-icon-code' },
        'htm': { icon: 'file-code', class: 'tree-icon-code' },
        'xhtml': { icon: 'file-code', class: 'tree-icon-code' },
        'css': { icon: 'file-code', class: 'tree-icon-code' },
        'scss': { icon: 'file-code', class: 'tree-icon-code' },
        'sass': { icon: 'file-code', class: 'tree-icon-code' },
        'less': { icon: 'file-code', class: 'tree-icon-code' },
        'postcss': { icon: 'file-code', class: 'tree-icon-code' },
        'pcss': { icon: 'file-code', class: 'tree-icon-code' },
        'json': { icon: 'file-json', class: 'tree-icon-json' },
        'json5': { icon: 'file-json', class: 'tree-icon-json' },
        'jsonc': { icon: 'file-json', class: 'tree-icon-json' },
        'svg': { icon: 'image', class: 'tree-icon-image' },
        'vue': { icon: 'file-code', class: 'tree-icon-code' },
        'svelte': { icon: 'file-code', class: 'tree-icon-code' },
        'astro': { icon: 'file-code', class: 'tree-icon-code' },
        'wasm': { icon: 'box', class: 'tree-icon-default' },
        'twig': { icon: 'file-code', class: 'tree-icon-code' },
        'liquid': { icon: 'file-code', class: 'tree-icon-code' },
        'hbs': { icon: 'file-code', class: 'tree-icon-code' },
        'handlebars': { icon: 'file-code', class: 'tree-icon-code' },
        'ejs': { icon: 'file-code', class: 'tree-icon-code' },
        'pug': { icon: 'file-code', class: 'tree-icon-code' },
        'haml': { icon: 'file-code', class: 'tree-icon-code' },
        
        // Docs & Data
        'md': { icon: 'file-text', class: 'tree-icon-text' },
        'markdown': { icon: 'file-text', class: 'tree-icon-text' },
        'mdx': { icon: 'file-text', class: 'tree-icon-text' },
        'txt': { icon: 'file-text', class: 'tree-icon-text' },
        'pdf': { icon: 'file-text', class: 'tree-icon-text' },
        'csv': { icon: 'file-text', class: 'tree-icon-text' },
        'tsv': { icon: 'file-text', class: 'tree-icon-text' },
        'yaml': { icon: 'settings', class: 'tree-icon-default' },
        'yml': { icon: 'settings', class: 'tree-icon-default' },
        'toml': { icon: 'settings', class: 'tree-icon-default' },
        'xml': { icon: 'file-code', class: 'tree-icon-code' },
        'ini': { icon: 'settings', class: 'tree-icon-default' },
        'cfg': { icon: 'settings', class: 'tree-icon-default' },
        'conf': { icon: 'settings', class: 'tree-icon-default' },
        'env': { icon: 'settings', class: 'tree-icon-default' },
        'gitignore': { icon: 'settings', class: 'tree-icon-default' },
        'gitattributes': { icon: 'settings', class: 'tree-icon-default' },
        'editorconfig': { icon: 'settings', class: 'tree-icon-default' },
        'dockerfile': { icon: 'settings', class: 'tree-icon-default' },
        'dockerignore': { icon: 'settings', class: 'tree-icon-default' },
        'doc': { icon: 'file-text', class: 'tree-icon-text' },
        'docx': { icon: 'file-text', class: 'tree-icon-text' },
        'xls': { icon: 'file-text', class: 'tree-icon-text' },
        'xlsx': { icon: 'file-text', class: 'tree-icon-text' },
        'ppt': { icon: 'file-text', class: 'tree-icon-text' },
        'pptx': { icon: 'file-text', class: 'tree-icon-text' },
        'log': { icon: 'file-text', class: 'tree-icon-text' },

        // Media
        'png': { icon: 'image', class: 'tree-icon-image' },
        'jpg': { icon: 'image', class: 'tree-icon-image' },
        'jpeg': { icon: 'image', class: 'tree-icon-image' },
        'gif': { icon: 'image', class: 'tree-icon-image' },
        'webp': { icon: 'image', class: 'tree-icon-image' },
        'avif': { icon: 'image', class: 'tree-icon-image' },
        'ico': { icon: 'image', class: 'tree-icon-image' },
        'bmp': { icon: 'image', class: 'tree-icon-image' },
        'tiff': { icon: 'image', class: 'tree-icon-image' },
        'psd': { icon: 'image', class: 'tree-icon-image' },
        'ai': { icon: 'image', class: 'tree-icon-image' },
        'xd': { icon: 'image', class: 'tree-icon-image' },
        'fig': { icon: 'image', class: 'tree-icon-image' },
        'sketch': { icon: 'image', class: 'tree-icon-image' },
        'mp3': { icon: 'music', class: 'tree-icon-audio' },
        'wav': { icon: 'music', class: 'tree-icon-audio' },
        'flac': { icon: 'music', class: 'tree-icon-audio' },
        'm4a': { icon: 'music', class: 'tree-icon-audio' },
        'ogg': { icon: 'music', class: 'tree-icon-audio' },
        'aac': { icon: 'music', class: 'tree-icon-audio' },
        'mp4': { icon: 'video', class: 'tree-icon-video' },
        'mov': { icon: 'video', class: 'tree-icon-video' },
        'webm': { icon: 'video', class: 'tree-icon-video' },
        'avi': { icon: 'video', class: 'tree-icon-video' },
        'mkv': { icon: 'video', class: 'tree-icon-video' },
        'wmv': { icon: 'video', class: 'tree-icon-video' },
        
        // Archives
        'zip': { icon: 'archive', class: 'tree-icon-archive' },
        'rar': { icon: 'archive', class: 'tree-icon-archive' },
        '7z': { icon: 'archive', class: 'tree-icon-archive' },
        'tar': { icon: 'archive', class: 'tree-icon-archive' },
        'gz': { icon: 'archive', class: 'tree-icon-archive' },
        'bz2': { icon: 'archive', class: 'tree-icon-archive' },
        'xz': { icon: 'archive', class: 'tree-icon-archive' },
        'lz': { icon: 'archive', class: 'tree-icon-archive' },
        'lzma': { icon: 'archive', class: 'tree-icon-archive' },
        'dmg': { icon: 'archive', class: 'tree-icon-archive' },
        'iso': { icon: 'archive', class: 'tree-icon-archive' },
        'vhd': { icon: 'archive', class: 'tree-icon-archive' },
        'bin': { icon: 'box', class: 'tree-icon-default' },
        'cue': { icon: 'box', class: 'tree-icon-default' },

        // Others
        'exe': { icon: 'box', class: 'tree-icon-default' },
        'msi': { icon: 'box', class: 'tree-icon-default' },
        'dll': { icon: 'box', class: 'tree-icon-default' },
        'so': { icon: 'box', class: 'tree-icon-default' },
        'o': { icon: 'box', class: 'tree-icon-default' },
        'obj': { icon: 'box', class: 'tree-icon-default' },
        'lock': { icon: 'lock', class: 'tree-icon-default' },
        'key': { icon: 'lock', class: 'tree-icon-default' },
        'pem': { icon: 'lock', class: 'tree-icon-default' },
        'crt': { icon: 'lock', class: 'tree-icon-default' },
        'p12': { icon: 'lock', class: 'tree-icon-default' },
        'pfx': { icon: 'lock', class: 'tree-icon-default' },



        // Others
        'exe': { icon: 'box', class: 'tree-icon-default' },
        'dll': { icon: 'box', class: 'tree-icon-default' },
        'lock': { icon: 'lock', class: 'tree-icon-default' },
    };

    return map[ext] || { icon: 'file', class: 'tree-icon-default' };
}

function normalizeTreeName(key) {
    return key.trim().replace(/[\\/]+$/, '');
}

function joinTreePath(parentPath, key) {
    const name = normalizeTreeName(key);
    return parentPath ? `${parentPath}/${name}` : name;
}

function renderTree(tree, prefix = '', parentPath = '') {
    let result = '';
    const keys = Object.keys(tree);
    
    keys.forEach((key, i) => {
        const isLast = i === keys.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        
        const isFolder = key.endsWith('/') || Object.keys(tree[key]).length > 0;
        const details = getIconDetails(key, isFolder);
        const itemPath = joinTreePath(parentPath, key);
        const displayName = normalizeTreeName(key);
        const canPreview = isFolder || isPreviewableFile(itemPath);
        const safeKey = escapeHtml(displayName);
        const safePrefix = escapeHtml(prefix + connector);
        const safePath = escapeHtml(itemPath);
        
        const icon = `<i data-lucide="${details.icon}" class="tree-icon ${details.class}"></i>`;
        
        result += `<div class="tree-item ${isFolder ? 'folder-node' : 'file-node'}${canPreview ? '' : ' no-preview'}" data-path="${safePath}" data-type="${isFolder ? 'folder' : 'file'}" data-preview="${canPreview ? 'enabled' : 'disabled'}">` +
                  `<span class="tree-connector">${safePrefix}</span>` +
                  `${icon}<span class="tree-item-name">${safeKey}</span>` +
                  `</div>`;

        if (isFolder) {
            result += renderTree(tree[key], prefix + (isLast ? '    ' : '│   '), itemPath);
        }
    });

    return result;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function isPreviewableFile(filePath) {
    const ext = filePath.split('.').pop().toLowerCase();
    const nonPreviewableExtensions = new Set([
        'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico', 'bmp', 'tiff',
        'psd', 'ai', 'xd', 'fig', 'sketch', 'mp3', 'wav', 'flac', 'm4a',
        'ogg', 'aac', 'mp4', 'mov', 'webm', 'avi', 'mkv', 'wmv'
    ]);

    return !nonPreviewableExtensions.has(ext);
}

function renderMarkdown(markdown) {
    const lines = escapeHtml(markdown).split(/\r?\n/);
    let html = '';
    let inList = false;
    let inCode = false;
    let codeLines = [];

    const flushList = () => {
        if (inList) {
            html += '</ul>';
            inList = false;
        }
    };

    lines.forEach((line) => {
        if (line.trim().startsWith('```')) {
            if (inCode) {
                html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
                codeLines = [];
                inCode = false;
            } else {
                flushList();
                inCode = true;
            }
            return;
        }

        if (inCode) {
            codeLines.push(line);
            return;
        }

        if (line.startsWith('# ')) {
            flushList();
            html += `<h1>${line.slice(2)}</h1>`;
        } else if (line.startsWith('## ')) {
            flushList();
            html += `<h2>${line.slice(3)}</h2>`;
        } else if (line.startsWith('### ')) {
            flushList();
            html += `<h3>${line.slice(4)}</h3>`;
        } else if (/^[-*] /.test(line)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            html += `<li>${line.slice(2)}</li>`;
        } else if (line.trim() === '') {
            flushList();
        } else {
            flushList();
            html += `<p>${line.replace(/`([^`]+)`/g, '<code>$1</code>')}</p>`;
        }
    });

    flushList();
    if (inCode) html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
    return html;
}

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

let toastTimer = null;
let pathMessageTimer = null;

function showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (toast) {
        if (toastTimer) clearTimeout(toastTimer);
        const messageKey = String(message || '').trim();
        const translatedMessage = messageKey && window.i18n ? window.i18n.t(messageKey) : messageKey;
        const text = String(translatedMessage || '').replace(/\s+/g, ' ').trim();
        toast.textContent = text.length > 180 ? `${text.slice(0, 177)}...` : text;
        toast.style.display = 'block';
        toastTimer = setTimeout(() => {
            toast.style.display = 'none';
            toastTimer = null;
        }, duration);
    }
}

function showPathMessage(path, duration = 4000) {
    const pathMsg = document.getElementById('pathMessage');
    if (pathMsg) {
        if (pathMessageTimer) clearTimeout(pathMessageTimer);
        pathMsg.textContent = path;
        pathMsg.classList.add('show');
        pathMessageTimer = setTimeout(() => {
            pathMsg.classList.remove('show');
            pathMessageTimer = null;
        }, duration);
    }
}

function refreshCurrentView() {
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    treeView.innerHTML = renderTree(currentTree);
    refreshIcons();
    updateMarkdownPreview();
    updateValidationPanel();
}

function formatMessage(template, values) {
    return Object.entries(values).reduce((message, [key, value]) => {
        return message.replaceAll(`{${key}}`, value);
    }, template);
}


function updateFileNameDisplay(forceName = null) {
    const nameSpan = document.getElementById('fileName');
    if (forceName) {
        nameSpan.textContent = forceName;
    } else if (currentFilePath) {
        const parts = currentFilePath.split(/[\\/]/);
        nameSpan.textContent = parts[parts.length - 1].replace('.tree', '');
    } else if (!nameSpan.textContent.trim() || defaultProjectNames.includes(nameSpan.textContent.trim())) {
        nameSpan.textContent = window.i18n.t('untitled');
    }
    // Persist the name
    localStorage.setItem('autosave_project_name', nameSpan.textContent);
}

document.getElementById('fileName').addEventListener('input', () => {
    isModified = true;
    localStorage.setItem('autosave_project_name', document.getElementById('fileName').textContent);
});



document.getElementById('fileName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.target.blur();
        showToast(window.i18n.t('project_updated'));
    }
});

treeView.addEventListener('click', (e) => {
    const item = e.target.closest('.tree-item');
    if (!item || item.dataset.type !== 'file') return;
    if (item.dataset.preview === 'disabled') {
        closeFilePreview();
        return;
    }
    openFilePreview(item.dataset.path);
});

filePreviewEditor.addEventListener('input', () => {
    if (!activePreviewPath) return;
    fileContents[activePreviewPath] = filePreviewEditor.value;
    persistFileContents();
    updateMarkdownPreview();
    isModified = true;
});

filePreviewEditor.addEventListener('keydown', (e) => {
    insertTabInTextarea(filePreviewEditor, e);
});

document.getElementById('closeFilePreviewBtn').addEventListener('click', closeFilePreview);

document.getElementById('loadBtn').addEventListener('click', async () => {
    const result = await window.electronAPI.loadTree();
    if (result.canceled) return;
    currentFilePath = result.filePath;
    currentTree = result.treeData;
    editor.value = result.content;
    fileContents = {};
    syncFileContentsWithTree(currentTree);
    treeView.innerHTML = renderTree(currentTree);
    refreshIcons();
    updateValidationPanel();
    updateFileNameDisplay();
    lastSavedProjectName = document.getElementById('fileName').textContent.trim();
    isModified = false;
});



document.getElementById('saveBtn').addEventListener('click', async () => {
    await saveProject();
});

async function saveProject(askPath = false) {
    const currentName = document.getElementById('fileName').textContent.trim();
    // Trigger Save As if no path yet, manual request, OR if the project name has changed from the last save
    if (!currentFilePath || askPath || (currentName !== lastSavedProjectName)) {
        const projectName = currentName || 'project';
        const result = await window.electronAPI.saveTreeAs(editor.value, projectName);
        if (!result.canceled) {
            currentFilePath = result.filePath;
            lastSavedProjectName = currentName;
            isModified = false;
            showToast(window.i18n.t('saved'));
            showPathMessage(currentFilePath);
            return true;
        }
        return false;
    } else {
        await window.electronAPI.saveTree(currentFilePath, editor.value);
        isModified = false;
        showToast(window.i18n.t('saved'));
        showPathMessage(currentFilePath);
        lastSavedProjectName = currentName;
        return true;
    }
}




document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
            saveProject(true);
        } else {
            saveProject();
        }
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        document.getElementById('menu-new').click();
    }
    
    if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        document.getElementById('menu-open').click();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        const focusedEl = document.activeElement;
        const isEditable = focusedEl === editor || focusedEl === filePreviewEditor || focusedEl === document.getElementById('fileName');
        
        if (isEditable) {
            return;
        }
    }

    
    if (e.ctrlKey && (e.key === '=' || e.key === '+' || e.key === '-')) {
        e.preventDefault();
        const currentZoom = parseFloat(document.body.style.zoom) || 1;
        if (e.key === '=' || e.key === '+') {
            document.body.style.zoom = currentZoom + 0.1;
        } else {
            document.body.style.zoom = Math.max(0.5, currentZoom - 0.1);
        }
    }
    if (e.ctrlKey && e.key === '0') {
        e.preventDefault();
        document.body.style.zoom = 1;
    }

    if (e.key === 'F11') {
        e.preventDefault();
        document.getElementById('menu-fullscreen').click();
    }

    if (e.ctrlKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        document.getElementById('menu-reload').click();
    }

});

document.getElementById('createBtn').addEventListener('click', async () => {
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    const validation = validateEditorContent(editor.value);
    updateValidationPanel(validation);

    if (validation.errors.length > 0) {
        showToast(validation.errors[0], 4000);
        return;
    }

    if (!validation.hasItems) {
        showToast(window.i18n.t('empty_structure_error'), 4000);
        return;
    }

    const targetPath = await ensureBuildFolderPath();
    if (!targetPath) return;

    const inspection = await window.electronAPI.inspectStructure(currentTree, targetPath);
    if (inspection.error) {
        showToast(inspection.error, 4000);
        return;
    }

    const confirmed = await showConfirmAsync(
        formatMessage(window.i18n.t('build_confirm_msg'), {
            files: inspection.files,
            folders: inspection.folders,
            path: targetPath,
            existing: inspection.existingFiles.length
        }),
        window.i18n.t('build_confirm_title')
    );

    if (!confirmed) return;

    let conflictMode = 'skip';
    if (inspection.existingFiles.length > 0) {
        const shouldOverwrite = await showConfirmAsync(
            formatMessage(window.i18n.t('conflict_prompt_msg'), {
                count: inspection.existingFiles.length
            }),
            window.i18n.t('conflict_prompt_title')
        );
        conflictMode = shouldOverwrite ? 'overwrite' : 'skip';
    }

    const result = await window.electronAPI.createStructure(currentTree, targetPath, { conflictMode, fileContents });
    if (result.error) {
        showToast(result.error, 4000);
        return;
    }
    if (!result.canceled) {
        const shouldExportZip = await showConfirmAsync(
            window.i18n.t('export_zip_after_build_msg'),
            window.i18n.t('export_zip_after_build_title')
        );

        if (shouldExportZip) {
            const zipExported = await exportCurrentTreeAsZip({ silent: true });
            showToast(zipExported ? window.i18n.t('zip_exported') : window.i18n.t('structure_created'));
        } else {
            showToast(window.i18n.t('structure_created'));
        }

        setBuildFolderPath(result.path);
    }
});

async function exportCurrentTreeAsZip(options = {}) {
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    const validation = validateEditorContent(editor.value);
    updateValidationPanel(validation);

    if (validation.errors.length > 0 || !validation.hasItems) {
        showToast(validation.errors[0] || window.i18n.t('empty_structure_error'), 4000);
        return false;
    }

    const projectName = document.getElementById('fileName').textContent.trim() || 'project';
    const result = await window.electronAPI.exportZip(currentTree, projectName, { fileContents });

    if (result.error) {
        showToast(result.error, 4000);
        return false;
    }

    if (!result.canceled) {
        if (!options.silent) {
            showToast(window.i18n.t('zip_exported'));
        }
        return true;
    }

    return false;
}

function parseEditorContent(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
    const root = {};
    const stack = [{ indent: -1, node: root }];

    for (let line of lines) {
        const parsedLine = getLineIndent(line);
        const indent = parsedLine.indent;
        line = parsedLine.value.trim();
        const node = {};

        while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
        const parent = stack[stack.length - 1].node;
        parent[line] = node;
        stack.push({ indent, node });
    }

    return root;
}

function hasTreeItems(tree) {
    return tree && Object.keys(tree).length > 0;
}

function getFilePathsFromTree(tree, parentPath = '') {
    const paths = [];

    Object.keys(tree).forEach((key) => {
        const itemPath = joinTreePath(parentPath, key);
        const isFolder = key.endsWith('/') || Object.keys(tree[key]).length > 0;

        if (isFolder) {
            paths.push(...getFilePathsFromTree(tree[key], itemPath));
        } else {
            paths.push(itemPath);
        }
    });

    return paths;
}

function getDefaultContentForFile(filePath) {
    const fileName = filePath.split('/').pop().toLowerCase();
    const ext = fileName.includes('.') ? fileName.split('.').pop() : '';

    if (fileName === 'package.json') return defaultFileContentsByExtension.json;
    if (fileName === 'readme.md') return `# ${filePath.split('/')[0] || 'Project'}\n\nGenerated with Tree IDE.\n`;
    if (fileName === '.gitignore') return `node_modules/\ndist/\n.env\n`;

    return defaultFileContentsByExtension[ext] || '';
}

function syncFileContentsWithTree(tree) {
    const filePaths = new Set(getFilePathsFromTree(tree));
    const nextContents = {};

    filePaths.forEach((filePath) => {
        nextContents[filePath] = Object.prototype.hasOwnProperty.call(fileContents, filePath)
            ? fileContents[filePath]
            : getDefaultContentForFile(filePath);
    });

    fileContents = nextContents;
    persistFileContents();

    if (activePreviewPath && !filePaths.has(activePreviewPath)) {
        closeFilePreview();
    }
}

function persistFileContents() {
    localStorage.setItem('autosave_file_contents', JSON.stringify(fileContents));
}

function loadSavedFileContents() {
    try {
        fileContents = JSON.parse(localStorage.getItem('autosave_file_contents') || '{}');
    } catch {
        fileContents = {};
    }
}

function isMarkdownFile(filePath) {
    return /\.(md|markdown)$/i.test(filePath);
}

function updateMarkdownPreview() {
    if (!activePreviewPath || !isMarkdownFile(activePreviewPath)) {
        markdownPreview.innerHTML = '';
        return;
    }

    markdownPreview.innerHTML = renderMarkdown(filePreviewEditor.value);
}

function openFilePreview(filePath) {
    activePreviewPath = filePath;
    filePreviewPanel.classList.add('show');
    filePreviewPanel.classList.toggle('markdown-file', isMarkdownFile(filePath));
    filePreviewName.textContent = filePath;
    filePreviewName.title = filePath;
    filePreviewMode.textContent = isMarkdownFile(filePath) ? 'Markdown' : '';
    filePreviewEditor.value = fileContents[filePath] || '';
    updateMarkdownPreview();

    document.querySelectorAll('.tree-item.active-file').forEach(item => item.classList.remove('active-file'));
    const activeItem = Array.from(treeView.querySelectorAll('[data-type="file"]'))
        .find(item => item.dataset.path === filePath);
    if (activeItem) activeItem.classList.add('active-file');
}

function closeFilePreview() {
    activePreviewPath = '';
    filePreviewPanel.classList.remove('show');
    filePreviewPanel.classList.remove('markdown-file');
    filePreviewEditor.value = '';
    filePreviewMode.textContent = '';
    markdownPreview.innerHTML = '';
    filePreviewName.textContent = window.i18n.t('file_preview_empty');
    document.querySelectorAll('.tree-item.active-file').forEach(item => item.classList.remove('active-file'));
}

function validateEditorContent(content) {
    const errors = [];
    const lines = content.split(/\r?\n/);
    const stack = [{ indent: -1, names: new Set() }];
    let hasItems = false;

    lines.forEach((rawLine, index) => {
        if (rawLine.trim() === '') return;

        hasItems = true;
        const lineNumber = index + 1;
        const parsedLine = getLineIndent(rawLine);
        const name = parsedLine.value.trim();
        const leadingWhitespace = rawLine.match(/^[\t ]*/)[0];
        const spaces = (leadingWhitespace.match(/ /g) || []).length;
        const tabs = (leadingWhitespace.match(/\t/g) || []).length;
        const cleanName = name.replace(/[\\/]+$/, '');
        const nameParts = cleanName.split(/[\\/]+/);

        if (!rawLine.startsWith('...') && tabs > 0 && spaces > 0) {
            errors.push(formatMessage(window.i18n.t('validation_bad_indent'), { line: lineNumber }));
        } else if (!rawLine.startsWith('...') && spaces % 4 !== 0) {
            errors.push(formatMessage(window.i18n.t('validation_bad_indent'), { line: lineNumber }));
        }

        if (!cleanName || cleanName === '.' || cleanName === '..' || cleanName.includes('\0') || /[<>:"|?*]/.test(cleanName)) {
            errors.push(formatMessage(window.i18n.t('validation_bad_name'), { line: lineNumber }));
        }

        if (pathLooksUnsafe(cleanName, nameParts)) {
            errors.push(formatMessage(window.i18n.t('validation_escape'), { line: lineNumber }));
        }

        while (stack.length && stack[stack.length - 1].indent >= parsedLine.indent) stack.pop();
        const parent = stack[stack.length - 1];
        const duplicateKey = cleanName.toLowerCase();

        if (parent.names.has(duplicateKey)) {
            errors.push(formatMessage(window.i18n.t('validation_duplicate'), { line: lineNumber }));
        }

        parent.names.add(duplicateKey);
        stack.push({ indent: parsedLine.indent, names: new Set() });
    });

    if (!hasItems) errors.push(window.i18n.t('validation_empty'));

    return { errors: [...new Set(errors)], hasItems };
}

function pathLooksUnsafe(name, parts) {
    return /^[a-zA-Z]:/.test(name) || name.startsWith('/') || name.startsWith('\\') || parts.includes('..');
}

function updateValidationPanel(validation = null) {
    const panel = document.getElementById('validationPanel');
    if (!panel) return;

    if (!validation && editor.value.trim() === '') {
        panel.classList.remove('show');
        panel.innerHTML = '';
        return;
    }

    validation = validation || validateEditorContent(editor.value);

    if (validation.errors.length === 0) {
        panel.classList.remove('show');
        panel.innerHTML = '';
        return;
    }

    panel.innerHTML = `<strong>${escapeHtml(window.i18n.t('validation_title'))}</strong><ul>` +
        validation.errors.slice(0, 4).map(error => `<li>${escapeHtml(error)}</li>`).join('') +
        `</ul>`;
    panel.classList.add('show');
}

function getLineIndent(line) {
    if (line.startsWith('...')) {
        let indent = 0;
        while (line.startsWith('...')) {
            indent++;
            line = line.slice(3);
        }
        return { indent, value: line };
    }

    const leadingWhitespace = line.match(/^[\t ]*/)[0];
    const tabs = (leadingWhitespace.match(/\t/g) || []).length;
    const spaces = (leadingWhitespace.match(/ /g) || []).length;

    return {
        indent: tabs + Math.floor(spaces / 4),
        value: line.slice(leadingWhitespace.length)
    };
}

// Theme Management
const handleThemeChange = (val) => {
    if (val === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', val);
    document.getElementById('themeSelect').value = val;
    document.getElementById('welcomeThemeSelect').value = val;
};

function setBuildFolderPath(path) {
    buildFolderPath = path || '';

    if (buildFolderPath) {
        localStorage.setItem('build_folder_path', buildFolderPath);
    } else {
        localStorage.removeItem('build_folder_path');
    }

    updateBuildFolderDisplay();
}

function updateBuildFolderDisplay() {
    const label = buildFolderPath || window.i18n.t('no_folder_selected');
    const settingsPath = document.getElementById('buildFolderPath');
    const welcomePath = document.getElementById('welcomeBuildFolderPath');

    if (settingsPath) {
        settingsPath.textContent = label;
        settingsPath.title = buildFolderPath;
    }

    if (welcomePath) {
        welcomePath.textContent = label;
        welcomePath.title = buildFolderPath;
    }
}

async function chooseBuildFolder() {
    const result = await window.electronAPI.selectBuildFolder();
    if (result.canceled) return;
    setBuildFolderPath(result.path);
    showPathMessage(result.path);
}

async function ensureBuildFolderPath() {
    if (buildFolderPath) return buildFolderPath;

    const result = await window.electronAPI.selectBuildFolder();
    if (result.canceled) return '';

    setBuildFolderPath(result.path);
    return result.path;
}

function applyTemplate(templateName) {
    const template = templates[templateName];
    if (!template) return;

    editor.value = template.tree;
    fileContents = { ...template.files };
    currentTree = parseEditorContent(editor.value);
    syncFileContentsWithTree(currentTree);
    treeView.innerHTML = renderTree(currentTree);
    refreshIcons();
    updateValidationPanel();
    isModified = true;
    localStorage.setItem('autosave_content', editor.value);
    persistFileContents();
}

let selectedTemplateName = 'node';

function renderTemplateModal() {
    const list = document.getElementById('templatesList');
    const select = document.getElementById('templateSelect');
    const template = templates[selectedTemplateName];
    if (!template) return;

    if (list) {
        list.innerHTML = Object.keys(templates).map((key) => {
            const active = key === selectedTemplateName ? ' active' : '';
            return `<button class="template-option${active}" data-template="${key}">${escapeHtml(templates[key].label || key)}</button>`;
        }).join('');
    }

    if (select) {
        select.innerHTML = Object.keys(templates).map((key) => {
            const label = escapeHtml(templates[key].label || key);
            return `<option value="${escapeHtml(key)}">${label}</option>`;
        }).join('');
        select.value = selectedTemplateName;
    }

    document.getElementById('templateTreePreview').innerHTML = renderTree(parseEditorContent(template.tree));
    const firstFile = Object.keys(template.files)[0] || '';
    renderTemplateFilePreview(firstFile);
    refreshIcons();
}

function renderTemplateFilePreview(filePath) {
    const template = templates[selectedTemplateName];
    const content = template?.files[filePath] || '';
    document.getElementById('templateFileName').textContent = filePath || window.i18n.t('file_preview_empty');
    document.getElementById('templateFileContent').textContent = content;
}

function openTemplatesModal() {
    document.getElementById('templatesModal').style.display = 'flex';
    renderTemplateModal();
}

let debounceTimer;
editor.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        currentTree = parseEditorContent(editor.value);
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        refreshIcons();
        updateValidationPanel();
        
        isModified = true;
        // Autosave
        localStorage.setItem('autosave_content', editor.value);
        localStorage.setItem('autosave_path', currentFilePath);
        localStorage.setItem('autosave_project_name', document.getElementById('fileName').textContent);
        persistFileContents();
    }, 150);
});




window.addEventListener('DOMContentLoaded', () => {
    // Check for first run
    if (!localStorage.getItem('onboarding_done')) {
        document.getElementById('welcomeModal').style.display = 'flex';
    }



    const savedContent = localStorage.getItem('temp_content') || localStorage.getItem('autosave_content');
    const savedPath = localStorage.getItem('temp_path') || localStorage.getItem('autosave_path');
    const savedProjectName = localStorage.getItem('autosave_project_name');
    loadSavedFileContents();
    
    if (savedContent !== null) {
        editor.value = savedContent;
        currentFilePath = savedPath || '';
        currentTree = parseEditorContent(editor.value);
        syncFileContentsWithTree(currentTree);
        treeView.innerHTML = renderTree(currentTree);
        if (savedProjectName) {
            document.getElementById('fileName').textContent = savedProjectName;
            lastSavedProjectName = savedProjectName;
        } else {
            updateFileNameDisplay();
            lastSavedProjectName = document.getElementById('fileName').textContent.trim();
        }
        isModified = false;
        localStorage.removeItem('temp_content');
        localStorage.removeItem('temp_path');
    } else if (savedProjectName) {

        document.getElementById('fileName').textContent = savedProjectName;
        lastSavedProjectName = savedProjectName;
    } else {
        updateFileNameDisplay(window.i18n.t('untitled'));
    }




    const langSelect = document.getElementById('langSelect');
    const themeSelect = document.getElementById('themeSelect');
    
    syncLanguageControls();
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    handleThemeChange(savedTheme);
    if (themeSelect) themeSelect.value = savedTheme;

    refreshIcons();
    window.i18n.updateUI();
    syncLanguageControls();
    updateBuildFolderDisplay();
    updateValidationPanel();
    initializeAppInfo();
    bindReleaseUpdateEvents();
    setTimeout(checkReleaseUpdateOnStartup, 1200);
});

const menuItems = document.querySelectorAll('.menu-item');
const dropdowns = document.querySelectorAll('.dropdown-content');

menuItems.forEach(item => {
    const label = item.querySelector('.menu-label');
    const dropdown = item.querySelector('.dropdown-content');

    label.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdowns.forEach(d => {
            if (d !== dropdown) d.classList.remove('show');
        });
        menuItems.forEach(i => {
            if (i !== item) i.classList.remove('active');
        });
        dropdown.classList.toggle('show');
        item.classList.toggle('active');
    });
});

window.addEventListener('click', () => {
    dropdowns.forEach(d => d.classList.remove('show'));
    menuItems.forEach(i => i.classList.remove('active'));
});

// Window Controls
document.getElementById('minBtn').addEventListener('click', () => window.electronAPI.windowMinimize());
document.getElementById('maxBtn').addEventListener('click', () => window.electronAPI.windowMaximize());
document.getElementById('closeBtn').addEventListener('click', () => window.electronAPI.windowClose());

// Menu Actions
document.getElementById('menu-new').addEventListener('click', () => {
    showConfirm(window.i18n.t('confirm_new'), window.i18n.t('confirm_title'), () => {
        editor.value = '';
        currentTree = {};
        fileContents = {};
        persistFileContents();
        closeFilePreview();
        treeView.innerHTML = '';
        updateValidationPanel({ errors: [], hasItems: false });
        currentFilePath = '';
        updateFileNameDisplay(window.i18n.t('untitled'));
        localStorage.removeItem('autosave_content');
        localStorage.removeItem('autosave_path');
        localStorage.removeItem('autosave_project_name');
    });
});


document.getElementById('menu-open').addEventListener('click', () => document.getElementById('loadBtn').click());
document.getElementById('menu-save').addEventListener('click', () => document.getElementById('saveBtn').click());
document.getElementById('menu-save-as').addEventListener('click', () => saveProject(true));
document.getElementById('menu-exit').addEventListener('click', () => window.electronAPI.windowClose());

document.getElementById('menu-undo').addEventListener('click', () => document.execCommand('undo'));
document.getElementById('menu-redo').addEventListener('click', () => document.execCommand('redo'));
document.getElementById('menu-cut').addEventListener('click', () => document.execCommand('cut'));
document.getElementById('menu-copy').addEventListener('click', () => document.execCommand('copy'));
document.getElementById('menu-paste').addEventListener('click', () => document.execCommand('paste'));

document.getElementById('menu-reload').addEventListener('click', () => {
    refreshCurrentView();
    showToast(window.i18n.t('reloaded'));
});

document.getElementById('menu-zoom-in').addEventListener('click', () => {
    const currentZoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    document.body.style.zoom = currentZoom + 0.1;
});
document.getElementById('menu-zoom-out').addEventListener('click', () => {
    const currentZoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    document.body.style.zoom = currentZoom - 0.1;
});
document.getElementById('menu-zoom-reset').addEventListener('click', () => document.body.style.zoom = 1);
document.getElementById('menu-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

document.getElementById('menu-minimize').addEventListener('click', () => window.electronAPI.windowMinimize());
document.getElementById('menu-close-win').addEventListener('click', () => window.electronAPI.windowClose());

window.electronAPI.onWindowStateChanged((isMaximized) => {
    const maxBtn = document.getElementById('maxBtn');
    if (maxBtn) {
        maxBtn.innerHTML = isMaximized 
            ? '<i data-lucide="copy"></i>' 
            : '<i data-lucide="square"></i>';
        refreshIcons();
    }
});

// Settings & Menu Actions
const settingsModal = document.getElementById('settingsModal');
const aboutModal = document.getElementById('aboutModal');
const welcomeModal = document.getElementById('welcomeModal');
const templatesModal = document.getElementById('templatesModal');
const releaseUpdateModal = document.getElementById('releaseUpdateModal');
let latestReleaseUpdate = null;
let dismissedReleaseVersion = '';
let releaseUpdateState = 'available';

function showReleaseUpdateModal(info) {
    latestReleaseUpdate = info;
    releaseUpdateState = 'available';
    document.getElementById('releaseUpdateCurrent').textContent = `v${info.currentVersion || '---'}`;
    document.getElementById('releaseUpdateLatest').textContent = `v${info.latestVersion || '---'}`;

    const assetLabel = document.getElementById('releaseUpdateAsset');
    assetLabel.textContent = info.assetName
        ? `${window.i18n.t('update_asset_label')}: ${info.assetName}`
        : '';

    const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
    downloadBtn.disabled = false;
    downloadBtn.textContent = window.i18n.t('update_download_release');
    releaseUpdateModal.style.display = 'flex';
    refreshIcons();
}

function queueOrShowReleaseUpdate(info) {
    if (info.latestVersion === dismissedReleaseVersion) return;

    if (welcomeModal.style.display === 'flex') {
        latestReleaseUpdate = info;
        return;
    }

    showReleaseUpdateModal(info);
}

async function checkReleaseUpdateOnStartup() {
    if (!window.electronAPI.checkReleaseUpdate) return;

    try {
        const result = await window.electronAPI.checkReleaseUpdate();
        if (result?.ok && result.updateAvailable) {
            queueOrShowReleaseUpdate(result);
        } else if (result?.ok === false) {
            console.warn('Release update check failed:', result.error);
        }
    } catch (err) {
        console.warn('Release update check failed:', err);
    }
}

function bindReleaseUpdateEvents() {
    if (!window.electronAPI.onReleaseUpdateAvailable) return;

    window.electronAPI.onReleaseUpdateAvailable((info) => {
        queueOrShowReleaseUpdate(info);
    });

    window.electronAPI.onReleaseUpdateProgress((percent) => {
        releaseUpdateState = 'downloading';
        const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
        downloadBtn.disabled = true;
        downloadBtn.textContent = `${window.i18n.t('update_downloading')} ${percent}%`;
    });

    window.electronAPI.onReleaseUpdateDownloaded(() => {
        releaseUpdateState = 'downloaded';
        const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
        downloadBtn.disabled = false;
        downloadBtn.textContent = window.i18n.t('update_install_restart');
    });

    window.electronAPI.onReleaseUpdateError((message) => {
        releaseUpdateState = 'available';
        const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');
        downloadBtn.disabled = false;
        downloadBtn.textContent = window.i18n.t('update_download_release');
        showToast(message || window.i18n.t('update_failed'), 4000);
    });
}

async function initializeAppInfo() {
    if (!window.electronAPI.getAppInfo) return;

    try {
        const appInfo = await window.electronAPI.getAppInfo();
        const aboutVersion = document.getElementById('aboutVersion');
        if (aboutVersion) {
            aboutVersion.textContent = appInfo.isPackaged ? `v${appInfo.version}` : `v${appInfo.version} dev`;
        }
    } catch (err) {
        console.warn('App info unavailable:', err);
    }
}

document.getElementById('menu-settings').addEventListener('click', () => {
    // Reset to first tab
    const firstTab = document.querySelector('.sidebar-tab');
    if (firstTab) firstTab.click();
    settingsModal.style.display = 'flex';
});

document.getElementById('menu-credits').addEventListener('click', () => {
    aboutModal.style.display = 'flex';
});

document.getElementById('closeSettings').addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

document.getElementById('closeAbout').addEventListener('click', () => {
    aboutModal.style.display = 'none';
});

document.getElementById('templatesBtn').addEventListener('click', openTemplatesModal);

document.getElementById('closeTemplatesModal').addEventListener('click', () => {
    templatesModal.style.display = 'none';
});

const templatesList = document.getElementById('templatesList');
if (templatesList) {
    templatesList.addEventListener('click', (e) => {
        const button = e.target.closest('.template-option');
        if (!button) return;
        selectedTemplateName = button.dataset.template;
        renderTemplateModal();
    });
}

document.getElementById('templateSelect').addEventListener('change', (e) => {
    selectedTemplateName = e.target.value;
    renderTemplateModal();
});

document.getElementById('templateTreePreview').addEventListener('click', (e) => {
    const item = e.target.closest('.tree-item');
    if (!item || item.dataset.type !== 'file') return;
    if (item.dataset.preview === 'disabled') return;
    renderTemplateFilePreview(item.dataset.path);
});

document.getElementById('useTemplateBtn').addEventListener('click', () => {
    applyTemplate(selectedTemplateName);
    templatesModal.style.display = 'none';
});

document.getElementById('startBtn').addEventListener('click', () => {
    welcomeModal.style.display = 'none';
    localStorage.setItem('onboarding_done', 'true');

    if (latestReleaseUpdate && latestReleaseUpdate.latestVersion !== dismissedReleaseVersion) {
        showReleaseUpdateModal(latestReleaseUpdate);
    }
});

// Language selection in settings & onboarding
const handleLangChange = (val) => {
    const nameSpan = document.getElementById('fileName');
    const shouldTranslateProjectName = !currentFilePath && defaultProjectNames.includes(nameSpan.textContent.trim());

    window.i18n.setLanguage(val);
    syncLanguageControls();

    if (shouldTranslateProjectName) {
        updateFileNameDisplay(window.i18n.t('untitled'));
    }

    updateBuildFolderDisplay();
    updateValidationPanel();
};

function syncLanguageControls() {
    const currentLang = window.i18n.getCurrentLang();
    const langSelect = document.getElementById('langSelect');
    const welcomeLangSelect = document.getElementById('welcomeLangSelect');

    if (langSelect) langSelect.value = currentLang;
    if (welcomeLangSelect) welcomeLangSelect.value = currentLang;
}

document.getElementById('langSelect').addEventListener('change', (e) => handleLangChange(e.target.value));
document.getElementById('welcomeLangSelect').addEventListener('change', (e) => handleLangChange(e.target.value));
document.getElementById('chooseBuildFolderBtn').addEventListener('click', chooseBuildFolder);
document.getElementById('welcomeChooseBuildFolderBtn').addEventListener('click', chooseBuildFolder);
document.getElementById('clearBuildFolderBtn').addEventListener('click', () => setBuildFolderPath(''));

// Theme selection
document.getElementById('themeSelect').addEventListener('change', (e) => handleThemeChange(e.target.value));
document.getElementById('welcomeThemeSelect').addEventListener('change', (e) => handleThemeChange(e.target.value));

// Settings Tab Switching
const sidebarTabs = document.querySelectorAll('.sidebar-tab');
const tabPanes = document.querySelectorAll('.tab-pane');

sidebarTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        
        // Update tabs
        sidebarTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update panes
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `tab-${targetTab}`) {
                pane.classList.add('active');
            }
        });

        // Initialize icons in new pane
        refreshIcons();
    });
});

// Custom Confirmation Modal Logic
let confirmCallback = null;
let confirmResolver = null;
const confirmModal = document.getElementById('confirmModal');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMsg = document.getElementById('confirmMsg');

function showConfirm(message, title, onConfirm) {
    confirmMsg.textContent = message;
    confirmTitle.textContent = title || window.i18n.t('confirm_title');
    confirmCallback = onConfirm;
    confirmModal.style.display = 'flex';
}

function showConfirmAsync(message, title) {
    showConfirm(message, title, null);
    return new Promise((resolve) => {
        confirmResolver = resolve;
    });
}

document.getElementById('agreeConfirmBtn').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    confirmCallback = null;
    if (confirmResolver) confirmResolver(true);
    confirmResolver = null;
    confirmModal.style.display = 'none';
});

document.getElementById('cancelConfirmBtn').addEventListener('click', () => {
    confirmCallback = null;
    if (confirmResolver) confirmResolver(false);
    confirmResolver = null;
    confirmModal.style.display = 'none';
});

document.getElementById('closeConfirmModal').addEventListener('click', () => {
    confirmCallback = null;
    if (confirmResolver) confirmResolver(false);
    confirmResolver = null;
    confirmModal.style.display = 'none';
});

function closeReleaseUpdateModal() {
    if (latestReleaseUpdate?.latestVersion) {
        dismissedReleaseVersion = latestReleaseUpdate.latestVersion;
    }

    releaseUpdateModal.style.display = 'none';
}

document.getElementById('declineReleaseUpdateBtn').addEventListener('click', closeReleaseUpdateModal);
document.getElementById('closeReleaseUpdateModal').addEventListener('click', closeReleaseUpdateModal);

document.getElementById('downloadReleaseUpdateBtn').addEventListener('click', async () => {
    const downloadBtn = document.getElementById('downloadReleaseUpdateBtn');

    if (releaseUpdateState === 'downloaded') {
        window.electronAPI.installReleaseUpdate();
        return;
    }

    releaseUpdateState = 'downloading';
    downloadBtn.disabled = true;
    downloadBtn.textContent = window.i18n.t('update_downloading');

    const result = await window.electronAPI.downloadReleaseUpdate();
    if (result?.ok === false) {
        releaseUpdateState = 'available';
        downloadBtn.disabled = false;
        downloadBtn.textContent = window.i18n.t('update_download_release');
        showToast(result.error || window.i18n.t('update_failed'), 4000);
    }
});

window.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.href.startsWith('http')) {
        e.preventDefault();
        window.electronAPI.openExternal(e.target.href);
    }

    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
    if (e.target === aboutModal) {
        aboutModal.style.display = 'none';
    }
    if (e.target === templatesModal) {
        templatesModal.style.display = 'none';
    }
    if (e.target === releaseUpdateModal) {
        closeReleaseUpdateModal();
    }
    if (e.target === unsavedModal) {
        unsavedModal.style.display = 'none';
    }
});

// Close Safeguard
const unsavedModal = document.getElementById('unsavedModal');

window.electronAPI.onAttemptClose(async () => {
    if (isModified) {
        unsavedModal.style.display = 'flex';
    } else {
        window.electronAPI.forceClose();
    }
});

document.getElementById('saveUnsavedBtn').addEventListener('click', async () => {
    const saved = await saveProject();
    if (saved) {
        window.electronAPI.forceClose();
    }
});

document.getElementById('dontSaveUnsavedBtn').addEventListener('click', () => {
    localStorage.removeItem('autosave_content');
    localStorage.removeItem('autosave_path');
    localStorage.removeItem('autosave_project_name');
    window.electronAPI.forceClose();
});

document.getElementById('closeUnsavedModal').addEventListener('click', () => {
    unsavedModal.style.display = 'none';
});
