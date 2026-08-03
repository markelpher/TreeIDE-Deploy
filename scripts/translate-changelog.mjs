#!/usr/bin/env node
/**
 * TreeIDE - Changelog translator
 *
 * Reads a markdown changelog and produces a translated version in
 * the target language using a chain of OpenAI-compatible chat providers.
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
 * Providers with small free-tier token budgets (e.g. Groq, 8k TPM) split
 * the changelog into heading-aligned chunks (~2.5k chars) so every request
 * stays inside the budget; providers with large quotas (Gemini, 250k TPM)
 * translate the whole document in a single request. Chunks are translated
 * in order and joined back. If a provider fails, the next one restarts the
 * whole document with its own chunking strategy.
 *
 * Provider chain (free tiers, tried in order; the first one with a
 * configured API key wins, and on failure the next is tried):
 *   1. Google Gemini       – GEMINI_API_KEY, gemini-3.5-flash (single-shot;
 *      free quota 250k TPM / 10 RPM — fastest for parallel locales)
 *   2. Groq (GPT-OSS 120B) – GROQ_API_KEY,  openai/gpt-oss-120b (chunked
 *      at ~2.5k chars; free quota 8k TPM — quality fallback)
 *   3. OpenRouter (free)   – OPENROUTER_API_KEY, openrouter/free
 *
 * Usage:
 *   GROQ_API_KEY=… \
 *     node scripts/translate-changelog.mjs \
 *       --input path/to/changelog.en.md \
 *       --output path/to/changelog.pt-br.md \
 *       --target pt-br
 *
 * Pin a specific provider with --provider, override the model with
 * --model, or point to any OpenAI-compatible endpoint with --endpoint
 * plus --key (and optionally --auth api-key for Azure-style services).
 *
 * If every provider fails, the script exits with an error by default
 * so releases never ship untranslated localized changelogs. Pass
 * --allow-source-fallback only for local/manual recovery runs.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { constants as FS } from 'node:fs';
import { argv, env, exit } from 'node:process';

const PROVIDERS = [
    {
        name: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        keyEnv: 'GEMINI_API_KEY',
        // Gemini free tier has ~250k TPM / 10 RPM, so the whole changelog
        // fits in a single request — fastest for parallel locale runs.
        defaultModel: 'gemini-3.5-flash',
        auth: 'bearer'
    },
    {
        name: 'groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        keyEnv: 'GROQ_API_KEY',
        // GPT-OSS 120B is the best-quality free model on Groq, but the
        // free tier only allows ~8k TPM, so the changelog is translated
        // in chunks.
        defaultModel: 'openai/gpt-oss-120b',
        chunkChars: 2500,
        auth: 'bearer'
    },
    {
        name: 'openrouter',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        keyEnv: 'OPENROUTER_API_KEY',
        // "openrouter/free" auto-routes to any live free model, so this
        // last-resort entry never goes stale when individual free models
        // are added or removed (e.g. qwen3-32b:free and DeepSeek:free
        // were retired and are now paid-only).
        defaultModel: 'openrouter/free',
        auth: 'bearer'
    }
];

const LANG_NAMES = {
    'pt-br': 'Brazilian Portuguese (pt-BR)',
    en: 'English (en-US)',
    es: 'neutral Spanish understandable across all regions (es)',
    fr: 'French (fr-FR)',
    de: 'German (de-DE)',
    ja: 'Japanese (ja-JP)',
    zh: 'Simplified Chinese (zh-CN)',
    ru: 'Russian (ru-RU)'
};

// Long changelogs are translated in chunks: free-tier providers enforce
// small tokens-per-minute budgets (e.g. 8k TPM on Groq) and completion
// caps, so a single request for the whole document gets truncated or
// rate-limited. Chunks break at markdown heading lines so each piece
// starts with its own section header and stays structurally intact.
const CHUNK_MAX_CHARS = 2500;

function splitChangelog(text, maxChars = CHUNK_MAX_CHARS) {
    const lines = text.split('\n');
    const chunks = [];
    let current = '';
    for (const line of lines) {
        const isHeading = /^#{1,4} /.test(line);
        if (isHeading && current && current.length >= maxChars * 0.75) {
            chunks.push(current);
            current = line;
        } else {
            current = current ? `${current}\n${line}` : line;
        }
    }
    if (current.trim()) {
        chunks.push(current);
    }
    return chunks.filter((chunk) => chunk.trim());
}

function parseArgs(args) {
    const out = {
        model: null,
        provider: null,
        endpoint: null,
        key: null,
        auth: 'bearer',
        maxRetries: 3,
        timeoutMs: 120000,
        allowSourceFallback: false
    };
    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '--input' || a === '-i') {out.input = args[++i];}
        else if (a === '--output' || a === '-o') {out.output = args[++i];}
        else if (a === '--target' || a === '-t') {out.target = args[++i];}
        else if (a === '--source') {out.source = args[++i];}
        else if (a === '--model') {out.model = args[++i];}
        else if (a === '--provider') {out.provider = args[++i];}
        else if (a === '--endpoint') {out.endpoint = args[++i];}
        else if (a === '--key') {out.key = args[++i];}
        else if (a === '--auth') {out.auth = args[++i];}
        else if (a === '--max-retries') {out.maxRetries = parseInt(args[++i], 10);}
        else if (a === '--timeout-ms') {out.timeoutMs = parseInt(args[++i], 10);}
        else if (a === '--allow-source-fallback') {out.allowSourceFallback = true;}
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
      --provider <name>   Pin a provider from the built-in chain: ${PROVIDERS.map((p) => p.name).join(', ')}.
      --model <name>      Override the model for the provider chain.
      --endpoint <url>    Use a custom OpenAI-compatible chat/completions endpoint.
      --key <key>         API key for the custom endpoint (or --auth api-key for Azure-style services).
      --auth <type>       Auth header for custom endpoints: "bearer" (default) or "api-key".
      --max-retries <n>   Number of API retries on transient failures (default: 3).
      --timeout-ms <n>    Per-request timeout in ms (default: 120000).
      --allow-source-fallback
                          Copy source text to output if translation fails.
  -h, --help              Show this help.

Free providers (tried in order when their key env var is set):
${PROVIDERS.map((p) => `  ${p.name.padEnd(10)} ${p.keyEnv.padEnd(22)} ${p.defaultModel}`).join('\n')}`);
}

const SYSTEM_PROMPT = `You are a technical translator that translates software release-notes from one language to another.

Write idiomatic, publication-quality prose for native speakers. Translate meaning in context instead of mirroring English word order. Use correct grammar, agreement, articles, prepositions, verb conjugation, punctuation, and established software terminology. Avoid false cognates, untranslated English when a natural target-language term exists, and awkward literal calques. Keep product names, feature names, UI labels, and technical identifiers unchanged only when they are clearly proper names or code. For Brazilian Portuguese, use natural pt-BR vocabulary and constructions. For Spanish, use neutral international Spanish and natural infinitive constructions for release-note actions.

Your output MUST be valid Markdown that preserves the source structure exactly:

1. Heading levels (#, ##, ###) and their order are kept verbatim. Translate the heading TEXT only, not the markers.
2. Bullet prefixes (-, *, +) and nested indentation are kept verbatim.
3. Fenced code blocks (\`\`\`) and inline code (\`…\`) are NEVER translated — copy the contents character-for-character.
4. URLs in plain text and inside markdown links are NEVER translated — copy them character-for-character.
5. Commit hashes (hex strings) and version strings (vX.Y.Z, X.Y.Z) are NEVER translated.
6. Markdown emphasis markers (*, **, _, __, ~~) are kept verbatim. Translate the enclosed text.
7. Markdown link syntax [text](url) is kept. Translate the link TEXT only.
8. The H2 title "## What's new in v…" line should be translated EXCEPT for the version string itself.
9. Do NOT add a "**Full Changelog**" footer — that link is GitHub-only and is not part of the source.
10. Do NOT add locale navigation lines (e.g. links to changelogs/pt-br.md) — those are repo-only and are not part of the source.

Output ONLY the translated markdown. No preamble, no explanation, no code-fence wrapper.`;

function buildUserPrompt(sourceText, sourceLang, targetLang) {
    const sourceName = LANG_NAMES[sourceLang] || sourceLang;
    const targetName = LANG_NAMES[targetLang] || targetLang;
    return `Translate the following software release notes from ${sourceName} to ${targetName}.

Preserve all markdown formatting, URLs, commit hashes, code, and version strings exactly as instructed.

Before answering, silently proofread the translation for fluency, terminology consistency, grammar, agreement, and conjugation. Ensure that every source heading and list item appears exactly once in the same order.

Source markdown:

${sourceText}`;
}

async function translateOnce({ text, source, target, model, endpoint, key, auth, timeoutMs, signal }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
    const externalAbort = () => controller.abort(signal?.reason);
    if (signal) {
        if (signal.aborted) {controller.abort(signal.reason);}
        else {signal.addEventListener('abort', externalAbort, { once: true });}
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (auth === 'api-key') {
            headers['api-key'] = key;
        } else {
            headers['Authorization'] = `Bearer ${key}`;
        }
        if (endpoint.includes('openrouter.ai')) {
            headers['HTTP-Referer'] = 'https://github.com/markelpher/treeide-deploy';
            headers['X-Title'] = 'TreeIDE changelog translator';
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
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
            // Rate-limit windows (e.g. Groq free tier TPM) roll every minute,
            // so wait out the window instead of retrying within it.
            const backoff = err?.status === 429 ? 60000 : Math.min(2000 * 2 ** (attempt - 1), 16000);
            const jitter = Math.random() * 500;
            console.warn(`[translate] Attempt ${attempt} failed (${err.message}); retrying in ${(backoff + jitter) | 0}ms`);
            await new Promise((r) => setTimeout(r, backoff + jitter));
        }
    }
    throw lastErr;
}

function resolveProviders(opts) {
    if (opts.endpoint && opts.key) {
        return [{
            name: 'custom',
            endpoint: opts.endpoint,
            key: opts.key,
            model: opts.model || 'gpt-4.1-mini',
            auth: opts.auth
        }];
    }
    if (opts.provider) {
        const provider = PROVIDERS.find((p) => p.name === opts.provider);
        if (!provider) {
            throw new Error(`Unknown provider "${opts.provider}". Available: ${PROVIDERS.map((p) => p.name).join(', ')}`);
        }
        if (!env[provider.keyEnv]) {
            throw new Error(`Provider "${provider.name}" requires the ${provider.keyEnv} env var.`);
        }
        return [{
            ...provider,
            key: env[provider.keyEnv],
            model: opts.model || provider.defaultModel
        }];
    }
    const available = PROVIDERS.filter((p) => env[p.keyEnv]);
    if (available.length === 0) {
        throw new Error(
            'No translation provider configured. Set one of: ' +
            PROVIDERS.map((p) => p.keyEnv).join(', ') +
            ' (free tiers), or pass --endpoint/--key for a custom OpenAI-compatible API.'
        );
    }
    return available.map((p) => ({
        ...p,
        key: env[p.keyEnv],
        model: opts.model || p.defaultModel
    }));
}

async function main() {
    const opts = parseArgs(argv.slice(2));

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

    let providers;
    try {
        providers = resolveProviders(opts);
    } catch (err) {
        console.error(err.message);
        exit(2);
    }

    let translated;
    const failures = [];
    for (const provider of providers) {
        const chunkChars = provider.chunkChars ?? null;
        const chunks = chunkChars ? splitChangelog(source, chunkChars) : [source];
        const parts = [];
        let ok = true;
        for (let i = 0; i < chunks.length; i++) {
            console.log(`[translate] Chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars) from ${opts.source || 'en'} to ${opts.target} via ${provider.name}/${provider.model}…`);
            try {
                parts.push(await translateWithRetry({
                    text: chunks[i],
                    source: opts.source || 'en',
                    target: opts.target,
                    model: provider.model,
                    endpoint: provider.endpoint,
                    key: provider.key,
                    auth: provider.auth,
                    timeoutMs: opts.timeoutMs,
                    maxRetries: opts.maxRetries
                }));
            } catch (err) {
                failures.push(`${provider.name} (chunk ${i + 1}): ${err.message}`);
                console.error(`[translate] Provider "${provider.name}" failed on chunk ${i + 1}: ${err.message}`);
                ok = false;
                break;
            }
        }
        if (ok) {
            translated = parts.join('\n\n');
            break;
        }
    }

    if (translated === undefined) {
        console.error(`[translate] FAILED — all providers failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
        if (!opts.allowSourceFallback) {
            console.error('[translate] Fatal: no provider produced a translation (use --allow-source-fallback to ship source notes).');
            exit(1);
        }
        console.warn('[translate] Falling back to source because --allow-source-fallback was provided.');
        translated = source;
    }

    await writeFile(opts.output, translated, 'utf8');
    console.log(`[translate] Wrote ${translated.length} chars to ${opts.output}`);
}

main().catch((err) => {
    console.error(`[translate] Fatal: ${err.message}`);
    exit(1);
});
