
import { escapeHtml } from '../src/shared/helpers.js';
import { createMarkdown } from '../src/renderer/modules/markdown.js';

const { renderMarkdown, renderReleaseNotes, isProbablyHtml, processInline } = createMarkdown({
    helpers: { escapeHtml }
});

describe('processInline', () => {
    it('renders bold with **', () => {
        expect(processInline('**bold**')).toBe('<strong>bold</strong>');
    });

    it('renders bold with __', () => {
        expect(processInline('__bold__')).toBe('<strong>bold</strong>');
    });

    it('renders italic with *', () => {
        expect(processInline('*italic*')).toBe('<em>italic</em>');
    });

    it('renders italic with _', () => {
        expect(processInline('_italic_')).toBe('<em>italic</em>');
    });

    it('renders strikethrough', () => {
        expect(processInline('~~strike~~')).toBe('<del>strike</del>');
    });

    it('renders inline code', () => {
        expect(processInline('`code`')).toBe('<code>code</code>');
    });

    it('renders safe links', () => {
        expect(processInline('[link](https://example.com)')).toBe('<a href="https://example.com">link</a>');
    });

    it('rejects javascript links', () => {
        expect(processInline('[x](javascript:alert(1))')).toBe('[x](javascript:alert(1))');
    });
});

describe('renderMarkdown', () => {
    it('renders headings', () => {
        const html = renderMarkdown('# Title\n## Sub');
        expect(html).toContain('<h1>Title</h1>');
        expect(html).toContain('<h2>Sub</h2>');
    });

    it('renders lists', () => {
        const html = renderMarkdown('- one\n- two');
        expect(html).toContain('<ul>');
        expect(html).toContain('<li>one</li>');
        expect(html).toContain('<li>two</li>');
    });

    it('renders fenced code blocks', () => {
        const html = renderMarkdown('```\nline1\nline2\n```');
        expect(html).toContain('<pre><code>line1\nline2</code></pre>');
    });

    it('escapes raw HTML in source', () => {
        const html = renderMarkdown('<script>alert(1)</script>');
        expect(html).not.toContain('<script>');
        expect(html).toContain('&lt;script&gt;');
    });

    it('renders horizontal rule', () => {
        expect(renderMarkdown('---')).toContain('<hr>');
    });

    it('renders paragraphs', () => {
        expect(renderMarkdown('hello world')).toContain('<p>hello world</p>');
    });

    it('renders indented changelog headings and lists', () => {
        const html = renderMarkdown('  ### Added\n  - first item');
        expect(html).toContain('<h3>Added</h3>');
        expect(html).toContain('<li>first item</li>');
    });
});

describe('renderReleaseNotes', () => {
    it('detects HTML release notes from GitHub', () => {
        const html = '<h3>Added</h3><ul><li>Fix bug</li></ul>';
        expect(isProbablyHtml(html)).toBe(true);
        expect(renderReleaseNotes(html)).toBe(html);
    });

    it('renders markdown release notes', () => {
        const html = renderReleaseNotes('### Fixed\n- item');
        expect(html).toContain('<h3>Fixed</h3>');
        expect(html).toContain('<li>item</li>');
    });
});