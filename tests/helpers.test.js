import {
    escapeHtml,
    formatMessage,
    resolveUserMessage,
    getLineIndent,
    joinTreePath,
    parseEditorContent,
    getFilePathsFromTree,
    pathLooksUnsafe,
    getLineBlockBounds,
    applyBlockIndent,
    applyTabKey,
    applyBackspaceKey,
    getBackspaceIndentDeleteLength,
    transformLineIndent,
    shouldUseBlockIndent,
    INDENT_UNIT
} from '../src/shared/helpers.js';

describe('escapeHtml', () => {
    it('returns plain text unchanged', () => {
        expect(escapeHtml('hello')).toBe('hello');
    });

    it('escapes ampersand', () => {
        expect(escapeHtml('a&b')).toBe('a&amp;b');
    });

    it('escapes angle brackets', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes quotes', () => {
        expect(escapeHtml('"quotes"')).toBe('&quot;quotes&quot;');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("it's")).toBe("it&#39;s");
    });

    it('handles empty string', () => {
        expect(escapeHtml('')).toBe('');
    });

    it('coerces numbers to strings', () => {
        expect(escapeHtml(42)).toBe('42');
    });

    it('escapes multiple special chars', () => {
        expect(escapeHtml('<div class="a">&amp;</div>')).toBe('&lt;div class=&quot;a&quot;&gt;&amp;amp;&lt;/div&gt;');
    });
});

describe('resolveUserMessage', () => {
    it('returns plain strings unchanged', () => {
        expect(resolveUserMessage('Line 2: bad indent')).toBe('Line 2: bad indent');
    });

    it('unwraps validation error objects', () => {
        expect(resolveUserMessage({ message: 'Line 3: invalid name', line: 3 }))
            .toBe('Line 3: invalid name');
    });

    it('unwraps objects with error field', () => {
        expect(resolveUserMessage({ error: 'update_failed' })).toBe('update_failed');
    });

    it('returns fallback for empty object', () => {
        expect(resolveUserMessage({}, 'fallback')).toBe('fallback');
    });

    it('does not stringify objects as [object Object]', () => {
        expect(resolveUserMessage({ line: 2 })).toBe('');
        expect(resolveUserMessage({ line: 2 }, 'unknown')).toBe('unknown');
    });
});

describe('formatMessage', () => {
    it('replaces single placeholder', () => {
        expect(formatMessage('Hello {name}', { name: 'World' })).toBe('Hello World');
    });

    it('replaces multiple placeholders', () => {
        expect(formatMessage('{a} and {b}', { a: 'X', b: 'Y' })).toBe('X and Y');
    });

    it('leaves static strings unchanged', () => {
        expect(formatMessage('static', {})).toBe('static');
    });

    it('leaves missing keys unchanged', () => {
        expect(formatMessage('Hello {missing}', {})).toBe('Hello {missing}');
    });

    it('replaces same placeholder multiple times', () => {
        expect(formatMessage('{x} and {x}', { x: 'dup' })).toBe('dup and dup');
    });
});

