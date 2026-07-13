/**
 * @vitest-environment happy-dom
 */

import * as helpers from '../src/shared/helpers.js';
import { serializeTemplateFile } from '../src/shared/templateFile.js';
import { createEditor } from '../src/renderer/modules/editor.js';
import { createTemplatesUi } from '../src/renderer/modules/templates-ui.js';

globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] ?? null; },
    setItem(k, v) { this._data[k] = v; },
    removeItem(k) { delete this._data[k]; }
};

const templatesData = {
    vite: {
        label: 'Vite + React',
        tree: `{projectName}/
    src/
        App.jsx
    package.json`,
        files: {
            '{projectName}/package.json': '{ "name": "{projectName}" }',
            '{projectName}/src/App.jsx': 'export default function App() {}'
        }
    }
};

const app = {
    state: { lastSavedProjectName: 'my-app' },
    templatesData,
    i18n: { t: (key) => key, getCurrentLang: () => 'en' },
    fileops: {
        replaceTemplatePlaceholders(content) {
            return String(content).replace(/\{projectName\}/g, 'my-app');
        },
        syncFileContentsWithTree: () => {},
        isMarkdownFile(path) {
            return String(path).toLowerCase().endsWith('.md');
        },
        getFileTypeLabel(path) {
            return String(path).split('.').pop() || 'file';
        },
        getProjectName: () => 'my-app',
        getSaveProjectName: () => 'my-app'
    },
    markdown: {
        renderMarkdown: vi.fn((content) => `<article>${content}</article>`)
    },
    dbStorage: {
        get: vi.fn(async () => null),
        set: vi.fn(async () => {})
    },

    helpers: {
        formatMessage: helpers.formatMessage,
        parseEditorContent: (content) => {
            const lines = content.split('\n').filter((l) => l.trim());
            const root = {};
            const stack = [{ indent: -1, node: root }];
            for (const raw of lines) {
                const spaces = raw.match(/^ */)[0].length;
                const indent = Math.floor(spaces / 4);
                const line = raw.trim();
                const node = {};
                while (stack.length && stack[stack.length - 1].indent >= indent) { stack.pop(); }
                stack[stack.length - 1].node[line] = node;
                stack.push({ indent, node });
            }
            return root;
        },
        escapeHtml: (v) => String(v),
        joinTreePath: (parent, key) => {
            const cleanKey = String(key).replace(/[\\/]+$/, '');
            return parent ? `${parent}/${cleanKey}` : cleanKey;
        }
    },
    tree: {
        isPreviewableFile(path) {
            const ext = path.split('.').pop().toLowerCase();
            return !['png', 'jpg', 'mp3', 'mp4'].includes(ext);
        },
        getFilePathsFromTree(tree, parent = '') {
            const paths = [];
            for (const [key, value] of Object.entries(tree)) {
                const isFolder = key.endsWith('/') || Object.keys(value).length > 0;
                const path = parent ? `${parent}/${key.replace(/\/$/, '')}` : key.replace(/\/$/, '');
                if (isFolder) {
                    paths.push(...app.tree.getFilePathsFromTree(value, path));
                } else {
                    paths.push(path);
                }
            }
            return paths;
        },
        renderTree(tree, prefix = '') {
            return Object.entries(tree).map(([key, value]) => {
                const path = `${prefix}${key}`;
                const children = Object.keys(value).length ? app.tree.renderTree(value, path) : '';
                return `<div class="tree-item" data-path="${path}">${key}</div>${children}`;
            }).join('');
        }
    },
    icons: { refreshIcons: () => {}, getIconDetails: () => ({ icon: 'file', class: '' }) },
    modals: {
        showPromptAsync: async () => null,
        showConfirmAsync: async () => false,
        trapFocus: () => {},
        closeModalAnimated: () => {}
    },
    toast: { showToast: vi.fn() },
    electronAPI: {
        saveTemplateAs: vi.fn(async () => ({ canceled: true })),
        loadTemplateFile: vi.fn(async () => ({ canceled: true })),
        readTemplateFileAtPath: vi.fn(async () => ({ error: 'unavailable' })),
        getFilePath: vi.fn(() => '/tmp/shared.tree-template')
    },
    undoredo: { pushUndoState: () => {} },
    tabs: {
        getActiveTab: () => null,
        markTabLoaded: () => {},
        renderProjectTabBar: () => {},
        renderCodeTabBar: () => {},
        saveTabsToStorage: () => {}
    },
    editor: null
};

app.editor = createEditor(app);
app.editor.refreshTreeView = () => {};

const templates = createTemplatesUi(app);
const { resolveTemplateSnapshot } = templates;

