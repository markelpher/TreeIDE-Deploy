/**
 * @vitest-environment happy-dom
 */

import { createTemplatesUi } from '../src/renderer/modules/templates-ui.js';

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
        }
    },
    helpers: {
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
        renderTree: () => ''
    },
    icons: { refreshIcons: () => {}, getIconDetails: () => ({ icon: 'file', class: '' }) },
    modals: {},
    toast: { showToast: () => {} },
    undoredo: { pushUndoState: () => {} }
};

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