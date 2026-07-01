import {
    isReleaseFinalized,
    normalizeReleaseNotesEntries,
    resolveFinalizedReleaseNotes,
} from '../src/shared/releaseFinalize.js';

describe('normalizeReleaseNotesEntries', () => {
    it('normalizes localized arrays from electron-updater', () => {
        const entries = normalizeReleaseNotesEntries([
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt', notes: 'Notas em português' },
        ]);

        expect(entries).toEqual([
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt', notes: 'Notas em português' },
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

    it('returns true when every required locale is present', () => {
        const notes = [
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt', notes: 'Notas em português' },
        ];

        expect(isReleaseFinalized(notes)).toBe(true);
    });
});

describe('resolveFinalizedReleaseNotes', () => {
    it('returns empty notes when the release is not finalized', () => {
        expect(resolveFinalizedReleaseNotes('English only', 'pt')).toEqual({
            finalized: false,
            notes: '',
            locale: 'en',
        });
    });

    it('picks the preferred locale when the release is finalized', () => {
        const notes = [
            { locale: 'en', notes: 'English notes' },
            { locale: 'pt', notes: 'Notas em português' },
        ];

        expect(resolveFinalizedReleaseNotes(notes, 'pt')).toEqual({
            finalized: true,
            notes: 'Notas em português',
            locale: 'pt',
        });
    });
});