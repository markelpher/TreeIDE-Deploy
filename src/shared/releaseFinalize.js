/**
 * Release finalize gate — the app only offers an update after CI has injected
 * localized release notes for every supported locale.
 */

import { resolveLocalizedReleaseNotes } from './releaseNotes.js';

const DEFAULT_REQUIRED_LOCALES = ['en', 'pt'];

/**
 * Normalizes electron-updater releaseNotes into { locale, notes } entries.
 * @param {unknown} value
 * @returns {Array<{ locale: string, notes: string }>}
 */
export function normalizeReleaseNotesEntries(value) {
    if (!value) { return []; }

    if (typeof value === 'string') {
        const notes = value.trim();
        return notes ? [{ locale: 'en', notes }] : [];
    }

    if (Array.isArray(value)) {
        return value
            .map((entry) => {
                if (typeof entry === 'string') {
                    const notes = entry.trim();
                    return notes ? { locale: 'en', notes } : null;
                }
                if (entry && typeof entry === 'object') {
                    const notes = String(entry.notes ?? entry.note ?? '').trim();
                    if (!notes) { return null; }
                    return { locale: String(entry.locale || 'en'), notes };
                }
                return null;
            })
            .filter(Boolean);
    }

    if (typeof value === 'object') {
        return Object.entries(value)
            .map(([locale, entry]) => {
                const notes = typeof entry === 'string'
                    ? entry.trim()
                    : String(entry?.notes ?? entry?.note ?? '').trim();
                if (!notes) { return null; }
                return { locale: String(locale), notes };
            })
            .filter(Boolean);
    }

    return [];
}

/**
 * @param {unknown} releaseNotes
 * @param {string[]} [requiredLocales]
 * @returns {boolean}
 */
export function isReleaseFinalized(releaseNotes, requiredLocales = DEFAULT_REQUIRED_LOCALES) {
    const entries = normalizeReleaseNotesEntries(releaseNotes);
    if (entries.length === 0) { return false; }

    const byLocale = new Map();
    for (const entry of entries) {
        const locale = String(entry.locale || '').toLowerCase();
        if (!locale || !entry.notes?.trim()) { continue; }
        byLocale.set(locale, entry.notes.trim());
    }

    return requiredLocales.every((locale) => {
        const key = String(locale).toLowerCase();
        return byLocale.has(key) && byLocale.get(key).length > 0;
    });
}

/**
 * @param {unknown} releaseNotes
 * @param {string} [preferredLocale]
 * @returns {{ finalized: boolean, notes: string, locale: string }}
 */
export function resolveFinalizedReleaseNotes(releaseNotes, preferredLocale = 'en') {
    if (!isReleaseFinalized(releaseNotes)) {
        return { finalized: false, notes: '', locale: 'en' };
    }

    const { notes, locale } = resolveLocalizedReleaseNotes(releaseNotes, preferredLocale);
    return { finalized: true, notes, locale };
}