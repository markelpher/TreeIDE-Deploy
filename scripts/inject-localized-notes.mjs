#!/usr/bin/env node
/**
 * TreeIDE - Localized release-notes injector
 *
 * Electron-updater reads `latest.yml` (or `latest-linux.yml`, etc.)
 * to discover available updates. The `releaseNotes` field can be:
 *
 *   - a plain string               → single-locale
 *   - LocalizedReleaseNotes[]      → array of { locale, notes }
 *   - { [locale]: notes }          → per-locale object
 *
 * This script reads one or more `latest*.yml` files, replaces the
 * `releaseNotes` field with a LocalizedReleaseNotes[] array sourced
 * from `--source` arguments, and writes the result back in place.
 *
 * Usage:
 *   node scripts/inject-localized-notes.mjs \
 *     --latest dist/latest.yml \
 *     --note en=path/to/en.md \
 *     --note pt=path/to/pt.md
 *
 * Or via JSON input from another script:
 *   echo '{"en": "...", "pt": "..."}' > /tmp/notes.json
 *   node scripts/inject-localized-notes.mjs \
 *     --latest dist/latest.yml \
 *     --notes-json /tmp/notes.json
 *
 * If a `latest.yml` already contains a `releaseNotes` string, the
 * script preserves it under the "en" locale unless a `--note en=…`
 * is also provided (in which case the explicit one wins). This
 * protects releases that were tagged before this pipeline existed.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises';
import { argv, exit } from 'node:process';
import { resolve, basename } from 'node:path';

function parseArgs(args) {
    const out = { latest: [], notes: new Map(), notesJson: null };
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--latest' || a === '-l') {
            const value = args[++i];
            if (!value) { console.error('Missing value for --latest'); exit(2); }
            out.latest.push(value);
        } else if (a === '--note') {
            const value = args[++i];
            if (!value || !value.includes('=')) { console.error('Missing value for --note (expected locale=path)'); exit(2); }
            const eq = value.indexOf('=');
            const locale = value.slice(0, eq).trim();
            const path = value.slice(eq + 1).trim();
            out.notes.set(locale, path);
        } else if (a === '--notes-json') {
            out.notesJson = args[++i];
        } else if (a === '--help' || a === '-h') {
            printHelp();
            exit(0);
        } else {
            console.error(`Unknown argument: ${a}`);
            printHelp();
            exit(2);
        }
    }
    return out;
}

function printHelp() {
    console.log(`Usage: node inject-localized-notes.mjs --latest <file> [--latest <file>…] --note <locale>=<path> [--note …]

Options:
  -l, --latest <path>     Path to a latest*.yml file. Repeatable.
      --note <l>=<path>   Add a localized note. Locale is the language tag
                          the user agent matches against. Path is a UTF-8
                          markdown file whose contents become the notes.
      --notes-json <path> JSON file with {"locale": "markdown", …} entries
                          merged into the --note set.
  -h, --help              Show this help.`);
}

async function loadNotes(opts) {
    const notes = new Map(opts.notes);
    if (opts.notesJson) {
        let raw;
        try {
            raw = await readFile(opts.notesJson, 'utf8');
        } catch (err) {
            console.error(`Cannot read --notes-json file: ${opts.notesJson}`);
            exit(2);
        }
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error(`--notes-json is not valid JSON: ${err.message}`);
            exit(2);
        }
        for (const [locale, markdown] of Object.entries(parsed)) {
            if (!notes.has(locale)) {notes.set(locale, { inline: markdown });}
        }
    }
    const resolved = new Map();
    for (const [locale, source] of notes) {
        if (typeof source === 'object' && source.inline !== undefined) {
            resolved.set(locale, source.inline);
        } else {
            try {
                const content = await readFile(source, 'utf8');
                resolved.set(locale, content);
            } catch (err) {
                console.error(`Cannot read --note file for locale "${locale}": ${source}`);
                exit(2);
            }
        }
    }
    return resolved;
}

/**
 * Find the `releaseNotes: …` block in a latest.yml file and replace
 * it with a YAML block-literal (`|`) holding the LocalizedReleaseNotes
 * array. We avoid pulling in a full YAML library because the structure
 * we touch is small and well-known.
 */
