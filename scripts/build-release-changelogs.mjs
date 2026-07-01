#!/usr/bin/env node
/**
 * Builds release notes for GitHub and in-app update modals.
 *
 * - English (en.md) comes from the root changelog.md when that file has content.
 *   Otherwise it is generated from git history (generate-changelog.mjs).
 * - Every other locale in changelogs/locales.json is translated from English.
 * - The app picks the matching locale at runtime (see src/shared/releaseNotes.js).
 *
 * Usage:
 *   node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir>
 *
 * Output:
 *   <output_dir>/en.md — source changelog (GitHub release + fallback)
 *   <output_dir>/<locale>.md — full translation for each non-English locale
 *   <output_dir>/changelog.md — archive with every locale combined
 */

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, env, exit } from 'node:process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);
const LOCALES_PATH = path.join(root, 'changelogs', 'locales.json');
export const MANUAL_CHANGELOG_PATH = path.join(root, 'changelog.md');

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

/**
 * @param {{ prev: string, current: string, outPath: string, manualPath?: string }} options
 * @returns {Promise<'manual' | 'git'>}
 */
export async function writeEnglishNotes({ prev, current, outPath, manualPath = MANUAL_CHANGELOG_PATH }) {
    const manual = await readManualChangelog(manualPath);
    if (manual) {
        const notes = ensureFullChangelogLink(manual, buildCompareUrl(prev, current));
        await writeFile(outPath, notes, 'utf8');
        console.log(`[changelogs] Using manual changelog from ${manualPath}`);
        return 'manual';
    }

    await runNode('scripts/generate-changelog.mjs', [prev || '-', current, outPath]);
    console.log('[changelogs] changelog.md empty or missing; generated English notes from git history');
    return 'git';
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

async function loadLocales() {
    const raw = await readFile(LOCALES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.locales) || parsed.locales.length === 0) {
        throw new Error('changelogs/locales.json must define a non-empty locales array');
    }
    return parsed.locales;
}

function printHelp() {
    console.log(`Usage: node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir>`);
}

async function main() {
    const [prev, current, outDir] = argv.slice(2);
    if (!current || !outDir) {
        printHelp();
        exit(2);
    }

    const locales = await loadLocales();
    const sourceLocale = locales.find((locale) => locale.source);
    if (!sourceLocale) {
        throw new Error('changelogs/locales.json must mark exactly one locale with "source": true');
    }

    await mkdir(outDir, { recursive: true });

    const notesByLocale = new Map();
    const sourcePath = path.join(outDir, `${sourceLocale.code}.md`);

    await writeEnglishNotes({ prev: prev || '-', current, outPath: sourcePath });
    notesByLocale.set(sourceLocale.code, await readFile(sourcePath, 'utf8'));

    for (const locale of locales) {
        if (locale.source || locale.code === sourceLocale.code) { continue; }

        const targetPath = path.join(outDir, `${locale.code}.md`);
        await runNode('scripts/translate-changelog.mjs', [
            '--input', sourcePath,
            '--output', targetPath,
            '--target', locale.code,
            '--source', locale.translateFrom || sourceLocale.code,
        ]);
        notesByLocale.set(locale.code, await readFile(targetPath, 'utf8'));
    }

    const combinedPath = path.join(outDir, 'changelog.md');
    const combined = combineChangelogs(current, locales, notesByLocale);
    await writeFile(combinedPath, combined, 'utf8');

    console.log(`[changelogs] Wrote ${notesByLocale.size} locale file(s) and ${combinedPath}`);
}

const isCli = process.argv[1]
    && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isCli) {
    main().catch((err) => {
        console.error(`[changelogs] Fatal: ${err.message}`);
        exit(1);
    });
}