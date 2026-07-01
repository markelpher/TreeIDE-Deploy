/**
 * TreeIDE - Icon resolver
 * Maps file names and types to Lucide icon names and CSS classes for the tree view.
 */

function getIconDetails(name, isFolder) {
    if (isFolder) {
        return { icon: 'folder', class: 'tree-icon-folder' };
    }

    const lowerName = name.toLowerCase();
    const ext = name.split('.').pop().toLowerCase();

    // Specific Filenames (Priority)
    const fileMap = {
        'makefile': { icon: 'settings', class: 'tree-icon-default' },
        'dockerfile': { icon: 'whale', class: 'tree-icon-docker' },
        'docker-compose.yml': { icon: 'whale', class: 'tree-icon-docker' },
        'docker-compose.yaml': { icon: 'whale', class: 'tree-icon-docker' },
        'compose.yml': { icon: 'whale', class: 'tree-icon-docker' },
        'compose.yaml': { icon: 'whale', class: 'tree-icon-docker' },
        'package.json': { icon: 'file-json', class: 'tree-icon-json' },
        'package-lock.json': { icon: 'lock', class: 'tree-icon-default' },
        'composer.json': { icon: 'file-json', class: 'tree-icon-json' },
        'composer.lock': { icon: 'lock', class: 'tree-icon-default' },
        'pnpm-lock.yaml': { icon: 'lock', class: 'tree-icon-default' },
        'pnpm-workspace.yaml': { icon: 'settings', class: 'tree-icon-default' },
        'bun.lockb': { icon: 'lock', class: 'tree-icon-default' },
        'bunfig.toml': { icon: 'settings', class: 'tree-icon-default' },
        'deno.json': { icon: 'file-json', class: 'tree-icon-json' },
        'deno.jsonc': { icon: 'file-json', class: 'tree-icon-json' },
        'gemfile': { icon: 'file-code', class: 'tree-icon-code' },
        'rakefile': { icon: 'file-code', class: 'tree-icon-code' },
        'procfile': { icon: 'settings', class: 'tree-icon-default' },
        'go.mod': { icon: 'settings', class: 'tree-icon-default' },
        'go.sum': { icon: 'lock', class: 'tree-icon-default' },
        'cargo.toml': { icon: 'settings', class: 'tree-icon-default' },
        'cargo.lock': { icon: 'lock', class: 'tree-icon-default' },
        'webpack.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'webpack.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'vite.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'vite.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'next.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'next.config.mjs': { icon: 'settings', class: 'tree-icon-default' },
        'tailwind.config.js': { icon: 'settings', class: 'tree-icon-default' },
        'tailwind.config.ts': { icon: 'settings', class: 'tree-icon-default' },
        'tsconfig.json': { icon: 'file-json', class: 'tree-icon-json' },
        '.gitignore': { icon: 'settings', class: 'tree-icon-default' },
        '.gitattributes': { icon: 'settings', class: 'tree-icon-default' },
        '.editorconfig': { icon: 'settings', class: 'tree-icon-default' },
        '.env': { icon: 'settings', class: 'tree-icon-default' },
        '.env.local': { icon: 'settings', class: 'tree-icon-default' },
        '.env.development': { icon: 'settings', class: 'tree-icon-default' },
        '.env.production': { icon: 'settings', class: 'tree-icon-default' },
        '.env.example': { icon: 'settings', class: 'tree-icon-default' },
    };

    if (fileMap[lowerName]) {return fileMap[lowerName];}

    // Prefix-based matches (case-insensitive)
    if (lowerName.startsWith('dockerfile.') || lowerName === 'dockerfile') {return { icon: 'whale', class: 'tree-icon-docker' };}
    if (lowerName.startsWith('compose.') && (ext === 'yml' || ext === 'yaml')) {return { icon: 'whale', class: 'tree-icon-docker' };}
    if (lowerName.startsWith('docker-compose')) {return { icon: 'whale', class: 'tree-icon-docker' };}

    const map = {
        // Programming Languages & Scripts
        'js': { icon: 'file-code', class: 'tree-icon-code' },
        'mjs': { icon: 'file-code', class: 'tree-icon-code' },
        'cjs': { icon: 'file-code', class: 'tree-icon-code' },
        'ts': { icon: 'file-code', class: 'tree-icon-code' },
        'mts': { icon: 'file-code', class: 'tree-icon-code' },
        'cts': { icon: 'file-code', class: 'tree-icon-code' },
        'jsx': { icon: 'component', class: 'tree-icon-react' },
        'tsx': { icon: 'component', class: 'tree-icon-react' },
        'py': { icon: 'file-code', class: 'tree-icon-code' },
        'pyw': { icon: 'file-code', class: 'tree-icon-code' },
        'pyc': { icon: 'file-code', class: 'tree-icon-code' },
        'ipynb': { icon: 'file-code', class: 'tree-icon-code' },
        'java': { icon: 'file-code', class: 'tree-icon-code' },
        'class': { icon: 'file-code', class: 'tree-icon-code' },
        'c': { icon: 'file-code', class: 'tree-icon-code' },
        'cpp': { icon: 'file-code', class: 'tree-icon-code' },
        'cc': { icon: 'file-code', class: 'tree-icon-code' },
        'cxx': { icon: 'file-code', class: 'tree-icon-code' },
        'h': { icon: 'file-code', class: 'tree-icon-code' },
        'hpp': { icon: 'file-code', class: 'tree-icon-code' },
        'hh': { icon: 'file-code', class: 'tree-icon-code' },
        'hxx': { icon: 'file-code', class: 'tree-icon-code' },
        'cs': { icon: 'file-code', class: 'tree-icon-code' },
        'fs': { icon: 'file-code', class: 'tree-icon-code' },
        'fsx': { icon: 'file-code', class: 'tree-icon-code' },
        'fsi': { icon: 'file-code', class: 'tree-icon-code' },
        'go': { icon: 'file-code', class: 'tree-icon-code' },
        'rs': { icon: 'file-code', class: 'tree-icon-code' },
        'php': { icon: 'file-code', class: 'tree-icon-code' },
        'rb': { icon: 'file-code', class: 'tree-icon-code' },
        'pl': { icon: 'file-code', class: 'tree-icon-code' },
        'sh': { icon: 'terminal', class: 'tree-icon-code' },
        'bash': { icon: 'terminal', class: 'tree-icon-code' },
        'zsh': { icon: 'terminal', class: 'tree-icon-code' },
        'fish': { icon: 'terminal', class: 'tree-icon-code' },
        'bat': { icon: 'terminal', class: 'tree-icon-code' },
        'ps1': { icon: 'terminal', class: 'tree-icon-code' },
        'lua': { icon: 'file-code', class: 'tree-icon-code' },
        'r': { icon: 'file-code', class: 'tree-icon-code' },
        'dart': { icon: 'file-code', class: 'tree-icon-code' },
        'swift': { icon: 'file-code', class: 'tree-icon-code' },
        'kt': { icon: 'file-code', class: 'tree-icon-code' },
        'kts': { icon: 'file-code', class: 'tree-icon-code' },
        'clj': { icon: 'file-code', class: 'tree-icon-code' },
        'cljs': { icon: 'file-code', class: 'tree-icon-code' },
        'ex': { icon: 'file-code', class: 'tree-icon-code' },
        'exs': { icon: 'file-code', class: 'tree-icon-code' },
        'erl': { icon: 'file-code', class: 'tree-icon-code' },
        'hs': { icon: 'file-code', class: 'tree-icon-code' },
        'lhs': { icon: 'file-code', class: 'tree-icon-code' },
        'ml': { icon: 'file-code', class: 'tree-icon-code' },
        'mli': { icon: 'file-code', class: 'tree-icon-code' },
        'scala': { icon: 'file-code', class: 'tree-icon-code' },
        'zig': { icon: 'file-code', class: 'tree-icon-code' },
        'nim': { icon: 'file-code', class: 'tree-icon-code' },
        'cr': { icon: 'file-code', class: 'tree-icon-code' },
        'jl': { icon: 'file-code', class: 'tree-icon-code' },
        'pm': { icon: 'file-code', class: 'tree-icon-code' },
        'pas': { icon: 'file-code', class: 'tree-icon-code' },
        'pp': { icon: 'file-code', class: 'tree-icon-code' },
        'f': { icon: 'file-code', class: 'tree-icon-code' },
        'f90': { icon: 'file-code', class: 'tree-icon-code' },
        'f95': { icon: 'file-code', class: 'tree-icon-code' },
        'ada': { icon: 'file-code', class: 'tree-icon-code' },
        'adb': { icon: 'file-code', class: 'tree-icon-code' },
        'cob': { icon: 'file-code', class: 'tree-icon-code' },
        'm': { icon: 'file-code', class: 'tree-icon-code' },
        'mm': { icon: 'file-code', class: 'tree-icon-code' },
        'coffee': { icon: 'file-code', class: 'tree-icon-code' },
        'groovy': { icon: 'file-code', class: 'tree-icon-code' },
        'gradle': { icon: 'file-code', class: 'tree-icon-code' },
        'sol': { icon: 'file-code', class: 'tree-icon-code' },
        'vy': { icon: 'file-code', class: 'tree-icon-code' },
        'proto': { icon: 'file-code', class: 'tree-icon-code' },
        'tf': { icon: 'file-code', class: 'tree-icon-code' },
        'hcl': { icon: 'file-code', class: 'tree-icon-code' },
        'glsl': { icon: 'file-code', class: 'tree-icon-code' },
        'hlsl': { icon: 'file-code', class: 'tree-icon-code' },
        'wgsl': { icon: 'file-code', class: 'tree-icon-code' },
        'vert': { icon: 'file-code', class: 'tree-icon-code' },
        'frag': { icon: 'file-code', class: 'tree-icon-code' },
        'wat': { icon: 'file-code', class: 'tree-icon-code' },
        'diff': { icon: 'file-code', class: 'tree-icon-code' },
        'patch': { icon: 'file-code', class: 'tree-icon-code' },

        // Web Technologies
        'html': { icon: 'globe', class: 'tree-icon-html' },
        'htm': { icon: 'globe', class: 'tree-icon-html' },
        'css': { icon: 'file-code', class: 'tree-icon-code' },
        'scss': { icon: 'file-code', class: 'tree-icon-code' },
        'sass': { icon: 'file-code', class: 'tree-icon-code' },
        'less': { icon: 'file-code', class: 'tree-icon-code' },
        'json': { icon: 'file-json', class: 'tree-icon-json' },
        'xml': { icon: 'file-code', class: 'tree-icon-code' },
        'svg': { icon: 'image', class: 'tree-icon-image' },
        'vue': { icon: 'component', class: 'tree-icon-vue' },
        'svelte': { icon: 'component', class: 'tree-icon-svelte' },
        'astro': { icon: 'component', class: 'tree-icon-code' },
        'pug': { icon: 'file-code', class: 'tree-icon-code' },
        'jade': { icon: 'file-code', class: 'tree-icon-code' },
        'ejs': { icon: 'file-code', class: 'tree-icon-code' },
        'hbs': { icon: 'file-code', class: 'tree-icon-code' },
        'handlebars': { icon: 'file-code', class: 'tree-icon-code' },
        'mustache': { icon: 'file-code', class: 'tree-icon-code' },
        'njk': { icon: 'file-code', class: 'tree-icon-code' },
        'liquid': { icon: 'file-code', class: 'tree-icon-code' },
        'styl': { icon: 'file-code', class: 'tree-icon-code' },
        'stylus': { icon: 'file-code', class: 'tree-icon-code' },
        'graphql': { icon: 'braces', class: 'tree-icon-code' },
        'gql': { icon: 'braces', class: 'tree-icon-code' },
        'prisma': { icon: 'file-code', class: 'tree-icon-code' },
        'jsonc': { icon: 'file-json', class: 'tree-icon-json' },
        'json5': { icon: 'file-json', class: 'tree-icon-json' },
        'jsonl': { icon: 'file-json', class: 'tree-icon-json' },

        // Data & Config
        'yaml': { icon: 'settings', class: 'tree-icon-default' },
        'yml': { icon: 'settings', class: 'tree-icon-default' },
        'toml': { icon: 'settings', class: 'tree-icon-default' },
        'ini': { icon: 'settings', class: 'tree-icon-default' },
        'conf': { icon: 'settings', class: 'tree-icon-default' },
        'config': { icon: 'settings', class: 'tree-icon-default' },
        'csv': { icon: 'table', class: 'tree-icon-default' },
        'tsv': { icon: 'table', class: 'tree-icon-default' },
        'sql': { icon: 'database', class: 'tree-icon-database' },
        'db': { icon: 'database', class: 'tree-icon-default' },
        'sqlite': { icon: 'database', class: 'tree-icon-default' },

        // Documentation
        'md': { icon: 'file-text', class: 'tree-icon-text' },
        'markdown': { icon: 'file-text', class: 'tree-icon-text' },
        'rst': { icon: 'file-text', class: 'tree-icon-text' },
        'adoc': { icon: 'file-text', class: 'tree-icon-text' },
        'asciidoc': { icon: 'file-text', class: 'tree-icon-text' },
        'txt': { icon: 'file-text', class: 'tree-icon-text' },
        'pdf': { icon: 'file-text', class: 'tree-icon-text' },
        'rtf': { icon: 'file-text', class: 'tree-icon-text' },
        'log': { icon: 'file-text', class: 'tree-icon-text' },

        // Images
        'png': { icon: 'image', class: 'tree-icon-image' },
        'jpg': { icon: 'image', class: 'tree-icon-image' },
        'jpeg': { icon: 'image', class: 'tree-icon-image' },
        'gif': { icon: 'image', class: 'tree-icon-image' },
        'webp': { icon: 'image', class: 'tree-icon-image' },
        'ico': { icon: 'image', class: 'tree-icon-image' },
        'bmp': { icon: 'image', class: 'tree-icon-image' },
        'tif': { icon: 'image', class: 'tree-icon-image' },
        'tiff': { icon: 'image', class: 'tree-icon-image' },

        // Archives
        'zip': { icon: 'archive', class: 'tree-icon-archive' },
        'tar': { icon: 'archive', class: 'tree-icon-archive' },
        'gz': { icon: 'archive', class: 'tree-icon-archive' },
        '7z': { icon: 'archive', class: 'tree-icon-archive' },
        'rar': { icon: 'archive', class: 'tree-icon-archive' },
        'bz2': { icon: 'archive', class: 'tree-icon-archive' },
        'xz': { icon: 'archive', class: 'tree-icon-archive' },
        'tgz': { icon: 'archive', class: 'tree-icon-archive' },
        'tbz2': { icon: 'archive', class: 'tree-icon-archive' },
        'txz': { icon: 'archive', class: 'tree-icon-archive' },
        'zst': { icon: 'archive', class: 'tree-icon-archive' },
        'cab': { icon: 'archive', class: 'tree-icon-archive' },
        'iso': { icon: 'archive', class: 'tree-icon-archive' },
        'dmg': { icon: 'archive', class: 'tree-icon-archive' },
        'lz': { icon: 'archive', class: 'tree-icon-archive' },
        'lzma': { icon: 'archive', class: 'tree-icon-archive' },
        'z': { icon: 'archive', class: 'tree-icon-archive' },
        'jar': { icon: 'archive', class: 'tree-icon-archive' },

        // Fonts
        'ttf': { icon: 'type', class: 'tree-icon-default' },
        'otf': { icon: 'type', class: 'tree-icon-default' },
        'woff': { icon: 'type', class: 'tree-icon-default' },
        'woff2': { icon: 'type', class: 'tree-icon-default' },

        // Others
        'env': { icon: 'settings', class: 'tree-icon-default' },
        'lock': { icon: 'lock', class: 'tree-icon-default' },
    };

    return map[ext] || { icon: 'file', class: 'tree-icon-default' };
}

export function createIcons(_app) {
    function refreshIcons(scope) {
        if (typeof window !== 'undefined' && window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons(scope);
        }
    }
    return { getIconDetails, refreshIcons };
}
