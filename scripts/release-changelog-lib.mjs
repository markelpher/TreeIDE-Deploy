import { readFile, writeFile, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);

export const MANUAL_CHANGELOG_PATH = path.join(root, 'docs', 'changelog.md');

/** @param {string} tag */
export function formatReleaseTitle(tag) {
    const version = String(tag).replace(/^v/, '');
    return `Tree IDE v${version}`;
}

/**
 * @param {string} tag
 * @param {Array<{ code: string, label: string }>} locales
 * @param {Map<string, string>} notesByLocale
 * @returns {string}
 */
export function combineChangelogs(tag, locales, notesByLocale) {
    const lines = [`# ${formatReleaseTitle(tag)}`, ''];

    for (let index = 0; index < locales.length; index++) {
        const locale = locales[index];
        const notes = notesByLocale.get(locale.code);
        if (!notes?.trim()) { continue; }

        lines.push(`## ${locale.label}`, '');
        lines.push(notes.trimEnd(), '');

        if (index < locales.length - 1) {
            lines.push('---', '');
        }
    }

    return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * @param {string} prev
 * @param {string} current
 * @param {string} [repo]
 * @returns {string}
 */
export function buildCompareUrl(prev, current, repo = env.GITHUB_REPOSITORY || 'markelpher/TreeIDE-Deploy') {
    if (prev && prev !== '-') {
        return `https://github.com/${repo}/compare/${prev}...${current}`;
    }
    return `https://github.com/${repo}/compare/${current}`;
}

/** Non-English release assets attached to each GitHub release. */
export const GITHUB_RELEASE_LOCALE_NAV = [
    { label: 'Português', asset: 'changelog-pt.md' },
    { label: 'Español', asset: 'changelog-es.md' },
];

/**
 * @param {string} tag
 * @param {string} [repo]
 * @param {Array<{ label: string, asset: string }>} [locales]
 * @returns {string}
 */
export function buildLocaleChangelogNav(
    tag,
    repo = env.GITHUB_REPOSITORY || 'markelpher/TreeIDE-Deploy',
    locales = GITHUB_RELEASE_LOCALE_NAV,
) {
    const parts = locales.map(({ label, asset }) => (
        `[${label}](https://github.com/${repo}/releases/download/${tag}/${asset})`
    ));
    return `${parts.join(' · ')}\n\n`;
}

/**
 * @param {string} content
 * @param {string} compareUrl
 * @returns {string}
 */
export function ensureFullChangelogLink(content, compareUrl) {
    if (/\*\*Full Changelog\*\*/i.test(content)) {
        return content.endsWith('\n') ? content : `${content}\n`;
    }
    return `${content.trimEnd()}\n\n**Full Changelog**: ${compareUrl}\n`;
}

/**
 * @param {string} content - App notes (no locale nav, no compare link).
 * @param {{ compareUrl: string, tag: string, repo?: string }} options
 * @returns {string}
 */
export function ensureGithubReleaseNotes(content, { compareUrl, tag, repo }) {
    const withNav = `${buildLocaleChangelogNav(tag, repo)}${String(content).trimStart()}`;
    return ensureFullChangelogLink(withNav, compareUrl);
}

/** Locale changelog nav line at the top of docs/changelog.md (repo-only, not for the app). */
export const LOCALE_CHANGELOG_NAV_RE = /^\[[^\]]+\]\(changelogs\/[^)]+\)(?:\s*[·•|]\s*\[[^\]]+\]\(changelogs\/[^)]+\))*\s*\n+/m;

/** Removes repo-only navigation and the GitHub compare footer — used for in-app update notes only. */
export function stripFullChangelogLink(content) {
    if (!content) { return content; }
    const stripped = String(content)
        .replace(/\r\n/g, '\n')
        .replace(LOCALE_CHANGELOG_NAV_RE, '')
        .replace(/\n*\*\*Full Changelog\*\*:\s*\S+\s*/gi, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trimEnd();
    return stripped ? `${stripped}\n` : '';
}

/**
 * @param {string} outPath - Locale file for the app (no compare link).
 * @param {string} compareUrl
 * @param {string} tag - Release tag (e.g. v2.0.77).
 * @returns {string} Path to GitHub release body markdown.
 */
export async function writeGithubReleaseNotes(outPath, compareUrl, tag) {
    const outDir = path.dirname(outPath);
    const githubReleasePath = path.join(outDir, 'github-release.md');
    const appNotes = await readFile(outPath, 'utf8');
    await writeFile(
        githubReleasePath,
        ensureGithubReleaseNotes(appNotes, { compareUrl, tag }),
        'utf8',
    );
    return githubReleasePath;
}

/**
 * @param {string} filePath
 * @returns {Promise<string|null>}
 */
export async function readManualChangelog(filePath = MANUAL_CHANGELOG_PATH) {
    try {
        await access(filePath, FS.F_OK);
    } catch {
        return null;
    }

    const content = await readFile(filePath, 'utf8');
    return content.trim() ? content : null;
}

function runNode(scriptRelative, args) {
    const scriptPath = path.join(root, scriptRelative);
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [scriptPath, ...args], {
            cwd: root,
            stdio: 'inherit',
        });
        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) { resolve(); }
            else { reject(new Error(`${scriptRelative} exited with code ${code}`)); }
        });
    });
}

/**
 * @param {{ prev: string, current: string, outPath: string, manualPath?: string }} options
 * @returns {Promise<'manual' | 'git'>}
 */
export async function writeEnglishNotes({ prev, current, outPath, manualPath = MANUAL_CHANGELOG_PATH }) {
    const compareUrl = buildCompareUrl(prev, current);

    const manual = await readManualChangelog(manualPath);
    if (manual) {
        const appNotes = stripFullChangelogLink(manual);
        await writeFile(outPath, appNotes, 'utf8');
        await writeGithubReleaseNotes(outPath, compareUrl, current);
        console.log(`[changelogs] Using manual changelog from ${manualPath}`);
        return 'manual';
    }

    const generatedPath = path.join(path.dirname(outPath), '.en.generated.md');
    await runNode('scripts/generate-changelog.mjs', [prev || '-', current, generatedPath]);
    const appNotes = stripFullChangelogLink(await readFile(generatedPath, 'utf8'));
    await writeFile(outPath, appNotes, 'utf8');
    await writeGithubReleaseNotes(outPath, compareUrl, current);
    console.log('[changelogs] docs/changelog.md empty or missing; generated English notes from git history');
    return 'git';
}