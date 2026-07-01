/**
 * @vitest-environment happy-dom
 */

import { createModals } from '../src/renderer/modules/modals.js';

function createModalApp() {
    document.body.innerHTML = `
        <div id="confirmModal" class="modal" style="display: none">
            <div class="modal-content">
                <button id="agreeConfirmBtn">Yes</button>
                <button id="cancelConfirmBtn">No</button>
            </div>
        </div>
    `;

    return {
        state: { confirmModalEl: document.getElementById('confirmModal') },
        i18n: { t: (key) => key, getCurrentLang: () => 'en' },
        toast: { showToast: () => {} },
        electronAPI: null,
        helpers: { escapeHtml: (v) => v }
    };
}

describe('modal close race', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('does not hide a reopened confirm modal when a previous close timer fires', async () => {
        const modals = createModals(createModalApp());
        const confirmModal = document.getElementById('confirmModal');

        const first = modals.showConfirmAsync('Build?', 'Build');
        await Promise.resolve();
        await modals.settleConfirm(true);
        await expect(first).resolves.toBe(true);

        void modals.showConfirmAsync('Export ZIP?', 'Export ZIP');
        await Promise.resolve();
        expect(confirmModal.style.display).toBe('flex');

        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(confirmModal.style.display).toBe('flex');
    });

    it('waits for the confirm modal to close before opening the next one', async () => {
        const modals = createModals(createModalApp());
        const confirmModal = document.getElementById('confirmModal');
        const opened = [];

        const first = modals.showConfirmAsync('Build?', 'Build').then((value) => {
            opened.push('first-resolved');
            return value;
        });

        await Promise.resolve();
        expect(confirmModal.style.display).toBe('flex');

        void modals.showConfirmAsync('Export ZIP?', 'Export ZIP').then(() => {
            opened.push('second-opened');
        });

        await Promise.resolve();
        expect(opened).toEqual([]);

        await modals.settleConfirm(true);
        await first;

        expect(opened).toEqual(['first-resolved']);
        expect(confirmModal.style.display).toBe('flex');

        await modals.settleConfirm(false);
        await Promise.resolve();
        expect(opened).toEqual(['first-resolved', 'second-opened']);
    });
});