/**
 * @vitest-environment node
 */

import { mainT, translations } from '../src/shared/i18n.js';

describe('shared i18n', () => {
    it('defines matching en and pt error keys', () => {
        const enKeys = Object.keys(translations.en).filter((key) => key.startsWith('error_')).sort();
        const ptKeys = Object.keys(translations.pt).filter((key) => key.startsWith('error_')).sort();
        expect(ptKeys).toEqual(enKeys);
    });

    it('includes core file operation errors', () => {
        expect(translations.en.error_file_too_large).toBeTruthy();
        expect(translations.en.error_unsupported_file_type).toContain('{ext}');
    });

    it('resolves main-process dialog strings', () => {
        expect(mainT('en', 'save_tree_title')).toBe('Save Project');
        expect(mainT('pt', 'export_zip_title')).toBe('Exportar ZIP');
    });
});