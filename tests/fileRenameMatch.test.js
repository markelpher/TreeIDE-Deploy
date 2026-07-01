import { findRenameMatch } from '../src/shared/helpers.js';

describe('findRenameMatch', () => {
    it('matches extension-only rename in the same directory', () => {
        const used = new Set();
        const match = findRenameMatch('src/foo.js', ['src/foo.ts'], used);
        expect(match).toBe('src/foo.ts');
    });

    it('matches name-only rename with the same extension', () => {
        const used = new Set();
        const match = findRenameMatch('src/foo.js', ['src/bar.js'], used);
        expect(match).toBe('src/bar.js');
    });

    it('matches full rename in the same directory', () => {
        const used = new Set();
        const match = findRenameMatch('src/foo.js', ['src/bar.ts'], used);
        expect(match).toBe('src/bar.ts');
    });

    it('matches the same filename when only the parent folder changes', () => {
        const used = new Set();
        const match = findRenameMatch('src/foo.js', ['lib/foo.js'], used);
        expect(match).toBe('lib/foo.js');
    });

    it('pairs multiple renames without cross-matching', () => {
        const added = ['src/bar.js', 'src/qux.js'];
        const used = new Set();

        const first = findRenameMatch('src/foo.js', added, used);
        expect(first).toBe('src/bar.js');
        used.add(first);

        const second = findRenameMatch('src/baz.js', added, used);
        expect(second).toBe('src/qux.js');
    });
});