import {
    buildCompareUrl,
    buildLocaleChangelogNav,
    combineChangelogs,
    ensureFullChangelogLink,
    ensureGithubReleaseNotes,
    stripFullChangelogLink,
    formatReleaseTitle,
    readManualChangelog,
    writeEnglishNotes,
} from '../scripts/release-changelog-lib.mjs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('formatReleaseTitle', () => {
    it('formats tag with v prefix', () => {
        expect(formatReleaseTitle('v2.0.54')).toBe('Tree IDE v2.0.54');
    });
});

describe('combineChangelogs', () => {
    it('merges locale sections into one markdown document', () => {
        const locales = [
            { code: 'en', label: 'English' },
            { code: 'pt', label: 'Portuguese (Brazil)' },
            { code: 'es', label: 'Español' },
        ];
        const notes = new Map([
            ['en', '## What\'s new in v2.0.54\n\n### Added\n\n- feat: item (abc1234)'],
            ['pt', '## Novidades em v2.0.54\n\n### Adicionado\n\n- feat: item (abc1234)'],
            ['es', '## Novedades en v2.0.54\n\n### Agregado\n\n- feat: item (abc1234)'],
        ]);

        const combined = combineChangelogs('v2.0.54', locales, notes);

        expect(combined).toContain('# Tree IDE v2.0.54');
        expect(combined).toContain('## English');
        expect(combined).toContain('## Portuguese (Brazil)');
        expect(combined).toContain('---');
        expect(combined).toContain('### Added');
        expect(combined).toContain('### Adicionado');
        expect(combined).toContain('## Español');
        expect(combined).toContain('### Agregado');
    });
});

describe('buildCompareUrl', () => {
    it('builds a compare URL between two tags', () => {
        expect(buildCompareUrl('v2.0.54', 'v2.0.55', 'owner/repo'))
            .toBe('https://github.com/owner/repo/compare/v2.0.54...v2.0.55');
    });

    it('builds a single-tag compare URL when there is no previous tag', () => {
        expect(buildCompareUrl('-', 'v2.0.55', 'owner/repo'))
            .toBe('https://github.com/owner/repo/compare/v2.0.55');
    });
});

describe('stripFullChangelogLink', () => {
    it('removes the GitHub compare footer', () => {
        const input = '## Notes\n\n- item\n\n**Full Changelog**: https://github.com/o/r/compare/v1...v2\n';
        expect(stripFullChangelogLink(input)).toBe('## Notes\n\n- item\n');
    });

    it('removes locale changelog navigation links', () => {
        const input = '[Português](changelogs/pt.md) · [Español](changelogs/es.md)\n\n## What\'s new\n\n- item\n';
        expect(stripFullChangelogLink(input)).toBe('## What\'s new\n\n- item\n');
    });
});

describe('buildLocaleChangelogNav', () => {
    it('builds release download links for localized changelog assets', () => {
        const nav = buildLocaleChangelogNav('v2.0.55', 'owner/repo');

        expect(nav).toBe(
            '[Português](https://github.com/owner/repo/releases/download/v2.0.55/pt.md) · '
            + '[Español](https://github.com/owner/repo/releases/download/v2.0.55/es.md)\n\n',
        );
    });
});

describe('ensureGithubReleaseNotes', () => {
    it('prepends locale nav and appends the compare link', () => {
        const result = ensureGithubReleaseNotes('## Added\n\n- item', {
            compareUrl: 'https://github.com/owner/repo/compare/v2.0.54...v2.0.55',
            tag: 'v2.0.55',
            repo: 'owner/repo',
        });

        expect(result).toContain('[Português](https://github.com/owner/repo/releases/download/v2.0.55/pt.md)');
        expect(result).toContain('## Added');
        expect(result).toContain('**Full Changelog**: https://github.com/owner/repo/compare/v2.0.54...v2.0.55');
    });
});

describe('ensureFullChangelogLink', () => {
    it('appends the compare link when it is missing', () => {
        const result = ensureFullChangelogLink('## Notes\n\n- item', 'https://example.com/compare');

        expect(result).toContain('**Full Changelog**: https://example.com/compare');
    });

    it('keeps an existing Full Changelog link', () => {
        const input = '## Notes\n\n**Full Changelog**: https://example.com/existing\n';
        expect(ensureFullChangelogLink(input, 'https://example.com/new')).toBe(input);
    });
});

describe('readManualChangelog', () => {
    let tempDir;

    beforeEach(async () => {
        tempDir = await mkdtemp(path.join(tmpdir(), 'treeide-changelog-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('returns null when the file is missing', async () => {
        await expect(readManualChangelog(path.join(tempDir, 'missing.md'))).resolves.toBeNull();
    });

    it('returns null when the file is empty or whitespace', async () => {
        const filePath = path.join(tempDir, 'empty.md');
        await writeFile(filePath, '   \n', 'utf8');
        await expect(readManualChangelog(filePath)).resolves.toBeNull();
    });

    it('returns trimmed content when the file has notes', async () => {
        const filePath = path.join(tempDir, 'notes.md');
        await writeFile(filePath, '  ## Added\n\n- item  ', 'utf8');
        await expect(readManualChangelog(filePath)).resolves.toBe('  ## Added\n\n- item  ');
    });
});

describe('writeEnglishNotes', () => {
    let tempDir;

    beforeEach(async () => {
        tempDir = await mkdtemp(path.join(tmpdir(), 'treeide-changelog-'));
    });

    afterEach(async () => {
        await rm(tempDir, { recursive: true, force: true });
    });

    it('writes manual changelog content to en.md', async () => {
        const manualPath = path.join(tempDir, 'changelog.md');
        const outPath = path.join(tempDir, 'en.md');
        await writeFile(
            manualPath,
            '[Português](changelogs/pt.md) · [Español](changelogs/es.md)\n\n## Added\n\n- manual note',
            'utf8',
        );

        const source = await writeEnglishNotes({
            prev: 'v2.0.54',
            current: 'v2.0.55',
            outPath,
            manualPath,
        });

        const written = await readFile(outPath, 'utf8');
        expect(source).toBe('manual');
        expect(written).toContain('## Added');
        expect(written).toContain('- manual note');
        expect(written).not.toContain('**Full Changelog**');
        expect(written).not.toContain('changelogs/pt.md');

        const githubRelease = await readFile(path.join(tempDir, 'github-release.md'), 'utf8');
        expect(githubRelease).toContain(
            '[Português](https://github.com/markelpher/TreeIDE-Deploy/releases/download/v2.0.55/pt.md)',
        );
        expect(githubRelease).toContain('**Full Changelog**: https://github.com/markelpher/TreeIDE-Deploy/compare/v2.0.54...v2.0.55');
        expect(githubRelease).not.toContain('changelogs/pt.md');
    });
});