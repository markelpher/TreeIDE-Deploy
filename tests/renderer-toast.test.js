/**
 * @vitest-environment happy-dom
 */

import { resolveUserMessage } from '../src/shared/helpers.js';
import { createI18n } from '../src/shared/i18n.js';
import { createToast } from '../src/renderer/modules/toast.js';

const i18n = createI18n('en');

function mountToastStack() {
    document.body.innerHTML = '<div id="toastStack" class="toast-stack"></div>';
}

function createToastApi() {
    return createToast({ helpers: { resolveUserMessage }, i18n });
}

describe('resolveToastText', () => {
    const { resolveToastText } = createToastApi();

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

describe('showToast stack', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        mountToastStack();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
    });

    it('renders validation errors in a toast item', () => {
        const { showToast } = createToastApi();
        showToast({ message: 'Line 5: invalid item name.', line: 5 }, 5000);

        const items = document.querySelectorAll('.toast-item');
        expect(items).toHaveLength(1);
        expect(items[0].textContent).toContain('Line 5');
    });

    it('stacks older toasts above newer ones', () => {
        const { showToast } = createToastApi();
        showToast('First error', 5000);
        showToast('Second error', 5000);

        const items = [...document.querySelectorAll('.toast-item')];
        expect(items).toHaveLength(2);
        expect(items[0].textContent).toBe('First error');
        expect(items[1].textContent).toBe('Second error');
    });

    it('does not duplicate the same visible message', () => {
        const { showToast } = createToastApi();
        showToast('Same error', 5000);
        showToast('Same error', 5000);

        expect(document.querySelectorAll('.toast-item')).toHaveLength(1);
    });

    it('extends visibility when the same message is shown again', () => {
        const { showToast } = createToastApi();
        showToast('Repeat me', 2000);
        vi.advanceTimersByTime(1500);
        showToast('Repeat me', 2000);

        expect(document.querySelectorAll('.toast-item')).toHaveLength(1);

        vi.advanceTimersByTime(3000);
        expect(document.querySelectorAll('.toast-item')).toHaveLength(1);

        vi.advanceTimersByTime(620);
        expect(document.querySelectorAll('.toast-item')).toHaveLength(0);
    });

    it('drops the oldest toast when the stack exceeds the limit', () => {
        const { showToast } = createToastApi();
        showToast('Toast 1', 8000);
        showToast('Toast 2', 8000);
        showToast('Toast 3', 8000);
        showToast('Toast 4', 8000);
        showToast('Toast 5', 8000);

        const items = [...document.querySelectorAll('.toast-item')];
        expect(items).toHaveLength(4);
        expect(items[0].textContent).toBe('Toast 2');
        expect(items[3].textContent).toBe('Toast 5');
    });
});