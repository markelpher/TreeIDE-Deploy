
import { translations } from '../src/shared/i18n.js';

describe('translations', () => {
    it('has both en and pt locales', () => {
        expect(translations.en).toBeDefined();
        expect(translations.pt).toBeDefined();
    });

    it('every en key has a corresponding pt key', () => {
        const enKeys = Object.keys(translations.en);
        const ptKeys = new Set(Object.keys(translations.pt));
        const missing = enKeys.filter(k => !ptKeys.has(k));
        expect(missing).toEqual([]);
    });

    it('every pt key has a corresponding en key', () => {
        const ptKeys = Object.keys(translations.pt);
        const enKeys = new Set(Object.keys(translations.en));
        const missing = ptKeys.filter(k => !enKeys.has(k));
        expect(missing).toEqual([]);
    });

    it('no translation values are empty', () => {
        for (const [, dict] of Object.entries(translations)) {
            for (const [, value] of Object.entries(dict)) {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            }
        }
    });

    it('includes shared error keys from src/shared/locales/{en,pt}.json', () => {
        expect(String(translations.en.error_file_too_large)).toMatch(/500MB/);
        expect(String(translations.pt.error_unsupported_file_type)).toMatch(/\{ext\}/);
    });

    it('placeholder names are consistent across languages', () => {
        const placeholderRegex = /\{(\w+)\}/g;
        for (const key of Object.keys(translations.en)) {
            const enPlaceholders = new Set();
            const ptPlaceholders = new Set();
            let m;

            placeholderRegex.lastIndex = 0;
            while ((m = placeholderRegex.exec(translations.en[key])) !== null) {
                enPlaceholders.add(m[1]);
            }
            placeholderRegex.lastIndex = 0;
            while ((m = placeholderRegex.exec(translations.pt[key])) !== null) {
                ptPlaceholders.add(m[1]);
            }

            expect([...enPlaceholders].sort()).toEqual([...ptPlaceholders].sort());
        }
    });
});