export function createMarkdown(app) {

const escapeHtml = app.helpers.escapeHtml;

    function processInline(text) {
        return text
            .replace(/(^|[^*\w])\*\*([^*\n]+)\*\*(?!\w)/g, '$1<strong>$2</strong>')
            .replace(/(^|[^_\w])__([^_\n]+)__(?![\w])/g, '$1<strong>$2</strong>')
            .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
            .replace(/(^|[^_\w])_([^_\n]+)_(?![_\w])/g, '$1<em>$2</em>')
            .replace(/(^|[^~\w])~~([^~\n]+)~~(?![\w])/g, '$1<del>$2</del>')
            .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (match, linkText, url) => {
                if (!/^(https?:|mailto:|#)/i.test(url)) {return match;}
                if (/^(javascript:|data:|file:|vbscript:)/i.test(url)) {return match;}
                const safeUrl = url.replace(/&quot;/g, '"').replace(/"/g, '&quot;');
                return `<a href="${safeUrl}">${linkText}</a>`;
            })
            .replace(/`([^`\n]+)`/g, '<code>$1</code>');
    }

    function isProbablyHtml(value) {
        const trimmed = String(value || '').trim();
        return /^<\s*[a-z][^>]*>/i.test(trimmed);
    }

    function renderMarkdown(markdown) {
        const lines = escapeHtml(markdown).split(/\r?\n/);
        let html = '';
        let inList = false;
        let inCode = false;
        let codeLines = [];

        const flushList = () => {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
        };

        lines.forEach((line) => {
            const trimmed = line.trimStart();

            if (trimmed.startsWith('```')) {
                if (inCode) {
                    html += `<pre><code>${codeLines.join('\n')}</code></pre>`;
                    codeLines = [];
                    inCode = false;
                } else {
                    flushList();
                    inCode = true;
                }
                return;
            }

            if (inCode) {
                codeLines.push(line);
                return;
            }

            if (trimmed.startsWith('# ')) {
                flushList();
                html += `<h1>${processInline(trimmed.slice(2))}</h1>`;
            } else if (trimmed.startsWith('## ')) {
                flushList();
                html += `<h2>${processInline(trimmed.slice(3))}</h2>`;
            } else if (trimmed.startsWith('### ')) {
                flushList();
                html += `<h3>${processInline(trimmed.slice(4))}</h3>`;
            } else if (trimmed.startsWith('#### ')) {
                flushList();
                html += `<h4>${processInline(trimmed.slice(5))}</h4>`;
            } else if (/^---+\s*$/.test(trimmed)) {
                flushList();
                html += '<hr>';
            } else if (/^[-*] /.test(trimmed)) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${processInline(trimmed.slice(2))}</li>`;
            } else if (/^\d+\.\s+/.test(trimmed)) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${processInline(trimmed.replace(/^\d+\.\s+/, ''))}</li>`;
            } else if (trimmed === '') {
                flushList();
            } else {
                flushList();
                html += `<p>${processInline(trimmed)}</p>`;
            }
        });

        flushList();
        if (inCode) {html += `<pre><code>${codeLines.join('\n')}</code></pre>`;}
        return html;
    }

    function renderReleaseNotes(notes) {
        const trimmed = String(notes || '').trim();
        if (!trimmed) { return ''; }
        if (isProbablyHtml(trimmed)) { return trimmed; }
        return renderMarkdown(trimmed);
    }

    return { renderMarkdown, renderReleaseNotes, isProbablyHtml, escapeHtml, processInline };

}