function injectLocalizedNotes(yaml, localized) {
    const lines = yaml.split('\n');
    const headerPattern = /^releaseNotes\s*:\s*(.*)$/;
    const headerIndex = lines.findIndex((l) => headerPattern.test(l));

    if (headerIndex === -1) {
        // No releaseNotes field — append one at the end
        return yaml.replace(/\s*$/, '') + '\n' + serializeLocalized(localized) + '\n';
    }

    const headerMatch = lines[headerIndex].match(headerPattern);
    const headerValue = headerMatch[1].trim();
    const headerIndent = (lines[headerIndex].match(/^(\s*)/) || ['', ''])[1];

    // Find the end of the existing releaseNotes block.
    // - If the header value is empty (`releaseNotes:`) or starts with `|`, `>`, `|-`, `>-`,
    //   `releaseNotes: >-`, etc., the value is a block scalar. The block ends at the
    //   first subsequent line whose indentation is <= the header's indent (or EOF).
    // - If the header value is a non-empty inline value (string, array marker, object marker),
    //   the value is on the same line and we just replace that line.
    let blockEndIndex = headerIndex;
    if (headerValue === '' || /^[|>][+-]?\s*$/.test(headerValue) || /^[|>][+-]?$/.test(headerValue)) {
        // Block scalar — walk forward until we hit a line at indent <= header's
        const baseIndent = headerIndent.length;
        for (let i = headerIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '') {continue;}
            const lineIndent = (line.match(/^(\s*)/) || ['', ''])[1].length;
            if (lineIndent <= baseIndent) {
                blockEndIndex = i - 1;
                break;
            }
            blockEndIndex = i;
        }
        if (blockEndIndex === headerIndex) {blockEndIndex = lines.length;}
    }

    const before = lines.slice(0, headerIndex);
    const after = lines.slice(blockEndIndex + 1);
    const injected = serializeLocalized(localized).split('\n');

    return [...before, ...injected, ...after].join('\n');
}

function serializeLocalized(localized) {
    // Sort by locale for deterministic output
    const entries = [...localized.entries()].sort(([a], [b]) => a.localeCompare(b));
    const out = [];
    out.push('releaseNotes:');
    for (const [locale, notes] of entries) {
        // Quote the locale in case it contains special chars
        out.push(`  - locale: ${JSON.stringify(locale)}`);
        // Use block-scalar (|) for the notes so multiline markdown
        // is preserved verbatim, with 4-space indent and a trailing
        // blank line so the next entry starts cleanly.
        out.push('    notes: |');
        const noteLines = notes.replace(/\n$/, '').split('\n');
        for (const line of noteLines) {
            out.push(`      ${line}`);
        }
    }
    return out.join('\n');
}

async function expandLatestGlobs(paths) {
    const out = [];
    for (const p of paths) {
        if (p.includes('*')) {
            const dir = p.slice(0, p.lastIndexOf('/'));
            const pattern = p.slice(p.lastIndexOf('/') + 1);
            const re = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
            const files = await readdir(dir);
            for (const f of files) {
                if (re.test(f)) {out.push(resolve(dir, f));}
            }
        } else {
            out.push(resolve(p));
        }
    }
    return out;
}

async function main() {
    const opts = parseArgs(argv.slice(2));
    if (opts.latest.length === 0) {
        console.error('At least one --latest <file> is required.');
        printHelp();
        exit(2);
    }
    const localized = await loadNotes(opts);
    if (localized.size === 0) {
        console.error('No localized notes provided (use --note or --notes-json).');
        exit(2);
    }
    const targets = await expandLatestGlobs(opts.latest);
    if (targets.length === 0) {
        console.error('No latest*.yml files matched the --latest patterns.');
        exit(2);
    }

    for (const target of targets) {
        const original = await readFile(target, 'utf8');
        const updated = injectLocalizedNotes(original, localized);
        if (updated === original) {
            console.log(`[inject] ${basename(target)}: no change`);
            continue;
        }
        await writeFile(target, updated, 'utf8');
        console.log(`[inject] ${basename(target)}: localized releaseNotes written (${localized.size} locale${localized.size === 1 ? '' : 's'})`);
    }
}

main().catch((err) => {
    console.error(`[inject] Fatal: ${err.message}`);
    exit(1);
});
