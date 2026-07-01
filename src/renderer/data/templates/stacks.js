/**
 * TreeIDE - stacks project templates
 */

export const stacksTemplates = {
    node: {
    label: `Node.js`,
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
        "app/src/index.js": `const { appName, port } = require('./config');

function start() {
    console.log(\`\${appName} running on port \${port}\`);
}

start();
`,
        "app/src/config.js": `module.exports = {
    appName: 'Tree IDE Node App',
    port: process.env.PORT || 3000
};
`,
        "app/tests/app.test.js": `const assert = require('assert');

assert.strictEqual(1 + 1, 2);
`,
        "app/package.json": `{
  "name": "Tree IDE-node-app",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "node tests/app.test.js"
  }
}
`,
        "app/README.md": `# Tree IDE Node App

{generated}
`,
        "app/.gitignore": `node_modules/
.env
dist/
`
    }
},
    mvc: {
    label: `MVC`,
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
        "mvc-app/src/app.js": `const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.static('src/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', routes);

module.exports = app;
`,
        "mvc-app/src/server.js": `const app = require('./app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(\`MVC app running at http://localhost:\${port}\`);
});
`,
        "mvc-app/src/controllers/homeController.js": `const path = require('path');

function index(req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'home.html'));
}

module.exports = { index };
`,
        "mvc-app/src/controllers/userController.js": `const path = require('path');
const userModel = require('../models/userModel');

function list(req, res) {
    res.sendFile(path.join(__dirname, '..', 'views', 'users.html'));
}

function apiList(req, res) {
    res.json(userModel.findAll());
}

module.exports = { list, apiList };
`,
        "mvc-app/src/models/userModel.js": `const users = [
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
        "mvc-app/src/routes/index.js": `const router = require('express').Router();
const homeController = require('../controllers/homeController');
const userRoutes = require('./userRoutes');

router.get('/', homeController.index);
router.use('/users', userRoutes);

module.exports = router;
`,
        "mvc-app/src/routes/userRoutes.js": `const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/', userController.list);
router.get('/api', userController.apiList);

module.exports = router;
`,
        "mvc-app/src/views/home.html": `<!doctype html>
<html lang="{lang}">
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
        "mvc-app/src/views/users.html": `<!doctype html>
<html lang="{lang}">
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
        "mvc-app/src/public/styles.css": `body {
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
        "mvc-app/src/public/favicon.ico": ``,
        "mvc-app/tests/userModel.test.js": `const assert = require('assert');
const userModel = require('../src/models/userModel');

assert.strictEqual(userModel.findAll().length, 2);
assert.strictEqual(userModel.findById(1).name, 'Ada Lovelace');
`,
        "mvc-app/package.json": `{
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
        "mvc-app/README.md": `# Tree IDE MVC App

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
        "mvc-app/.gitignore": `node_modules/
.env
dist/
`
    }
},
    python: {
    label: `Python`,
    tree: `python-app/
    src/
        main.py
        __init__.py
    tests/
        test_main.py
    requirements.txt
    README.md`,
    files: {
        "python-app/src/main.py": `def greet(name: str = "Tree IDE") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())
`,
        "python-app/src/__init__.py": `from .main import greet
`,
        "python-app/tests/test_main.py": `from src.main import greet


def test_greet():
    assert greet("World") == "Hello, World!"
`,
        "python-app/requirements.txt": `pytest
`,
        "python-app/README.md": `# Tree IDE Python App

{run_tests}
`
    }
},
    php: {
    label: `PHP`,
    tree: `php-app/
    public/
        index.php
    src/
        App.php
    composer.json
    README.md
    .gitignore`,
    files: {
        "php-app/public/index.php": `<?php
require __DIR__ . '/../src/App.php';

echo App\\App::greet();
`,
        "php-app/src/App.php": `<?php
namespace App;

class App {
    public static function greet(): string {
        return "Hello from PHP";
    }
}
`,
        "php-app/composer.json": `{
  "name": "example/php-app",
  "description": "Tree IDE PHP starter",
  "type": "project",
  "require": {
    "php": "^8.2"
  },
  "autoload": {
    "psr-4": {
      "App\\\\": "src/"
    }
  }
}
`,
        "php-app/README.md": `# PHP App

{generated}

Run with \`php public/index.php\`.
`,
        "php-app/.gitignore": `/vendor/
composer.lock
`
    }
}
};
