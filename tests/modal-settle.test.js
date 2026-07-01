/**
 * @vitest-environment happy-dom
 */

import { createModals } from '../src/renderer/modules/modals.js';

it('settles confirm modal', async () => {
    document.body.innerHTML = `
        <div id="confirmModal" class="modal" style="display: none">
            <div class="modal-content"><button>Yes</button></div>
        </div>
    `;
    const modals = createModals({
        state: {},
        i18n: { t: (key) => key, getCurrentLang: () => 'en' },
        toast: { showToast: () => {} },
        electronAPI: null,
        helpers: { escapeHtml: (v) => v }
    });

    const pending = modals.showConfirmAsync('Build?', 'Build');
    await Promise.resolve();
    expect(document.getElementById('confirmModal').style.display).toBe('flex');

    await modals.settleConfirm(true);
    await expect(pending).resolves.toBe(true);
});