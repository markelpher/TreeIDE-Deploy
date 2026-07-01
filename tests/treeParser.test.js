import { parseTreeContent } from '../src/main/project/treeParser.js';

describe('parseTreeContent', () => {
    it('parses single file', () => {
        expect(parseTreeContent('file.js')).toEqual({ 'file.js': {} });
    });

    it('parses folder with file', () => {
        expect(parseTreeContent('src/\n    file.js')).toEqual({
            'src/': { 'file.js': {} }
        });
    });

    it('parses nested structure', () => {
        const input = 'src/\n    components/\n        App.jsx\n    index.js';
        expect(parseTreeContent(input)).toEqual({
            'src/': {
                'components/': { 'App.jsx': {} },
                'index.js': {}
            }
        });
    });

    it('handles ... continuation lines (unindented)', () => {
        const input = 'src/\n...file.js\n...file2.js';
        expect(parseTreeContent(input)).toEqual({
            'src/': { 'file.js': {}, 'file2.js': {} }
        });
    });

    it('treats indented ... as literal name', () => {
        const input = 'src/\n    ...file.js';
        expect(parseTreeContent(input)).toEqual({
            'src/': { '...file.js': {} }
        });
    });

    it('returns empty object for empty input', () => {
        expect(parseTreeContent('')).toEqual({});
    });

    it('skips blank lines', () => {
        expect(parseTreeContent('a\n\n\nb')).toEqual({ 'a': {}, 'b': {} });
    });

    it('handles CRLF line endings', () => {
        expect(parseTreeContent('a\r\nb')).toEqual({ 'a': {}, 'b': {} });
    });

    it('parses multiple folders at root', () => {
        expect(parseTreeContent('src/\ndoc/')).toEqual({
            'src/': {},
            'doc/': {}
        });
    });
});
