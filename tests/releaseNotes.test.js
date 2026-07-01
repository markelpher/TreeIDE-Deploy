import {
    resolveLocalizedReleaseNotes,
    shouldTranslateChangelogSections,
    scoreLocaleMatch,
} from '../src/shared/releaseNotes.js';

describe('scoreLocaleMatch', () => {
    it('prefers exact locale matches', () => {
        expect(scoreLocaleMatch('pt', 'pt')).toBe(100);
        expect(scoreLocaleMatch('pt-BR', 'pt-br')).toBe(100);
    });
});

describe('resolveLocalizedReleaseNotes', () => {
    it('returns Portuguese notes for a Portuguese user', () => {
        const result = resolveLocalizedReleaseNotes([
            { locale: 'en', notes: '### Added\n\n- feat: one' },
            { locale: 'pt', notes: '### Adicionado\n\n- feat: um' },
        ], 'pt');

        expect(result.locale).toBe('pt');
        expect(result.notes).toContain('Adicionado');
    });

    it('falls back to English when locale is missing', () => {
        const result = resolveLocalizedReleaseNotes([
            { locale: 'en', notes: '### Added\n\n- feat: one' },
        ], 'pt');

        expect(result.locale).toBe('en');
        expect(result.notes).toContain('Added');
    });
});

describe('shouldTranslateChangelogSections', () => {
    it('skips section rewrite when full translation is already selected', () => {
        expect(shouldTranslateChangelogSections('pt', 'pt')).toBe(false);
    });

    it('rewrites section headers only when showing English to a localized UI', () => {
        expect(shouldTranslateChangelogSections('pt', 'en')).toBe(true);
        expect(shouldTranslateChangelogSections('en', 'en')).toBe(false);
    });
});