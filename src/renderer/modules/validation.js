export function createValidation(app) {

const pathLooksUnsafe = app.helpers.pathLooksUnsafe;
    const getLineIndent = app.helpers.getLineIndent;
    const formatMessage = app.helpers.formatMessage;
    const escapeHtml = app.helpers.escapeHtml;
    const resolveUserMessage = app.helpers.resolveUserMessage;

    function pushError(errors, message, line = null) {
        errors.push({ message, line });
    }

    function dedupeErrors(errors) {
        const seen = new Set();
        return errors.filter((entry) => {
            const key = `${entry.line ?? 'x'}:${entry.message}`;
            if (seen.has(key)) {return false;}
            seen.add(key);
            return true;
        });
    }

    function validateEditorContent(content) {
        const errors = [];
        const lines = content.split(/\r\n|\r|\n/);
        const stack = [{ indent: -1, names: new Set() }];
        let hasItems = false;

        lines.forEach((rawLine, index) => {
            if (rawLine.trim() === '') {return;}

            hasItems = true;
            const lineNumber = index + 1;
            const parsedLine = getLineIndent(rawLine);
            const name = parsedLine.value.trim();
            const leadingWhitespace = rawLine.match(/^[\t ]*/)[0];
            const spaces = (leadingWhitespace.match(/ /g) || []).length;
            const tabs = (leadingWhitespace.match(/\t/g) || []).length;
            const cleanName = name.replace(/[\\/]+$/, '');
            const nameParts = cleanName.split(/[\\/]+/);

            if (!rawLine.startsWith('...') && tabs > 0 && spaces > 0) {
                pushError(errors, formatMessage(app.i18n.t('validation_bad_indent'), { line: lineNumber }), lineNumber);
            } else if (!rawLine.startsWith('...') && spaces % 4 !== 0) {
                pushError(errors, formatMessage(app.i18n.t('validation_bad_indent'), { line: lineNumber }), lineNumber);
            }

            if (!cleanName || cleanName === '.' || cleanName === '..' || cleanName.includes('\0') || /[<>:"|?*]/.test(cleanName) || /[\\/]/.test(cleanName)) {
                pushError(errors, formatMessage(app.i18n.t('validation_bad_name'), { line: lineNumber }), lineNumber);
            }

            if (pathLooksUnsafe(cleanName, nameParts)) {
                pushError(errors, formatMessage(app.i18n.t('validation_escape'), { line: lineNumber }), lineNumber);
            }

            while (stack.length && stack[stack.length - 1].indent >= parsedLine.indent) {stack.pop();}
            const parent = stack[stack.length - 1];
            const duplicateKey = cleanName.toLowerCase();

            if (parent.names.has(duplicateKey)) {
                pushError(errors, formatMessage(app.i18n.t('validation_duplicate'), { line: lineNumber }), lineNumber);
            }

            parent.names.add(duplicateKey);
            stack.push({ indent: parsedLine.indent, names: new Set() });
        });

        if (!hasItems) {pushError(errors, app.i18n.t('validation_empty'), null);}

        return { errors: dedupeErrors(errors), hasItems };
    }

    function goToEditorLine(lineNumber) {
        const editorEl = (app.state && app.state.editor) || document.getElementById('editor');
        if (!editorEl || !lineNumber || lineNumber < 1) {return;}

        const lines = editorEl.value.split(/\r\n|\r|\n/);
        let start = 0;
        for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
            start += lines[i].length + 1;
        }
        const end = start + (lines[lineNumber - 1] ? lines[lineNumber - 1].length : 0);

        editorEl.focus();
        editorEl.setSelectionRange(start, end);

        const computed = typeof getComputedStyle === 'function' ? getComputedStyle(editorEl) : null;
        const lineHeight = parseFloat(computed?.lineHeight) || 20;
        const paddingTop = parseFloat(computed?.paddingTop) || 0;
        editorEl.scrollTop = Math.max(0, (lineNumber - 3) * lineHeight - paddingTop);
    }

    function bindValidationPanelClicks() {
        const panel = document.getElementById('validationPanel');
        if (!panel || panel.dataset.boundClicks) {return;}
        panel.dataset.boundClicks = '1';
        panel.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-goto-line]');
            if (!btn) {return;}
            const line = Number(btn.dataset.gotoLine);
            if (line > 0) {goToEditorLine(line);}
        });
    }

    function updateValidationPanel(validation = null) {
        const panel = document.getElementById('validationPanel');
        if (!panel) {return;}

        bindValidationPanelClicks();

        const editorEl = (app.state && app.state.editor) || document.getElementById('editor');
        if (!editorEl) {return;}

        if (!validation && editorEl.value.trim() === '') {
            panel.classList.remove('show');
            panel.innerHTML = '';
            return;
        }

        validation = validation || validateEditorContent(editorEl.value);

        if (validation.errors.length === 0) {
            panel.classList.remove('show');
            panel.innerHTML = '';
            return;
        }

        const gotoLabel = app.i18n.t('validation_goto_line');
        panel.innerHTML = `<strong>${escapeHtml(app.i18n.t('validation_title'))}</strong><ul>` +
            validation.errors.slice(0, 6).map((error) => {
                const message = resolveUserMessage(error?.message ?? error, app.i18n.t('validation_unknown'));
                if (error.line) {
                    return `<li><button type="button" class="validation-error-btn" data-goto-line="${error.line}" aria-label="${escapeHtml(gotoLabel)} ${error.line}">${escapeHtml(message)}</button></li>`;
                }
                return `<li>${escapeHtml(message)}</li>`;
            }).join('') +
            `</ul>`;
        panel.classList.add('show');
    }

    return {
        pathLooksUnsafe,
        validateEditorContent,
        updateValidationPanel,
        goToEditorLine
    };

}
