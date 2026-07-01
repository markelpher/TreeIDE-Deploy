/**
 * @vitest-environment happy-dom
 */

import { resolveUserMessage } from '../src/shared/helpers.js';
import { createI18n } from '../src/shared/i18n.js';
import { createToast } from '../src/renderer/modules/toast.js';

const i18n = createI18n('en');
const toastApi = createToast({ helpers: { resolveUserMessage }, i18n });
const { resolveToastText, showToast } = toastApi;

describe('resolveToastText', () => {
    it('translates known i18n keys', () => {
        expect(resolveToastText('validation_empty')).toBe('Add at least one file or folder.');
    });

    it('unwraps validation error objects instead of [object Object]', () => {
        const text = resolveToastText({
            message: 'Line 2: use tabs or multiples of 4 spaces for indentation.',
            line: 2
        });
        expect(text).toContain('Line 2');
        expect(text).not.toContain('[object Object]');
    });

    it('keeps already-translated human-readable strings', () => {
        const sentence = 'Arquivo muito grande (máx 500MB)';
        expect(resolveToastText(sentence)).toBe(sentence);
    });
});

describe('showToast', () => {
    it('displays validation error message text in the toast element', () => {
        document.body.innerHTML = '<div id="toast"></div>';
        showToast({ message: 'Line 5: invalid item name.', line: 5 }, 5000);
        const toast = document.getElementById('toast');
        expect(toast.textContent).toContain('Line 5');
        expect(toast.style.display).toBe('block');
    });
});