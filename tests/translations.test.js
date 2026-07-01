
import { translations } from '../src/shared/i18n.js';

const localeCodes = Object.keys(translations);

describe('translations', () => {
    it('defines en, pt, and es locales', () => {
        expect(translations.en).toBeDefined();
        expect(translations.pt).toBeDefined();
        expect(translations.es).toBeDefined();
    });

    it('every en key exists in all other locales', () => {
        const enKeys = Object.keys(translations.en);
        for (const code of localeCodes) {
            if (code === 'en') { continue; }
            const localeKeys = new Set(Object.keys(translations[code]));
            const missing = enKeys.filter((k) => !localeKeys.has(k));
            expect(missing, `missing in ${code}`).toEqual([]);
        }
    });

    it('every non-en key exists in en', () => {
        const enKeys = new Set(Object.keys(translations.en));
        for (const code of localeCodes) {
            if (code === 'en') { continue; }
            const missing = Object.keys(translations[code]).filter((k) => !enKeys.has(k));
            expect(missing, `extra in ${code}`).toEqual([]);
        }
    });

    it('no translation values are empty', () => {
        for (const [, dict] of Object.entries(translations)) {
            for (const [, value] of Object.entries(dict)) {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            }
        }
    });

    it('includes shared error keys from src/shared/locales/{en,pt,es}.json', () => {
        expect(String(translations.en.error_file_too_large)).toMatch(/500MB/);
        expect(String(translations.pt.error_unsupported_file_type)).toMatch(/\{ext\}/);
        expect(String(translations.es.error_unsupported_file_type)).toMatch(/\{ext\}/);
    });

    it('placeholder names are consistent across languages', () => {
        const placeholderRegex = /\{(\w+)\}/g;
        for (const key of Object.keys(translations.en)) {
            const enPlaceholders = new Set();
            let m;

            placeholderRegex.lastIndex = 0;
            while ((m = placeholderRegex.exec(translations.en[key])) !== null) {
                enPlaceholders.add(m[1]);
            }

            for (const code of localeCodes) {
                if (code === 'en') { continue; }
                const localePlaceholders = new Set();
                placeholderRegex.lastIndex = 0;
                while ((m = placeholderRegex.exec(translations[code][key])) !== null) {
                    localePlaceholders.add(m[1]);
                }
                expect([...localePlaceholders].sort(), `${code}:${key}`).toEqual([...enPlaceholders].sort());
            }
        }
    });
});