describe('block indent helpers', () => {
    it('includes every selected line in the block bounds', () => {
        const value = 'src/\n    index.js\n    utils.js';
        const { blockStart, blockEnd } = getLineBlockBounds(value, 0, value.indexOf('index'));
        expect(value.slice(blockStart, blockEnd)).toBe('src/\n    index.js');
    });

    it('indents all lines in a multi-line selection', () => {
        const value = 'src/\nindex.js';
        const result = applyBlockIndent(value, 0, value.length, false);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('    src/\n    index.js');
    });

    it('indents with four spaces per level', () => {
        expect(transformLineIndent('file.js', false)).toBe('    file.js');
        expect(INDENT_UNIT).toBe('    ');
    });

    it('outdents the active line and preserves cursor offset', () => {
        const value = '\tsrc/\n\tindex.js';
        const cursor = value.indexOf('index') + 2;
        const result = applyBlockIndent(value, cursor, cursor, true);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('\tsrc/\nindex.js');
        expect(result.value[result.start]).toBe('d');
    });

    it('outdents every line in a multi-line selection', () => {
        const value = '\tsrc/\n\tindex.js';
        const result = applyBlockIndent(value, 0, value.length, true);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('src/\nindex.js');
    });

    it('uses block indent at line start or in leading whitespace', () => {
        const value = 'src/\n    index.js';
        const line2Start = value.indexOf('    index');
        expect(shouldUseBlockIndent(value, 0, 0, false)).toBe(true);
        expect(shouldUseBlockIndent(value, line2Start, line2Start, false)).toBe(true);
        expect(shouldUseBlockIndent(value, value.indexOf('index') + 2, value.indexOf('index') + 2, false)).toBe(false);
    });

    it('removes up to four leading spaces on outdent', () => {
        expect(transformLineIndent('    file.js', true)).toBe('file.js');
        expect(transformLineIndent('  file.js', true)).toBe('file.js');
    });

    it('does nothing when outdent has no leading whitespace', () => {
        const value = 'src/\nindex.js';
        const result = applyBlockIndent(value, 4, 4, true);
        expect(result.changed).toBe(false);
    });
});

describe('applyBackspaceKey', () => {
    it('removes 4 spaces when backspacing at end of one indent level', () => {
        const value = '    index.js';
        const pos = 4;
        const result = applyBackspaceKey(value, pos, pos);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('index.js');
        expect(result.start).toBe(0);
    });

    it('removes only 4 spaces from deeper indent', () => {
        const value = '        index.js';
        const pos = 8;
        const result = applyBackspaceKey(value, pos, pos);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('    index.js');
        expect(result.start).toBe(4);
    });

    it('does not intercept backspace mid-line', () => {
        const value = '    index.js';
        const pos = value.indexOf('x') + 1;
        const result = applyBackspaceKey(value, pos, pos);
        expect(result.changed).toBe(false);
    });
});

describe('applyTabKey', () => {
    it('always inserts 4 spaces at the cursor on an empty line', () => {
        const value = 'src/\n';
        const pos = value.length;
        const result = applyTabKey(value, pos, pos, false);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('src/\n    ');
        expect(result.start).toBe(9);
    });

    it('always inserts 4 spaces at the cursor even when the line already has indent', () => {
        const value = 'src/\n    ';
        const pos = value.length;
        const result = applyTabKey(value, pos, pos, false);
        expect(result.changed).toBe(true);
        expect(result.value).toBe('src/\n        ');
    });

    it('inserts 4 spaces at the cursor mid-line', () => {
        const value = 'index.js';
        const result = applyTabKey(value, 0, 0, false);
        expect(result.value).toBe('    index.js');
        expect(result.start).toBe(4);
    });

    it('outdents with Shift+Tab', () => {
        const value = '    index.js';
        const result = applyTabKey(value, 4, 4, true);
        expect(result.value).toBe('index.js');
    });
});

describe('getLineIndent', () => {
    it('no indent', () => {
        expect(getLineIndent('file.js')).toEqual({ indent: 0, value: 'file.js' });
    });

    it('tab indent', () => {
        expect(getLineIndent('\tfile.js')).toEqual({ indent: 1, value: 'file.js' });
    });

    it('4 spaces indent', () => {
        expect(getLineIndent('    file.js')).toEqual({ indent: 1, value: 'file.js' });
    });

    it('8 spaces indent', () => {
        expect(getLineIndent('        file.js')).toEqual({ indent: 2, value: 'file.js' });
    });

    it('mixed tabs and spaces', () => {
        expect(getLineIndent('\t    file.js')).toEqual({ indent: 2, value: 'file.js' });
    });

    it('... prefix counts as indent', () => {
        expect(getLineIndent('...file.js')).toEqual({ indent: 1, value: 'file.js' });
    });

    it('double ... prefix', () => {
        expect(getLineIndent('......file.js')).toEqual({ indent: 2, value: 'file.js' });
    });

    it('folder with trailing slash', () => {
        expect(getLineIndent('src/')).toEqual({ indent: 0, value: 'src/' });
    });

    it('nested folder', () => {
        expect(getLineIndent('\tsrc/')).toEqual({ indent: 1, value: 'src/' });
    });
});

