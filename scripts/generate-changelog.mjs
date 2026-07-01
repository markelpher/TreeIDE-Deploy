#!/usr/bin/env node
/**
 * TreeIDE - Categorized changelog generator
 *
 * Builds a markdown changelog from `git log` between two tags,
 * bucketing commits by conventional-commit prefix:
 *
 *   feat*, Feat*                       → ### Added
 *   fix*, Fix*                         → ### Fixed
 *   refactor*, perf*, style*, chore*,
 *     build*, ci*, docs*, revert*      → ### Changed
 *   remove*, drop*                     → ### Removed
 *   subject containing "!"             → ### Breaking
 *   anything else                      → ### Other
 *
 * Usage:
 *   node scripts/generate-changelog.mjs <previous_tag> <current_tag> <output_path>
 *
 * If previous_tag is empty, the entire history is used.
 * Falls back to an empty list if git log fails.
 */

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { argv, env, exit } from 'node:process';

const [prev, current, outPath] = argv.slice(2);

if (!current || !outPath) {
    console.error('Usage: node generate-changelog.mjs <previous_tag|-> <current_tag> <output_path>');
    exit(2);
}

const repo = env.GITHUB_REPOSITORY || 'markelpher/TreeIDE-Deploy';
const range = prev && prev !== '-' ? `${prev}..${current}` : current;
const compareUrl = prev && prev !== '-'
    ? `https://github.com/${repo}/compare/${prev}...${current}`
    : `https://github.com/${repo}/compare/${current}`;

let logOutput = '';
try {
    logOutput = execFileSync('git', [
        'log', range, '--pretty=format:%h %s', '--no-merges'
    ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
} catch (err) {
    console.warn(`[changelog] git log failed (${err.message}); continuing with empty list.`);
}

const buckets = { Added: '', Changed: '', Fixed: '', Removed: '', Breaking: '', Other: '' };
const lines = logOutput.split('\n');
for (const line of lines) {
    if (!line.trim()) {continue;}
    const spaceIdx = line.indexOf(' ');
    if (spaceIdx === -1) {continue;}
    const hash = line.slice(0, spaceIdx);
    const subject = line.slice(spaceIdx + 1);
    let bucket;
    if (/^feat/i.test(subject)) {bucket = 'Added';}
    else if (/^fix/i.test(subject)) {bucket = 'Fixed';}
    else if (/^(refactor|perf|style|chore|build|ci|docs|revert)/i.test(subject)) {bucket = 'Changed';}
    else if (/^(remove|drop)/i.test(subject)) {bucket = 'Removed';}
    else if (subject.includes('!')) {bucket = 'Breaking';}
    else {bucket = 'Other';}
    const short = hash.slice(0, 7);
    buckets[bucket] += `- ${subject} (${short})\n`;
}

const out = [];
out.push(`## What's new in ${current}`);
out.push('');

for (const section of ['Added', 'Changed', 'Fixed', 'Removed', 'Breaking']) {
    if (buckets[section]) {
        out.push(`### ${section}`);
        out.push('');
        out.push(buckets[section].trimEnd());
        out.push('');
    }
}
if (buckets.Other) {
    out.push('### Other');
    out.push('');
    out.push(buckets.Other.trimEnd());
    out.push('');
}

out.push(`**Full Changelog**: ${compareUrl}`);
out.push('');

writeFileSync(outPath, out.join('\n'), 'utf8');
console.log(`[changelog] Wrote ${out.join('\n').length} chars to ${outPath} (${lines.length} commits)`);
