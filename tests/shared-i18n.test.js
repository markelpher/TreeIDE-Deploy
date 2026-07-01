/**
 * @vitest-environment node
 */

import { mainT, translations } from '../src/shared/i18n.js';

describe('shared i18n', () => {
    it('defines matching error keys across locales', () => {
        const enKeys = Object.keys(translations.en).filter((key) => key.startsWith('error_')).sort();
        for (const code of ['pt', 'es']) {
            const localeKeys = Object.keys(translations[code]).filter((key) => key.startsWith('error_')).sort();
            expect(localeKeys).toEqual(enKeys);
        }
    });

    it('includes core file operation errors', () => {
        expect(translations.en.error_file_too_large).toBeTruthy();
        expect(translations.en.error_unsupported_file_type).toContain('{ext}');
    });

    it('resolves main-process dialog strings', () => {
        expect(mainT('en', 'save_tree_title')).toBe('Save Project');
        expect(mainT('pt', 'export_zip_title')).toBe('Exportar ZIP');
        expect(mainT('es', 'export_zip_title')).toBe('Exportar ZIP');
    });
});