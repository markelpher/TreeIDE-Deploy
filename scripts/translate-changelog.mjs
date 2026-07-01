#!/usr/bin/env node
/**
 * TreeIDE - Changelog translator
 *
 * Reads a markdown changelog and produces a translated version in
 * the target language using the GitHub Models API (gpt-4o-mini).
 * The model is told to preserve the markdown structure exactly:
 *
 *   - Section headers (### Added, ### Fixed, …) become the
 *     localized equivalent of the bucket name. We do NOT need
 *     the section labels to stay in English; the model is told
 *     to translate them as part of the body.
 *   - URLs, commit hashes, code spans, fenced code blocks, and
 *     inline backticks stay verbatim.
 *   - Bullet prefixes stay verbatim (-, *, numbers).
 *   - The `#`, `##`, `###` heading markers stay verbatim.
 *   - Bold/italic/strikethrough markers stay verbatim.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_… \
 *     node scripts/translate-changelog.mjs \
 *       --input path/to/changelog.en.md \
 *       --output path/to/changelog.pt.md \
 *       --target pt
 *
 * If the API call fails the script falls back to copying the
 * input to the output unchanged and prints a warning, so the
 * release pipeline never blocks on a flaky translation service.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { argv, env, exit } from 'node:process';

const MODELS_ENDPOINT = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini';
const GITHUB_API_VERSION = '2022-11-28';

const LANG_NAMES = {
    pt: 'Brazilian Portuguese (pt-BR)',
    en: 'English (en-US)',
    es: 'Spanish (es-ES)',
    fr: 'French (fr-FR)',
    de: 'German (de-DE)',
    ja: 'Japanese (ja-JP)',
    zh: 'Simplified Chinese (zh-CN)',
    ru: 'Russian (ru-RU)'
};

function parseArgs(args) {
    const out = { model: DEFAULT_MODEL, maxRetries: 3, timeoutMs: 120000 };
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--input' || a === '-i') {out.input = args[++i];}
        else if (a === '--output' || a === '-o') {out.output = args[++i];}
        else if (a === '--target' || a === '-t') {out.target = args[++i];}
        else if (a === '--source') {out.source = args[++i];}
        else if (a === '--model') {out.model = args[++i];}
        else if (a === '--max-retries') {out.maxRetries = parseInt(args[++i], 10);}
        else if (a === '--timeout-ms') {out.timeoutMs = parseInt(args[++i], 10);}
        else if (a === '--help' || a === '-h') {
            printHelp();
            exit(0);
        } else {
            console.error(`Unknown argument: ${a}`);
            printHelp();
            exit(2);
        }
    }
    if (!out.input || !out.output || !out.target) {
        console.error('Missing required arguments.');
        printHelp();
        exit(2);
    }
    return out;
}

function printHelp() {
    console.log(`Usage: node translate-changelog.mjs --input <file> --output <file> --target <lang>

Options:
  -i, --input <path>      Path to the source markdown file (required).
  -o, --output <path>     Path where the translated file is written (required).
  -t, --target <lang>     Target language code, e.g. "pt" (required).
      --source <lang>     Source language code (default: en).
      --model <name>      Model to use (default: ${DEFAULT_MODEL}).
      --max-retries <n>   Number of API retries on transient failures (default: 3).
      --timeout-ms <n>    Per-request timeout in ms (default: 60000).
  -h, --help              Show this help.`);
}

const SYSTEM_PROMPT = `You are a technical translator that translates software release-notes from one language to another.

Your output MUST be valid Markdown that preserves the source structure exactly:

1. Heading levels (#, ##, ###) and their order are kept verbatim. Translate the heading TEXT only, not the markers.
2. Bullet prefixes (-, *, +) and nested indentation are kept verbatim.
3. Fenced code blocks (\`\`\`) and inline code (\`…\`) are NEVER translated — copy the contents character-for-character.
4. URLs in plain text and inside markdown links are NEVER translated — copy them character-for-character.
5. Commit hashes (hex strings) and version strings (vX.Y.Z, X.Y.Z) are NEVER translated.
6. Markdown emphasis markers (*, **, _, __, ~~) are kept verbatim. Translate the enclosed text.
7. Markdown link syntax [text](url) is kept. Translate the link TEXT only.
8. The H2 title "## What's new in v…" line should be translated EXCEPT for the version string itself.
9. The trailing "**Full Changelog**: <url>" line keeps the bold markers, the English label, and the URL unchanged (it is rendered as a button by GitHub).

Output ONLY the translated markdown. No preamble, no explanation, no code-fence wrapper.`;

function buildUserPrompt(sourceText, sourceLang, targetLang) {
    const sourceName = LANG_NAMES[sourceLang] || sourceLang;
    const targetName = LANG_NAMES[targetLang] || targetLang;
    return `Translate the following software release notes from ${sourceName} to ${targetName}.

Preserve all markdown formatting, URLs, commit hashes, code, and version strings exactly as instructed.

Source markdown:

${sourceText}`;
}

async function translateOnce({ text, source, target, model, token, timeoutMs, signal }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
    const externalAbort = () => controller.abort(signal?.reason);
    if (signal) {
        if (signal.aborted) {controller.abort(signal.reason);}
        else {signal.addEventListener('abort', externalAbort, { once: true });}
    }

    try {
        const response = await fetch(MODELS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': GITHUB_API_VERSION,
            },
            body: JSON.stringify({
                model,
                temperature: 0,
                top_p: 0.1,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: buildUserPrompt(text, source, target) }
                ]
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            const err = new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
            err.status = response.status;
            throw err;
        }

        const json = await response.json();
        const content = json?.choices?.[0]?.message?.content;
        if (typeof content !== 'string' || content.trim() === '') {
            throw new Error('Empty response from model');
        }
        return content.trim();
    } finally {
        clearTimeout(timeoutId);
        if (signal) {signal.removeEventListener('abort', externalAbort);}
    }
}

function isTransient(err) {
    if (err?.name === 'AbortError') {return true;}
    if (err?.status >= 500) {return true;}
    if (err?.status === 429) {return true;}
    if (err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT') {return true;}
    return false;
}

async function translateWithRetry(opts) {
    let lastErr;
    for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
        try {
            return await translateOnce(opts);
        } catch (err) {
            lastErr = err;
            if (!isTransient(err) || attempt === opts.maxRetries) {throw err;}
            const backoff = Math.min(2000 * 2 ** (attempt - 1), 16000);
            const jitter = Math.random() * 500;
            console.warn(`[translate] Attempt ${attempt} failed (${err.message}); retrying in ${(backoff + jitter) | 0}ms`);
            await new Promise((r) => setTimeout(r, backoff + jitter));
        }
    }
    throw lastErr;
}

async function main() {
    const opts = parseArgs(argv.slice(2));

    if (!env.GITHUB_TOKEN) {
        console.error('GITHUB_TOKEN env var is required.');
        exit(2);
    }

    try {
        await access(opts.input, FS.R_OK);
    } catch (err) {
        console.error(`Cannot read input file: ${opts.input}`);
        exit(2);
    }

    const source = await readFile(opts.input, 'utf8');
    if (!source.trim()) {
        console.error('Input file is empty.');
        exit(2);
    }

    console.log(`[translate] Translating ${source.length} chars from ${opts.source} to ${opts.target} via ${opts.model}…`);

    let translated;
    try {
        translated = await translateWithRetry({
            text: source,
            source: opts.source || 'en',
            target: opts.target,
            model: opts.model,
            token: env.GITHUB_TOKEN,
            timeoutMs: opts.timeoutMs,
            maxRetries: opts.maxRetries
        });
    } catch (err) {
        console.warn(`[translate] FAILED after ${opts.maxRetries} attempts: ${err.message}`);
        console.warn('[translate] Falling back to source (English) — release will still go through, just not translated.');
        translated = source;
    }

    await writeFile(opts.output, translated, 'utf8');
    console.log(`[translate] Wrote ${translated.length} chars to ${opts.output}`);
}

main().catch((err) => {
    console.error(`[translate] Fatal: ${err.message}`);
    exit(1);
});