describe('joinTreePath', () => {
    it('joins parent and key', () => {
        expect(joinTreePath('src', 'file.js')).toBe('src/file.js');
    });

    it('empty parent', () => {
        expect(joinTreePath('', 'file.js')).toBe('file.js');
    });

    it('nested paths', () => {
        expect(joinTreePath('src/main', 'index.js')).toBe('src/main/index.js');
    });

    it('strips trailing slashes from folder keys', () => {
        expect(joinTreePath('src/', 'file.js')).toBe('src/file.js');
        expect(joinTreePath('', 'folder/')).toBe('folder');
        expect(joinTreePath('a/b/', 'c/')).toBe('a/b/c');
    });
});

describe('parseEditorContent', () => {
    it('empty string returns empty object', () => {
        expect(parseEditorContent('')).toEqual({});
    });

    it('single file', () => {
        expect(parseEditorContent('file.js')).toEqual({ 'file.js': {} });
    });

    it('folder with file', () => {
        expect(parseEditorContent('src/\n    file.js')).toEqual({
            'src/': { 'file.js': {} }
        });
    });

    it('nested structure', () => {
        const input = 'src/\n    components/\n        App.jsx\n    index.js';
        expect(parseEditorContent(input)).toEqual({
            'src/': {
                'components/': { 'App.jsx': {} },
                'index.js': {}
            }
        });
    });

    it('skips blank lines', () => {
        expect(parseEditorContent('file.js\n\n\nfile2.js')).toEqual({
            'file.js': {},
            'file2.js': {}
        });
    });

    it('handles \\r\\n line endings', () => {
        expect(parseEditorContent('file.js\r\nfile2.js')).toEqual({
            'file.js': {},
            'file2.js': {}
        });
    });

    it('deeply nested', () => {
        const input = 'a/\n    b/\n        c/\n            d.txt';
        expect(parseEditorContent(input)).toEqual({
            'a/': { 'b/': { 'c/': { 'd.txt': {} } } }
        });
    });
});

describe('getFilePathsFromTree', () => {
    it('single file', () => {
        expect(getFilePathsFromTree({ 'file.js': {} })).toEqual(['file.js']);
    });

    it('folder with files', () => {
        const tree = { 'src/': { 'index.js': {}, 'utils.js': {} } };
        expect(getFilePathsFromTree(tree)).toEqual(['src/index.js', 'src/utils.js']);
    });

    it('nested folders', () => {
        const tree = { 'src/': { 'main/': { 'app.js': {} } } };
        expect(getFilePathsFromTree(tree)).toEqual(['src/main/app.js']);
    });

    it('empty tree', () => {
        expect(getFilePathsFromTree({})).toEqual([]);
    });

    it('folder with empty object (no children) is treated as file', () => {
        expect(getFilePathsFromTree({ 'empty_folder': {} })).toEqual(['empty_folder']);
    });
});

describe('pathLooksUnsafe', () => {
    it('drive letter path', () => {
        expect(pathLooksUnsafe('C:\\Users\\foo', ['C:\\Users\\foo'])).toBe(true);
    });

    it('absolute unix path', () => {
        expect(pathLooksUnsafe('/etc/passwd', ['/etc/passwd'])).toBe(true);
    });

    it('UNC path', () => {
        expect(pathLooksUnsafe('\\\\server\\share', ['\\\\server\\share'])).toBe(true);
    });

    it('parent directory reference in parts', () => {
        expect(pathLooksUnsafe('file', ['src', '..', 'secret'])).toBe(true);
    });

    it('normal name is safe', () => {
        expect(pathLooksUnsafe('file.js', ['src', 'file.js'])).toBe(false);
    });

    it('single dot-dot in parts', () => {
        expect(pathLooksUnsafe('..', ['..'])).toBe(true);
    });
});
