
import { escapeHtml, joinTreePath } from '../src/shared/helpers.js';
import { createTree } from '../src/renderer/modules/tree.js';

const app = {
    helpers: { escapeHtml, joinTreePath },
    icons: {
        getIconDetails: () => ({ icon: 'file', class: 'tree-icon-default' })
    }
};

const { isPreviewableFile, nonPreviewableExtensions, normalizeTreeName } = createTree(app);

describe('nonPreviewableExtensions', () => {
    it('contains image extensions', () => {
        expect(nonPreviewableExtensions.has('png')).toBe(true);
        expect(nonPreviewableExtensions.has('jpg')).toBe(true);
        expect(nonPreviewableExtensions.has('gif')).toBe(true);
    });

    it('contains binary document extensions', () => {
        expect(nonPreviewableExtensions.has('pdf')).toBe(true);
        expect(nonPreviewableExtensions.has('doc')).toBe(true);
    });

    it('contains archive extensions', () => {
        expect(nonPreviewableExtensions.has('zip')).toBe(true);
        expect(nonPreviewableExtensions.has('tar')).toBe(true);
        expect(nonPreviewableExtensions.has('rar')).toBe(true);
    });

    it('does not contain code file extensions', () => {
        expect(nonPreviewableExtensions.has('js')).toBe(false);
        expect(nonPreviewableExtensions.has('py')).toBe(false);
        expect(nonPreviewableExtensions.has('css')).toBe(false);
        expect(nonPreviewableExtensions.has('html')).toBe(false);
        expect(nonPreviewableExtensions.has('md')).toBe(false);
        expect(nonPreviewableExtensions.has('json')).toBe(false);
    });
});

describe('isPreviewableFile', () => {
    it('returns true for text files', () => {
        expect(isPreviewableFile('src/index.js')).toBe(true);
        expect(isPreviewableFile('README.md')).toBe(true);
    });

    it('returns false for binary extensions', () => {
        expect(isPreviewableFile('image.png')).toBe(false);
        expect(isPreviewableFile('archive.zip')).toBe(false);
    });
});

describe('normalizeTreeName', () => {
    it('strips trailing slashes', () => {
        expect(normalizeTreeName('src/')).toBe('src');
        expect(normalizeTreeName('file.js')).toBe('file.js');
    });
});