import {
    escapeHtml,
    formatMessage,
    getFilePathsFromTree,
    getLineIndent,
    joinTreePath,
    parseEditorContent,
    pathLooksUnsafe
} from '../src/shared/helpers.js';
import { createValidation } from '../src/renderer/modules/validation.js';
import { createTree } from '../src/renderer/modules/tree.js';
import { createBuildShared } from '../src/renderer/modules/build-shared.js';

const i18n = {
    t: (key) => {
        const dict = {
            untitled: 'Untitled',
            validation_empty: 'No items to build',
            build_wizard_files_folders: '{files} files · {folders} folders',
            build_wizard_existing_output_warning: 'Already contains: {details}.',
            build_existing_structure_part: '{count} project file(s)'
        };
        return dict[key] || key;
    }
};

const app = {
    i18n,
    helpers: { escapeHtml, formatMessage, getLineIndent, pathLooksUnsafe },
    state: { editor: { value: '' }, fileContents: {} },
    tabs: {
        activeProjectTabId: 'tab-1',
        projectTabs: [
            { id: 'tab-1', name: 'Empty', editorContent: '', fileContents: {} },
            { id: 'tab-2', name: 'Filled', editorContent: 'src/\n    index.js', fileContents: {} }
        ]
    },
    tree: createTree({
        helpers: { joinTreePath, parseEditorContent, getFilePathsFromTree },
        icons: { getIconDetails: () => ({ icon: 'file', class: '' }) }
    }),
    fileops: {
        formatMessage: (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
    }
};

app.validation = createValidation(app);
const shared = createBuildShared(app);

describe('build existing warning', () => {
    it('includes tree and zip file names in the warning', () => {
        const message = shared.formatBuildExistingWarning({
            structureExisting: 2,
            existingStructureNames: ['src/index.js', 'README.md'],
            existingTreeNames: ['demo.tree'],
            existingZipNames: ['demo.zip']
        });
        expect(message).toContain('src/index.js');
        expect(message).toContain('README.md');
        expect(message).toContain('demo.tree');
        expect(message).toContain('demo.zip');
    });

    it('summarizes many structure files by count', () => {
        const message = shared.formatBuildExistingWarning({
            structureExisting: 12,
            existingStructureNames: Array.from({ length: 12 }, (_, i) => `file-${i}.js`)
        });
        expect(message).toContain('12 project file(s)');
        expect(message).not.toContain('file-0.js');
    });

    it('lists multiple tree and zip files', () => {
        const message = shared.formatBuildExistingWarning({
            structureExisting: 0,
            existingTreeNames: ['alpha.tree', 'beta.tree'],
            existingZipNames: ['alpha.zip', 'beta.zip']
        });
        expect(message).toContain('alpha.tree, beta.tree');
        expect(message).toContain('alpha.zip, beta.zip');
    });
});

describe('build shared project tabs', () => {
    it('hides empty tabs when at least one tab has content', () => {
        const visible = shared.getProjectTabsForBuildUi();
        expect(visible).toHaveLength(1);
        expect(visible[0].id).toBe('tab-2');
    });

    it('shows zero counts for empty payloads', () => {
        const payload = shared.getTabBuildPayload(app.tabs.projectTabs[0]);
        const meta = shared.getPayloadDisplayMeta(payload);
        expect(meta.isEmpty).toBe(true);
        expect(meta.structuralErrors).toHaveLength(0);
        expect(meta.detailText).toBe('0 files · 0 folders');
    });

    it('renders build tabs like editor tabs without rename or modified controls', () => {
        const html = shared.renderBuildProjectTabBar(app.tabs.projectTabs, 'tab-2', {
            escapeHtml: (v) => v
        });
        expect(html).toContain('project-tab');
        expect(html).toContain('project-tab-close');
        expect(html).not.toContain('project-tab-rename-icon');
        expect(html).not.toContain('project-tab-modified');
        expect(html).toContain('data-build-close-tab-id="tab-1"');
        expect(html).toContain('active');
    });

    it('parses inactive tab editor content when treeData is empty', () => {
        const tab = {
            id: 'tab-3',
            name: 'Stale',
            editorContent: 'src/\n    index.js',
            treeData: {},
            fileContents: { 'src/index.js': 'console.log(1)' }
        };
        app.tabs.projectTabs.push(tab);
        const payload = shared.getTabBuildPayload(tab);
        expect(app.tree.getFilePathsFromTree(payload.treeData)).toEqual(['src/index.js']);
        expect(payload.fileContents['src/index.js']).toBe('console.log(1)');
    });

    it('keeps the tab bar visible after excluding tabs down to one', () => {
        const available = shared.getProjectTabsForBuildUi();
        const excluded = new Set(['tab-2']);
        expect(shared.shouldShowBuildTabBar(available, excluded)).toBe(true);
        const html = shared.renderBuildProjectTabBar([app.tabs.projectTabs[0]], 'tab-1', {
            escapeHtml: (v) => v
        });
        expect(html).toContain('project-tab');
        expect(html).not.toContain('project-tab-close');
    });
});