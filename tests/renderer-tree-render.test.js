/**
 * @vitest-environment happy-dom
 */

import { parseEditorContent, joinTreePath } from '../src/shared/helpers.js';
import { escapeHtml as escapeText } from '../src/shared/helpers.js';
import { createTree } from '../src/renderer/modules/tree.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const app = {
    helpers: { escapeHtml: escapeText, joinTreePath, parseEditorContent },
    icons: {
        getIconDetails: (name, isFolder) => (
            isFolder
                ? { icon: 'folder', class: 'tree-icon-folder' }
                : { icon: 'file', class: 'tree-icon-default' }
        )
    }
};

const { renderTree } = createTree(app);

const cssDir = join(process.cwd(), 'src/renderer/css');
const css = [
    'variables.css', 'reset.css', 'layout.css', 'tree.css'
].map((f) => readFileSync(join(cssDir, f), 'utf8')).join('\n');

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

describe('renderTree', () => {
    it('renders a simple tree structure', () => {
        const tree = parseEditorContent('src/\n    index.js');
        const html = renderTree(tree);
        expect(html).toContain('tree-item');
        expect(html).toContain('index.js');
        expect(html).toContain('folder-node');
        expect(html).toContain('file-node');
    });

    it('marks active file', () => {
        const tree = parseEditorContent('file.js');
        const html = renderTree(tree, '', '', 1, { activeFilePath: 'file.js' });
        expect(html).toContain('active-file');
    });

    it('adds fold spacers for files when collapsible', () => {
        const tree = parseEditorContent('src/\n    index.js');
        const html = renderTree(tree, '', '', 1, { collapsible: true, collapsedPaths: new Set() });
        expect(html).toContain('tree-fold-btn');
        expect(html).toContain('tree-fold-spacer');
    });
});