function getIconDetails(name, isFolder) {
    if (isFolder) {
        return { icon: 'folder', class: 'tree-icon-folder' };
    }

    const lowerName = name.toLowerCase();
    const ext = name.split('.').pop().toLowerCase();

    // Specific Filenames (Priority)
    const fileMap = {
        'makefile': { icon: 'settings', class: 'tree-icon-default' },
        'dockerfile': { icon: 'settings', class: 'tree-icon-default' },
        'docker-compose.yml': { icon: 'settings', class: 'tree-icon-default' },
        'docker-compose.yaml': { icon: 'settings', class: 'tree-icon-default' },
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

    if (fileMap[lowerName]) return fileMap[lowerName];

    const map = {
        // Programming Languages & Scripts
        'js': { icon: 'file-code', class: 'tree-icon-code' },
        'mjs': { icon: 'file-code', class: 'tree-icon-code' },
        'cjs': { icon: 'file-code', class: 'tree-icon-code' },
        'ts': { icon: 'file-code', class: 'tree-icon-code' },
        'mts': { icon: 'file-code', class: 'tree-icon-code' },
        'cts': { icon: 'file-code', class: 'tree-icon-code' },
        'jsx': { icon: 'file-code', class: 'tree-icon-code' },
        'tsx': { icon: 'file-code', class: 'tree-icon-code' },
        'py': { icon: 'file-code', class: 'tree-icon-code' },
        'pyw': { icon: 'file-code', class: 'tree-icon-code' },
        'pyc': { icon: 'file-code', class: 'tree-icon-code' },
        'ipynb': { icon: 'file-code', class: 'tree-icon-code' },
        'java': { icon: 'file-code', class: 'tree-icon-code' },
        'class': { icon: 'file-code', class: 'tree-icon-code' },
        'jar': { icon: 'archive', class: 'tree-icon-archive' },
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
        'scala': { icon: 'file-code', class: 'tree-icon-code' },

        // Web Technologies
        'html': { icon: 'file-code', class: 'tree-icon-code' },
        'htm': { icon: 'file-code', class: 'tree-icon-code' },
        'css': { icon: 'file-code', class: 'tree-icon-code' },
        'scss': { icon: 'file-code', class: 'tree-icon-code' },
        'sass': { icon: 'file-code', class: 'tree-icon-code' },
        'less': { icon: 'file-code', class: 'tree-icon-code' },
        'json': { icon: 'file-json', class: 'tree-icon-json' },
        'xml': { icon: 'file-code', class: 'tree-icon-code' },
        'svg': { icon: 'image', class: 'tree-icon-image' },

        // Data & Config
        'yaml': { icon: 'settings', class: 'tree-icon-default' },
        'yml': { icon: 'settings', class: 'tree-icon-default' },
        'toml': { icon: 'settings', class: 'tree-icon-default' },
        'ini': { icon: 'settings', class: 'tree-icon-default' },
        'conf': { icon: 'settings', class: 'tree-icon-default' },
        'config': { icon: 'settings', class: 'tree-icon-default' },
        'csv': { icon: 'table', class: 'tree-icon-default' },
        'tsv': { icon: 'table', class: 'tree-icon-default' },
        'sql': { icon: 'database', class: 'tree-icon-default' },
        'db': { icon: 'database', class: 'tree-icon-default' },
        'sqlite': { icon: 'database', class: 'tree-icon-default' },

        // Documentation
        'md': { icon: 'file-text', class: 'tree-icon-text' },
        'markdown': { icon: 'file-text', class: 'tree-icon-text' },
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

function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

window.getIconDetails = getIconDetails;
window.refreshIcons = refreshIcons;
