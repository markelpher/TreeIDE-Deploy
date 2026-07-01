/**
 * TreeIDE - frontend project templates
 */

export const frontendTemplates = {
    html: {
    label: `HTML`,
    tree: `site/
    index.html
    assets/
        favicon.ico`,
    files: {
        "site/index.html": `<!doctype html>
<html lang="{lang}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tree IDE Site</title>
    <link rel="icon" href="assets/favicon.ico">
</head>
<body>
    <main>
        <h1>Tree IDE Site</h1>
        <p>{start_editing}</p>
    </main>
</body>
</html>
`,
        "site/assets/favicon.ico": ``
    }
},
    htmlCss: {
    label: `HTML & CSS`,
    tree: `site/
    index.html
    styles/
        styles.css
    assets/
        favicon.ico`,
    files: {
        "site/index.html": `<!doctype html>
<html lang="{lang}">
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
        <p>{start_editing}</p>
    </main>
</body>
</html>
`,
        "site/styles/styles.css": `body {
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
        "site/assets/favicon.ico": ``
    }
},
    cssJavascript: {
    label: `HTML, CSS & JavaScript`,
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
        "site/index.html": `<!doctype html>
<html lang="{lang}">
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
        <p>{start_editing}</p>
    </main>
    <script src="scripts/app.js"></script>
</body>
</html>
`,
        "site/styles/styles.css": `body {
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
        "site/scripts/app.js": `console.log('Tree IDE site ready');
`,
        "site/assets/favicon.ico": ``
    }
},
    react: {
    label: `React`,
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
        "react-app/src/App.jsx": `export default function App() {
    return (
        <main className="app">
            <h1>Tree IDE React App</h1>
            <p>{edit_component}</p>
        </main>
    );
}
`,
        "react-app/src/main.jsx": `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(<App />);
`,
        "react-app/src/styles.css": `body {
    margin: 0;
    font-family: Inter, system-ui, sans-serif;
}

.app {
    min-height: 100vh;
    display: grid;
    place-items: center;
}
`,
        "react-app/public/index.html": `<!doctype html>
<html lang="{lang}">
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
        "react-app/public/favicon.ico": ``,
        "react-app/package.json": `{
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
        "react-app/README.md": `# Tree IDE React App

{run_install}
`
    }
},
    vite: {
    label: `Vite + React`,
    tree: `{projectName}/
    public/
    src/
        App.jsx
        main.jsx
        index.css
    index.html
    package.json
    vite.config.js
    README.md
    .gitignore`,
    files: {
        "{projectName}/package.json": `{
  "name": "{projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
`,
        "{projectName}/vite.config.js": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
});
`,
        "{projectName}/index.html": `<!DOCTYPE html>
<html lang="{lang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
        "{projectName}/src/main.jsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
`,
        "{projectName}/src/App.jsx": `export default function App() {
    return (
        <main>
            <h1>{projectName}</h1>
            <p>{generated}</p>
        </main>
    );
}
`,
        "{projectName}/src/index.css": `body { font-family: system-ui, sans-serif; margin: 2rem; }
`,
        "{projectName}/README.md": `# {projectName}

{generated}

## Author

{author}
`,
        "{projectName}/.gitignore": `node_modules/
dist/
.env
`
    }
}
};
