#!/usr/bin/env node
/**
 * Builds release notes for GitHub and in-app update modals.
 *
 * - English (en.md) comes from docs/changelog.md when that file has content.
 *   Otherwise it is generated from git history (generate-changelog.mjs).
 * - Every other locale in docs/changelogs/locales.json is translated from English.
 * - The app picks the matching locale at runtime (see src/shared/releaseNotes.js).
 *
 * Usage:
 *   node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir>
 *
 * Output:
 *   <output_dir>/en.md - source changelog (GitHub release + fallback)
 *   <output_dir>/<locale>.md - full translation for each non-English locale
 *   <output_dir>/changelog.md - archive with every locale combined
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit } from 'node:process';
import { combineChangelogs, stripFullChangelogLink, writeEnglishNotes } from './release-changelog-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(__dirname);
const LOCALES_PATH = path.join(root, 'docs', 'changelogs', 'locales.json');

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
        throw new Error('docs/changelogs/locales.json must define a non-empty locales array');
    }
    return parsed.locales;
}

function printHelp() {
    console.log('Usage: node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir>');
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
        throw new Error('docs/changelogs/locales.json must mark exactly one locale with "source": true');
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
        const localized = stripFullChangelogLink(await readFile(targetPath, 'utf8'));
        await writeFile(targetPath, localized, 'utf8');
        notesByLocale.set(locale.code, localized);
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