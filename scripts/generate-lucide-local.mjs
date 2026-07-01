#!/usr/bin/env node
/**
 * Scans the codebase for Lucide icon names and regenerates lucide-local.js.
 * Usage: node scripts/generate-lucide-local.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outFile = path.join(root, 'src/renderer/modules/lucide-local.js');
const iconsModule = path.join(root, 'node_modules', 'lucide-static', 'icons');

const scanDirs = [
    path.join(root, 'src/renderer'),
    path.join(root, 'src/main'),
    path.join(root, 'tests'),
];

const iconNamePattern = /data-lucide=["']([a-z0-9-]+)["']/g;
const iconRefPattern = /icon:\s*['"]([a-z0-9-]+)['"]/g;

function collectIconNames() {
    const names = new Set(['file']);

    function scanFile(filePath) {
        const text = fs.readFileSync(filePath, 'utf8');
        for (const pattern of [iconNamePattern, iconRefPattern]) {
            pattern.lastIndex = 0;
            let match;
            while ((match = pattern.exec(text)) !== null) {
                names.add(match[1]);
            }
        }
    }

    function walk(dir) {
        if (!fs.existsSync(dir)) {return;}
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (entry.name !== 'node_modules' && entry.name !== 'dist') {walk(full);}
            } else if (/\.(html|js|mjs)$/.test(entry.name)) {
                scanFile(full);
            }
        }
    }

    scanDirs.forEach(walk);
    return [...names].sort();
}

function loadSvgBody(iconName) {
    const svgPath = path.join(iconsModule, `${iconName}.svg`);
    if (!fs.existsSync(svgPath)) {return null;}
    const svg = fs.readFileSync(svgPath, 'utf8');
    const inner = svg
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<svg[^>]*>/i, '')
        .replace(/<\/svg>/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    return inner;
}

const EXTRA_ICONS = {
    restore: '<rect x="4" y="9" width="11" height="11" rx="2"/><path d="M20 15V5a2 2 0 0 0-2-2H8"/>',
    whale: '<path d="M3 18c0-7 5-13 11-13 4 0 7 3 7 7 0 5-4 9-8 9-5 0-10-1-10-3z"/><path d="M3 18l-2.5-5"/><path d="M3 18l-2.5 5"/><circle cx="17.5" cy="11" r="1.5" fill="currentColor"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
};

function buildFile(iconNames) {
    const allNames = [...new Set([...iconNames, ...Object.keys(EXTRA_ICONS)])].sort();

    const lines = allNames.map((name) => {
        const body = EXTRA_ICONS[name] || loadSvgBody(name);
        if (!body) {
            console.warn(`[lucide] missing SVG for "${name}", using file fallback at runtime`);
            return null;
        }
        const safeBody = body.replace(/'/g, "\\'");
        return `        '${name}': '${safeBody}',`;
    }).filter(Boolean);

    return `export function installLucide() {
    const icons = {
${lines.join('\n')}
    };

    function createIcons(scope) {
        (scope || document).querySelectorAll('i[data-lucide]').forEach((el) => {
            const name = el.getAttribute('data-lucide');
            const body = icons[name] || icons.file;
            const extraClass = el.getAttribute('class') || '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            svg.setAttribute('class', \`lucide lucide-\${name}\${extraClass ? \` \${extraClass}\` : ''}\`);
            svg.innerHTML = body;
            el.replaceWith(svg);
        });
    }

    if (typeof window !== 'undefined') {
        window.lucide = { createIcons };
    }
    return { createIcons };
}
`;
}

function main() {
    if (!fs.existsSync(iconsModule)) {
        console.error('Install lucide-static first: npm install -D lucide-static');
        process.exit(1);
    }

    const names = collectIconNames();
    const content = buildFile(names);
    fs.writeFileSync(outFile, content, 'utf8');
    console.log(`Wrote ${names.length} icons to ${path.relative(root, outFile)}`);
}

main();