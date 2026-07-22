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
            { locale: 'pt-br', notes: '### Novidades\n\n- recurso: um' },
        ], 'pt');

        expect(result.locale).toBe('pt-br');
        expect(result.notes).toContain('Novidades');
    });

    it('returns Spanish notes for a Spanish user', () => {
        const result = resolveLocalizedReleaseNotes([
            { locale: 'en', notes: '### Added\n\n- feat: one' },
            { locale: 'es', notes: '### Agregado\n\n- feat: uno' },
        ], 'es');

        expect(result.locale).toBe('es');
        expect(result.notes).toContain('Agregado');
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
        expect(shouldTranslateChangelogSections('pt', 'pt-br')).toBe(false);
        expect(shouldTranslateChangelogSections('es', 'es')).toBe(false);
    });

    it('rewrites section headers only when showing English to a localized UI', () => {
        expect(shouldTranslateChangelogSections('pt', 'en')).toBe(true);
        expect(shouldTranslateChangelogSections('en', 'en')).toBe(false);
    });
});
