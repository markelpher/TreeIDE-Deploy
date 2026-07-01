import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const langs = ['en', 'pt', 'es'];

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const catalogs = {};
for (const lang of langs) {
    const filePath = path.join(root, 'src/shared/locales', `${lang}.json`);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing ${filePath}`);
        process.exit(1);
    }
    catalogs[lang] = loadJson(filePath);
}

const enKeys = Object.keys(catalogs.en).sort();
const ptKeys = new Set(Object.keys(catalogs.pt));
const missingInPt = enKeys.filter((k) => !ptKeys.has(k));
const missingInEn = [...ptKeys].filter((k) => !catalogs.en[k]).sort();

if (missingInPt.length || missingInEn.length) {
    if (missingInPt.length) { console.error('Missing in pt:', missingInPt.join(', ')); }
    if (missingInEn.length) { console.error('Missing in en:', missingInEn.join(', ')); }
    process.exit(1);
}

for (const lang of langs) {
    for (const [key, value] of Object.entries(catalogs[lang])) {
        if (typeof value !== 'string' || !value.length) {
            console.error(`Empty value for ${lang}.${key}`);
            process.exit(1);
        }
    }
}

console.log(`i18n OK: ${enKeys.length} keys per locale`);