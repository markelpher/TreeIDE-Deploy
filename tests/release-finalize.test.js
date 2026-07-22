import {
    isReleaseFinalized,
    normalizeReleaseNotesEntries,
} from '../src/shared/releaseFinalize.js';

describe('normalizeReleaseNotesEntries', () => {
    it('normalizes localized arrays from electron-updater', () => {
        const entries = normalizeReleaseNotesEntries([
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt-br', notes: 'Notas em português brasileiro' },
        ]);

        expect(entries).toEqual([
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt-br', notes: 'Notas em português brasileiro' },
        ]);
    });
});

describe('isReleaseFinalized', () => {
    it('returns false when release notes are missing', () => {
        expect(isReleaseFinalized(null)).toBe(false);
        expect(isReleaseFinalized('')).toBe(false);
        expect(isReleaseFinalized([])).toBe(false);
    });

    it('returns false when only English notes are present', () => {
        expect(isReleaseFinalized('English only')).toBe(false);
        expect(isReleaseFinalized([{ locale: 'en', notes: 'English only' }])).toBe(false);
    });

    it('returns false when Spanish notes are missing', () => {
        const notes = [
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt-br', notes: 'Notas em português brasileiro' },
        ];

        expect(isReleaseFinalized(notes)).toBe(false);
    });

    it('returns true when every required locale is present', () => {
        const notes = [
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt-br', notes: 'Notas em português brasileiro' },
            { locale: 'es', notes: 'Notas en español' },
        ];

        expect(isReleaseFinalized(notes)).toBe(true);
    });
});
