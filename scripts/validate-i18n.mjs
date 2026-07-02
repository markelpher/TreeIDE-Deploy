import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const langs = ['en', 'pt', 'es'];

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

const catalogs = {};
for (const lang of langs) {
    const filePath = path.join(root, 'src/shared/locales', `${lang}.json`);
    if (!fs.existsSync(filePath)) {
        fail(`Missing ${filePath}`);
    }
    catalogs[lang] = loadJson(filePath);
}

const enKeys = Object.keys(catalogs.en).sort();
const enKeySet = new Set(enKeys);

for (const lang of langs.filter((code) => code !== 'en')) {
    const localeKeys = new Set(Object.keys(catalogs[lang]));
    const missingInLocale = enKeys.filter((key) => !localeKeys.has(key));
    const extraInLocale = [...localeKeys].filter((key) => !enKeySet.has(key)).sort();

    if (missingInLocale.length || extraInLocale.length) {
        if (missingInLocale.length) {
            console.error(`Missing in ${lang}:`, missingInLocale.join(', '));
        }
        if (extraInLocale.length) {
            console.error(`Extra in ${lang}:`, extraInLocale.join(', '));
        }
        process.exit(1);
    }
}

for (const lang of langs) {
    for (const [key, value] of Object.entries(catalogs[lang])) {
        if (typeof value !== 'string' || !value.length) {
            fail(`Empty value for ${lang}.${key}`);
        }
    }
}

const htmlPath = path.join(root, 'src/renderer/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const htmlKeyPattern = /data-i18n(?:-placeholder)?="([^"]+)"/g;
const missingHtmlKeys = new Set();
let match;

while ((match = htmlKeyPattern.exec(html)) !== null) {
    const key = match[1];
    if (!enKeySet.has(key)) {
        missingHtmlKeys.add(key);
    }
}

if (missingHtmlKeys.size) {
    fail(`Missing locale keys used by index.html: ${[...missingHtmlKeys].sort().join(', ')}`);
}

console.log(`i18n OK: ${enKeys.length} keys per locale`);