describe('resolveTemplateSnapshot', () => {
    it('replaces placeholders in tree and file paths', () => {
        const template = templatesData.vite;
        const snapshot = resolveTemplateSnapshot(template);
        expect(snapshot.treeText).toContain('my-app/');
        expect(snapshot.treeText).not.toContain('{projectName}');
        expect(snapshot.files['my-app/package.json']).toContain('my-app');
        expect(snapshot.files['my-app/src/App.jsx']).toBeTruthy();
        expect(snapshot.files['{projectName}/package.json']).toBeUndefined();
    });
});

describe('template preview file selection', () => {
    it('prefers previewable files over images and media', () => {
        templatesData.media = {
            label: 'Media',
            tree: `app/
    logo.png
    clip.mp4
    readme.md`,
            files: {
                'app/logo.png': '',
                'app/clip.mp4': '',
                'app/readme.md': '# Readme'
            }
        };
        templates.selectedTemplateName = 'media';
        const snapshot = resolveTemplateSnapshot(templatesData.media);
        const paths = Object.keys(snapshot.files);
        const previewable = paths.filter((p) => app.tree.isPreviewableFile(p)).sort();
        expect(previewable[0]).toBe('app/readme.md');
    });
});

describe('template sources', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage._data = {};
        templates.setTemplateSource('builtin');
        templates.selectedTemplateName = 'vite';
        app.electronAPI.saveTemplateAs = vi.fn(async () => ({ canceled: true }));
        app.electronAPI.loadTemplateFile = vi.fn(async () => ({ canceled: true }));
        app.electronAPI.readTemplateFileAtPath = vi.fn(async () => ({ error: 'unavailable' }));
    });

    it('keeps built-in and custom templates in separate lists', () => {
        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/', files: {} }
        }));

        expect(Object.keys(templates.getTemplatesForSource('builtin'))).toContain('vite');
        expect(Object.keys(templates.getTemplatesForSource('builtin'))).not.toContain('custom-demo');
        expect(Object.keys(templates.getTemplatesForSource('custom'))).toEqual(['custom-demo']);
        expect(templates.isCustomTemplate('custom-demo')).toBe(true);
        expect(templates.isCustomTemplate('vite')).toBe(false);
    });
    it('opens with the first built-in template in alphabetical order selected', async () => {
        templatesData.alpha = {
            label: 'Alpha Starter',
            tree: 'alpha/\n    index.js',
            files: { 'alpha/index.js': 'export {}' }
        };
        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/', files: {} }
        }));
        document.body.innerHTML = `
            <div id="templatesModal">
                <div id="templatesList"></div>
                <div id="templatesEmptyState" class="hidden"></div>
                <div id="templateStructureBody"></div>
                <textarea id="templateTreeEditor"></textarea>
                <div id="templateTreePreview"></div>
                <div id="templateFilePanel" class="template-file-panel">
                    <span id="templateFileName"></span>
                    <span id="templateFileMode"></span>
                    <textarea id="templateFileEditor"></textarea>
                </div>
            </div>
        `;

        templates.setTemplateSource('custom');
        templates.selectedTemplateName = 'custom-demo';
        await templates.openTemplatesModal();

        expect(templates.selectedTemplateSource).toBe('builtin');
        expect(templates.selectedTemplateName).toBe('alpha');
        expect(document.querySelector('.template-option.active')?.dataset.template).toBe('alpha');

        templates.closeTemplatesModal();
        delete templatesData.alpha;
    });

    it('removes a custom template after confirmation', async () => {
        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/', files: {} },
            'custom-other': { label: 'Other', tree: 'other/', files: {} }
        }));
        templates.setTemplateSource('custom');
        templates.selectedTemplateName = 'custom-demo';

        app.modals.showConfirmAsync = async () => true;
        await templates.deleteCustomTemplate();

        const remaining = JSON.parse(localStorage.getItem('custom_templates'));
        expect(remaining['custom-demo']).toBeUndefined();
        expect(remaining['custom-other']).toBeTruthy();
        expect(templates.selectedTemplateName).toBe('custom-other');
        expect(templates.selectedTemplateSource).toBe('custom');
    });

    it('creates a blank custom template for inline editing', async () => {
        app.modals.showPromptAsync = async () => 'My Starter';
        await templates.createBlankCustomTemplate();

        const custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-my-starter']).toBeTruthy();
        expect(custom['custom-my-starter'].tree).toContain('{projectName}');
        expect(templates.selectedTemplateSource).toBe('custom');
        expect(templates.selectedTemplateName).toBe('custom-my-starter');
    });

    it('clears the file panel when the structure editor is emptied', async () => {
        document.body.innerHTML = `
            <textarea id="editor"></textarea>
            <div id="templatesModal">
                <div id="templatesList"></div>
                <div id="templatesEmptyState" class="hidden"></div>
                <div id="templateStructureBody"></div>
                <textarea id="templateTreeEditor"></textarea>
                <div id="templateTreePreview"></div>
                <div id="templateFilePanel" class="template-file-panel has-file">
                    <div class="template-file-header">
                        <span id="templateFileName" class="template-file-path">demo/index.js</span>
                        <span id="templateFileMode" class="template-file-mode">js</span>
                    </div>
                    <div class="template-file-body">
                        <textarea id="templateFileEditor">console.log()</textarea>
                    </div>
                </div>
            </div>
        `;
        app.editor.bindEditorInput();

        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/\n    index.js', files: { 'demo/index.js': 'x' } }
        }));
        await templates.openTemplatesModal();
        templates.setTemplateSource('custom');
        templates.bindTemplateModal();

        const treeEditor = document.getElementById('templateTreeEditor');
        treeEditor.value = '';
        treeEditor.dispatchEvent(new Event('input', { bubbles: true }));

        expect(document.getElementById('templateFileName').textContent).toBe('');
        expect(document.getElementById('templateFileMode').textContent).toBe('');
        expect(document.getElementById('templateFileEditor').value).toBe('');
        expect(document.getElementById('templateFilePanel').classList.contains('has-file')).toBe(false);
    });

    it('updates live structure preview while editing a custom template', async () => {
        document.body.innerHTML = `
            <textarea id="editor"></textarea>
            <div id="templatesModal">
                <div id="templatesList"></div>
                <div id="templatesEmptyState" class="hidden"></div>
                <div id="templateStructureBody"></div>
                <textarea id="templateTreeEditor"></textarea>
                <p id="templateStructurePreviewLabel" class="hidden"></p>
                <div id="templateTreePreview"></div>
                <div id="templateFilePanel" class="template-file-panel">
                    <div class="template-file-header">
                        <span id="templateFileName" class="template-file-path"></span>
                        <span id="templateFileMode" class="template-file-mode"></span>
                    </div>
                    <div class="template-file-body">
                        <p id="templateFileEmpty" class="template-file-empty"></p>
                        <textarea id="templateFileEditor"></textarea>
                    </div>
                </div>
            </div>
        `;
        app.editor.bindEditorInput();

        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/\n    index.js', files: { 'demo/index.js': 'x' } }
        }));
        await templates.openTemplatesModal();
        templates.setTemplateSource('custom');
        templates.bindTemplateModal();

        const treeEditor = document.getElementById('templateTreeEditor');
        treeEditor.value = 'demo/\n    index.js\n    lib/\n        utils.js';
        treeEditor.dispatchEvent(new Event('input', { bubbles: true }));

        const preview = document.getElementById('templateTreePreview');
        expect(preview.innerHTML).toContain('demo/');
        expect(preview.innerHTML).toContain('utils.js');
        expect(preview.querySelector('[tabindex="0"]')).toBeNull();
    });

    it('renders and updates a live Markdown preview for template files', () => {
        document.body.innerHTML = `
            <div id="templateStructureBody"></div>
            <textarea id="templateTreeEditor"></textarea>
            <div id="templateTreePreview"></div>
            <div id="templateFilePanel" class="template-file-panel">
                <span id="templateFileName"></span>
                <span id="templateFileMode"></span>
                <textarea id="templateFileEditor"></textarea>
                <div id="templateMarkdownPreview" class="markdown-preview"></div>
            </div>
        `;
        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-docs': {
                label: 'Docs',
                tree: 'docs/\n    README.md',
                files: { 'docs/README.md': '# Initial' }
            }
        }));
        templates.setTemplateSource('custom');
        templates.selectedTemplateName = 'custom-docs';
        templates.bindTemplateModal();

        const snapshot = templates.resolveTemplateSnapshot(
            JSON.parse(localStorage.getItem('custom_templates'))['custom-docs']
        );
        templates.renderTemplateFilePreview(snapshot, 'docs/README.md');

        const panel = document.getElementById('templateFilePanel');
        const editor = document.getElementById('templateFileEditor');
        const preview = document.getElementById('templateMarkdownPreview');
        expect(panel.classList.contains('markdown-file')).toBe(true);
        expect(preview.innerHTML).toContain('# Initial');

        editor.value = '# Updated';
        editor.dispatchEvent(new Event('input', { bubbles: true }));

        expect(preview.innerHTML).toContain('# Updated');
        expect(app.markdown.renderMarkdown).toHaveBeenLastCalledWith('# Updated');
    });

    it('exports a custom template as .tree-template', async () => {
        const entry = { label: 'Shared', tree: 'app/\n    index.js', files: { 'app/index.js': 'x' } };
        localStorage.setItem('custom_templates', JSON.stringify({ 'custom-shared': entry }));
        templates.setTemplateSource('custom');
        templates.selectedTemplateName = 'custom-shared';

        app.electronAPI.saveTemplateAs = vi.fn(async () => ({ canceled: false, filePath: '/tmp/shared.tree-template' }));
        await templates.exportCustomTemplate('custom-shared');

        expect(app.electronAPI.saveTemplateAs).toHaveBeenCalledWith(
            serializeTemplateFile(entry),
            'Shared',
            'en'
        );
        expect(app.toast.showToast).toHaveBeenCalledWith('template_export_saved');
    });

    it('recognizes .tree-template file names', () => {
        expect(templates.isTreeTemplateFileName('starter.tree-template')).toBe(true);
        expect(templates.isTreeTemplateFileName('starter.tree')).toBe(false);
    });

    it('imports a .tree-template file into custom templates', async () => {
        const payload = serializeTemplateFile({
            label: 'Imported',
            tree: 'pkg/\n    main.js',
            files: { 'pkg/main.js': 'export {}' }
        });
        app.electronAPI.loadTemplateFile = vi.fn(async () => ({ canceled: false, content: payload }));
        app.modals.showConfirmAsync = async () => true;

        await templates.importTemplateFile();

        const custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-imported']).toBeTruthy();
        expect(custom['custom-imported'].tree).toContain('pkg/');
        expect(templates.selectedTemplateName).toBe('custom-imported');
        expect(app.toast.showToast).toHaveBeenCalledWith('template_import_success');
    });

    it('imports a dropped .tree-template file path into custom templates', async () => {
        const payload = serializeTemplateFile({
            label: 'Dropped',
            tree: 'pkg/\n    main.js',
            files: { 'pkg/main.js': 'export {}' }
        });
        app.electronAPI.readTemplateFileAtPath = vi.fn(async () => ({ content: payload }));
        app.modals.showConfirmAsync = async () => true;

        await templates.importTemplateFromPath('/tmp/dropped.tree-template');

        const custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-dropped']).toBeTruthy();
        expect(templates.selectedTemplateName).toBe('custom-dropped');
        expect(app.toast.showToast).toHaveBeenCalledWith('template_import_success');
    });

    it('persists custom template structure and file edits automatically', async () => {
        vi.useFakeTimers();
        document.body.innerHTML = `
            <textarea id="editor"></textarea>
            <div id="templatesModal">
                <div id="templatesList"></div>
                <div id="templatesEmptyState" class="hidden"></div>
                <div id="templateStructureBody"></div>
                <textarea id="templateTreeEditor"></textarea>
                <div id="templateTreePreview"></div>
                <div id="templateFilePanel" class="template-file-panel has-file">
                    <div class="template-file-header">
                        <span id="templateFileName" class="template-file-path">demo/index.js</span>
                        <span id="templateFileMode" class="template-file-mode">js</span>
                    </div>
                    <div class="template-file-body">
                        <textarea id="templateFileEditor">original</textarea>
                    </div>
                </div>
            </div>
        `;
        app.editor.bindEditorInput();

        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': {
                label: 'Demo',
                tree: 'demo/\n    index.js',
                files: { 'demo/index.js': 'original' }
            }
        }));
        await templates.openTemplatesModal();
        templates.setTemplateSource('custom');
        templates.bindTemplateModal();

        const treeEditor = document.getElementById('templateTreeEditor');
        const fileEditor = document.getElementById('templateFileEditor');

        treeEditor.value = 'demo/\n    index.js\n    utils.js';
        treeEditor.dispatchEvent(new Event('input', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(200);

        let custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-demo'].tree).toContain('utils.js');
        expect(custom['custom-demo'].files['demo/utils.js']).toBe('');

        fileEditor.value = 'console.log("updated")';
        fileEditor.dispatchEvent(new Event('input', { bubbles: true }));
        await vi.advanceTimersByTimeAsync(200);

        custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-demo'].files['demo/index.js']).toBe('console.log("updated")');

        templates.closeTemplatesModal();
        custom = JSON.parse(localStorage.getItem('custom_templates'));
        expect(custom['custom-demo']).toBeTruthy();
        expect(app.dbStorage.set).toHaveBeenCalled();

        vi.useRealTimers();
    });

    it('switches to built-in templates when the last custom template is removed', async () => {
        localStorage.setItem('custom_templates', JSON.stringify({
            'custom-demo': { label: 'Demo', tree: 'demo/', files: {} }
        }));
        templates.setTemplateSource('custom');
        templates.selectedTemplateName = 'custom-demo';

        app.modals.showConfirmAsync = async () => true;
        await templates.deleteCustomTemplate();

        expect(templates.selectedTemplateSource).toBe('builtin');
        expect(templates.getTemplatesForSource('builtin')[templates.selectedTemplateName]).toBeTruthy();
    });
});
