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
 *   node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir> [--sync-docs] [--strict-translations]
 *
 * Output:
 *   <output_dir>/en.md - source changelog (GitHub release + fallback)
 *   <output_dir>/<locale>.md - full translation for each non-English locale
 *   <output_dir>/changelog.md - archive with every locale combined
 *   --sync-docs also writes docs/changelogs/<locale>.md for non-English locales
 *   By default, translation API failures fall back to English source notes so releases can continue.
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
const DOCS_CHANGELOGS_DIR = path.join(root, 'docs', 'changelogs');

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
    console.log('Usage: node scripts/build-release-changelogs.mjs <previous_tag|-> <current_tag> <output_dir> [--sync-docs] [--strict-translations]');
}

function localizedDocsHeader(localeCode) {
    if (localeCode === 'pt-br') {
        return '<!-- Gerado automaticamente pelo Release Finalize — não edite manualmente. Fonte: docs/changelog.md. Idioma: pt-BR. -->';
    }
    if (localeCode === 'es') {
        return '<!-- Generado automáticamente por Release Finalize — no editar manualmente. Fuente: docs/changelog.md -->';
    }
    return '<!-- Generated automatically by Release Finalize — do not edit manually. Source: docs/changelog.md -->';
}

async function syncLocalizedDocs(locales, notesByLocale) {
    await mkdir(DOCS_CHANGELOGS_DIR, { recursive: true });
    for (const locale of locales) {
        if (locale.source) { continue; }
        const notes = notesByLocale.get(locale.code);
        if (!notes?.trim()) { continue; }
        const targetPath = path.join(DOCS_CHANGELOGS_DIR, `${locale.code}.md`);
        const content = `${localizedDocsHeader(locale.code)}\n\n${notes.trimEnd()}\n`;
        await writeFile(targetPath, content, 'utf8');
        console.log(`[changelogs] Synced ${targetPath}`);
    }
}

async function main() {
    const [prev, current, outDir, ...flags] = argv.slice(2);
    const syncDocs = flags.includes('--sync-docs');
    const strictTranslations = flags.includes('--strict-translations');
    const unknownFlags = flags.filter((flag) => flag !== '--sync-docs' && flag !== '--strict-translations');
    if (unknownFlags.length) {
        throw new Error(`Unknown argument(s): ${unknownFlags.join(', ')}`);
    }
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

    // Translate every non-English locale in parallel: providers such as
    // Gemini have large free-tier quotas (250k TPM) that comfortably fit
    // all locales at once, and the per-provider chunking in
    // translate-changelog.mjs keeps Groq/OpenRouter fallbacks inside their
    // smaller budgets.
    const localeTasks = [];
    for (const locale of locales) {
        if (locale.source || locale.code === sourceLocale.code) { continue; }

        localeTasks.push((async () => {
            const targetPath = path.join(outDir, `${locale.code}.md`);
            const translateArgs = [
                '--input', sourcePath,
                '--output', targetPath,
                '--target', locale.code,
                '--source', locale.translateFrom || sourceLocale.code,
            ];
            if (!strictTranslations) {
                translateArgs.push('--allow-source-fallback');
            }
            await runNode('scripts/translate-changelog.mjs', translateArgs);
            const localized = stripFullChangelogLink(await readFile(targetPath, 'utf8'));
            await writeFile(targetPath, localized, 'utf8');
            notesByLocale.set(locale.code, localized);
        })());
    }
    await Promise.all(localeTasks);

    if (syncDocs) {
        await syncLocalizedDocs(locales, notesByLocale);
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
