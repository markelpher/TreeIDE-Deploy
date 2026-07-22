import { createI18n } from '../src/shared/i18n.js';
import { createFileTypes } from '../src/renderer/modules/file-types.js';

const i18n = createI18n('en');
const { FILE_TYPES, FILENAME_MAP, validExtensions, isValidExtension, getFileTypeLabel, getFilePresenceKind } = createFileTypes({ i18n });

describe('FILE_TYPES', () => {
    it('has entries for common extensions', () => {
        expect(FILE_TYPES.js).toBeDefined();
        expect(FILE_TYPES.py).toBeDefined();
        expect(FILE_TYPES.html).toBeDefined();
        expect(FILE_TYPES.css).toBeDefined();
        expect(FILE_TYPES.json).toBeDefined();
        expect(FILE_TYPES.ts).toBeDefined();
    });

    it('all entries have a non-null label', () => {
        for (const [, entry] of Object.entries(FILE_TYPES)) {
            expect(typeof entry.label).toBe('string');
        }
    });
});

describe('FILENAME_MAP', () => {
    it('maps dockerfile', () => {
        expect(FILENAME_MAP.dockerfile).toBe('filetype_dockerfile');
    });

    it('maps package.json', () => {
        expect(FILENAME_MAP['package.json']).toBe('npm');
    });
});

describe('isValidExtension', () => {
    it('accepts known extensions', () => {
        expect(isValidExtension('js')).toBe(true);
        expect(isValidExtension('TS')).toBe(true);
    });

    it('rejects unknown extensions', () => {
        expect(isValidExtension('xyz')).toBe(false);
    });
});

describe('validExtensions', () => {
    it('is a Set containing js', () => {
        expect(validExtensions.has('js')).toBe(true);
    });
});

describe('getFileTypeLabel', () => {
    it('returns label for extension', () => {
        expect(getFileTypeLabel('src/index.js')).toBe('JavaScript');
    });

    it('returns filename-based label for Dockerfile', () => {
        expect(getFileTypeLabel('Dockerfile')).toMatch(/docker/i);
    });

    it('returns uppercase extension for unknown types', () => {
        expect(getFileTypeLabel('file.xyz')).toBe('XYZ');
    });
});

describe('getFilePresenceKind', () => {
    it('distinguishes code from text documents', () => {
        expect(getFilePresenceKind('src/index.js')).toBe('code');
        expect(getFilePresenceKind('config/settings.json')).toBe('code');
        expect(getFilePresenceKind('README.md')).toBe('text');
        expect(getFilePresenceKind('LICENSE')).toBe('text');
        expect(getFilePresenceKind('notes.txt')).toBe('text');
    });
});
