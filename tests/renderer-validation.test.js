
import { escapeHtml, formatMessage } from '../src/shared/helpers.js';
import { getLineIndent, pathLooksUnsafe } from '../src/shared/helpers.js';
import { createValidation } from '../src/renderer/modules/validation.js';

const app = {
    helpers: { escapeHtml, formatMessage, getLineIndent, pathLooksUnsafe },
    state: { editor: { value: '', focus() {}, setSelectionRange() {}, scrollTop: 0 } },
    i18n: {
        t: (key) => {
            const dict = {
                validation_bad_indent: 'Bad indentation at line {line}',
                validation_bad_name: 'Invalid name at line {line}',
                validation_escape: 'Suspicious path at line {line}',
                validation_duplicate: 'Duplicate name at line {line}',
                validation_empty: 'No items to build',
                validation_title: 'Structure needs attention',
                validation_goto_line: 'Go to line',
                validation_unknown: 'Unknown validation issue'
            };
            return dict[key] || key;
        }
    }
};

const { validateEditorContent, goToEditorLine } = createValidation(app);

describe('validateEditorContent', () => {
    it('returns empty errors for valid content', () => {
        const result = validateEditorContent('root/\n    file.js\n    folder/\n        inner.js');
        expect(result.errors).toEqual([]);
        expect(result.hasItems).toBe(true);
    });

    it('flags empty content', () => {
        const result = validateEditorContent('');
        expect(result.hasItems).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    it('flags bad indentation', () => {
        const result = validateEditorContent('file.js\n   bad.js');
        expect(result.errors.some(e => e.message.includes('Bad indentation'))).toBe(true);
    });

    it('flags duplicate names', () => {
        const result = validateEditorContent('file.js\nfile.js');
        expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
    });
});

describe('goToEditorLine', () => {
    it('focuses editor and selects the target line', () => {
        const editor = {
            value: 'line1\nline2\nline3',
            focus: vi.fn(),
            setSelectionRange: vi.fn(),
            scrollTop: 0
        };
        app.state.editor = editor;
        goToEditorLine(2);
        expect(editor.focus).toHaveBeenCalled();
        expect(editor.setSelectionRange).toHaveBeenCalled();
    });
});