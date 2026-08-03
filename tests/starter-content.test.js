/**
 * @vitest-environment happy-dom
 * Integration regression: typing a file name in the tree editor must seed
 * the predefined starter content into the file tab/preview, and persisted
 * empty values must not keep starter files stuck empty.
 */

import { readFileSync } from 'node:fs';
import { createApp } from '../src/renderer/createApp.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function makeElectronApiMock() {
    const noop = () => {};
    return new Proxy({}, {
        get(_target, prop) {
            if (prop === 'onWindowStateChanged' || prop === 'onAttemptClose' || prop === 'onReleaseUpdateAvailable') {
                return noop;
            }
            return (..._args) => Promise.resolve(undefined);
        }
    });
}

function loadRealHtml() {
    const html = readFileSync('src/renderer/index.html', 'utf8');
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (!match) {
        throw new Error('No <body> found in index.html');
    }
    document.body.innerHTML = match[1];
}

async function bootApp() {
    localStorage.setItem('auto_check_updates', 'false');
    const app = createApp({ electronAPI: window.electronAPI });
    await app.shell.bootstrap();
    return app;
}

function typeInTree(editor, value) {
    editor.value = value;
    editor.dispatchEvent(new Event('input', { bubbles: true }));
}

beforeEach(() => {
    localStorage.clear();
    loadRealHtml();
    window.electronAPI = makeElectronApiMock();
});

it('boots without init error overlay', async () => {
    await bootApp();
    const errorOverlay = document.getElementById('initError') || document.querySelector('.init-error');
    expect(errorOverlay?.style.display).not.toBe('flex');
});

it('seeds predefined content when typing index.html in a fresh project', async () => {
    const app = await bootApp();

    const editor = document.getElementById('editor');
    typeInTree(editor, 'site/\n    index.html\n    styles.css\n    app.js\n');
    await sleep(300);

    // 1) fileContents must be seeded
    expect(app.state.fileContents['site/index.html']).toContain('<!doctype html>');
    expect(app.state.fileContents['site/styles.css']).toContain('body');
    expect(app.state.fileContents['site/app.js']).toContain('function main');

    // 2) clicking the file in the tree must open the tab with the content
    const item = document.querySelector('.tree-item[data-path="site/index.html"]');
    expect(item).toBeTruthy();
    item.dispatchEvent(new Event('click', { bubbles: true }));

    const preview = document.getElementById('filePreviewEditor');
    expect(preview.value).toContain('<!doctype html>');
    expect(preview.value).toContain('<html lang="en">');
});

it('heals a stuck-empty persisted file when the user types in the tree', async () => {
    const app = await bootApp();

    // Simulate a restored session that persisted an empty value.
    app.state.fileContents['site/index.html'] = '';

    const editor = document.getElementById('editor');
    typeInTree(editor, 'site/\n    index.html\n');
    await sleep(300);

    expect(app.state.fileContents['site/index.html']).toContain('<!doctype html>');
});

it('heals a stuck-empty persisted file when the file tab is opened', async () => {
    const app = await bootApp();

    // Simulate a restored session that persisted an empty value.
    app.state.fileContents['site/index.html'] = '';

    const editor = document.getElementById('editor');
    typeInTree(editor, 'site/\n    index.html\n');
    await sleep(300);

    // Force the stuck state back and open the file without any further typing.
    app.state.fileContents['site/index.html'] = '';
    const item = document.querySelector('.tree-item[data-path="site/index.html"]');
    expect(item).toBeTruthy();
    item.dispatchEvent(new Event('click', { bubbles: true }));

    const preview = document.getElementById('filePreviewEditor');
    expect(preview.value).toContain('<!doctype html>');
});
