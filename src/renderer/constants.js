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

const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Portuguese' }
];

const themes = [
    { id: 'dark', name: 'Dark' },
    { id: 'light', name: 'Light' }
];

window.constants = { defaultFileContentsByExtension, templates, languages, themes };
