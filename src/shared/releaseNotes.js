/**
 * Picks release notes for the user's locale from electron-updater payloads.
 * English is the canonical source; other locales are full translations from en.
 */

/** @param {string} entryLocale @param {string} preferredLocale */
export function scoreLocaleMatch(entryLocale, preferredLocale) {
    if (!entryLocale || !preferredLocale) { return 0; }
    const entry = String(entryLocale).toLowerCase();
    const preferred = String(preferredLocale).toLowerCase();
    if (entry === preferred) { return 100; }
    if (entry === preferred.split('-')[0] || preferred === entry.split('-')[0]) { return 50; }
    if (entry.split('-')[0] === preferred.split('-')[0]) { return 25; }
    return 0;
}

/**
 * @param {unknown} value
 * @param {string} [preferredLocale]
 * @returns {{ notes: string, locale: string, score: number }}
 */
export function resolveLocalizedReleaseNotes(value, preferredLocale = 'en') {
    if (!value) {
        return { notes: '', locale: 'en', score: 0 };
    }

    if (typeof value === 'string') {
        const notes = value.trim();
        return { notes, locale: 'en', score: notes ? 100 : 0 };
    }

    const preferred = String(preferredLocale || 'en').toLowerCase();
    let entries = [];

    if (Array.isArray(value)) {
        entries = value
            .map((entry) => {
                if (typeof entry === 'string') { return { locale: 'en', notes: entry }; }
                if (entry && typeof entry === 'object') {
                    return {
                        locale: entry.locale || 'en',
                        notes: entry.notes ?? entry.note ?? '',
                    };
                }
                return null;
            })
            .filter((entry) => entry && entry.notes);
    } else if (typeof value === 'object') {
        entries = Object.entries(value)
            .map(([locale, entry]) => ({
                locale,
                notes: typeof entry === 'string' ? entry : (entry?.notes ?? entry?.note ?? ''),
            }))
            .filter((entry) => entry.notes);
    } else {
        return { notes: '', locale: 'en', score: 0 };
    }

    if (entries.length === 0) {
        return { notes: '', locale: 'en', score: 0 };
    }

    if (entries.length === 1) {
        const [entry] = entries;
        return {
            notes: String(entry.notes).trim(),
            locale: entry.locale || 'en',
            score: 100,
        };
    }

    const scored = entries
        .map((entry) => ({ entry, score: scoreLocaleMatch(entry.locale, preferred) }))
        .sort((a, b) => b.score - a.score);

    const best = scored[0];
    return {
        notes: String(best.entry.notes).trim(),
        locale: best.entry.locale || 'en',
        score: best.score,
    };
}

/**
 * When true, only English notes were found for a non-English UI — section
 * headers may still be in English and need a light client-side pass.
 * @param {string} userLocale
 * @param {string} notesLocale
 */
export function shouldTranslateChangelogSections(userLocale, notesLocale) {
    const user = String(userLocale || 'en').toLowerCase();
    const notes = String(notesLocale || 'en').toLowerCase();
    if (user === 'en' || user.split('-')[0] === 'en') { return false; }
    return notes === 'en' || notes.split('-')[0] === 'en';
}