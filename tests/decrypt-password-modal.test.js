/**
 * @vitest-environment happy-dom
 */

import { createModals } from '../src/renderer/modules/modals.js';

function createDecryptModalApp() {
    document.body.innerHTML = `
        <div id="decryptPasswordModal" class="modal" style="display: none">
            <div class="modal-content decrypt-password-modal">
                <div class="modal-header">
                    <h2 id="decryptPasswordTitle"></h2>
                    <button id="closeDecryptPasswordModal" type="button">Close</button>
                </div>
                <div class="modal-body decrypt-password-body">
                    <p id="decryptPasswordLead" class="decrypt-password-lead"></p>
                    <div class="decrypt-password-field">
                        <label id="decryptPasswordLabel" for="decryptPasswordInput"></label>
                        <input id="decryptPasswordInput" class="decrypt-password-input" type="password">
                        <p id="decryptPasswordError" class="decrypt-password-error" hidden></p>
                    </div>
                </div>
                <div class="modal-actions decrypt-password-actions">
                    <button id="decryptPasswordSubmit" type="button">Unlock</button>
                    <button id="decryptPasswordCancel" type="button">Cancel</button>
                </div>
            </div>
        </div>
    `;

    const messages = {
        decrypt_password_title: 'Password required',
        decrypt_password_label: 'Password',
        decrypt_password_placeholder: 'Enter the file password',
        decrypt_password_lead_tree: 'The file {file} is encrypted. Enter the password to open it.',
        decrypt_password_lead_zip: 'The archive {file} is password-protected. Enter the password to extract it.',
        decrypt_password_lead_both: 'The archive {file} is password-protected and may include encrypted content. Enter the password to open it.',
        decrypt_password_required: 'Enter a password to continue.',
        error_wrong_password: 'Incorrect password. Try again.',
        untitled: 'Untitled'
    };

    return {
        state: {},
        i18n: { t: (key) => messages[key] || key },
        toast: { showToast: () => {} },
        electronAPI: null,
        helpers: { escapeHtml: (v) => String(v).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c])) },
        icons: { refreshIcons: () => {} }
    };
}

describe('decrypt password modal', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders tree, zip, and combined lead messages with filename', async () => {
        const modals = createModals(createDecryptModalApp());
        const modal = document.getElementById('decryptPasswordModal');
        const lead = document.getElementById('decryptPasswordLead');
        const input = document.getElementById('decryptPasswordInput');

        void modals.showDecryptPasswordModal({ fileName: 'project.tree', kind: 'tree' });
        expect(modal.style.display).toBe('flex');
        expect(lead.innerHTML).toContain('project.tree');
        expect(lead.innerHTML).toContain('encrypted');
        expect(input.placeholder).toBe('Enter the file password');
        expect(document.activeElement).toBe(input);

        modals.closeDecryptPasswordModal(null);

        void modals.showDecryptPasswordModal({ fileName: 'bundle.zip', kind: 'both' });
        expect(lead.innerHTML).toContain('bundle.zip');
        expect(lead.textContent).toContain('encrypted content');
        modals.closeDecryptPasswordModal(null);
    });

    it('shows wrong-password error and keeps focus on the input', async () => {
        const modals = createModals(createDecryptModalApp());
        const error = document.getElementById('decryptPasswordError');
        const input = document.getElementById('decryptPasswordInput');

        void modals.showDecryptPasswordModal({ fileName: 'secure.zip', kind: 'zip', wrongPassword: true });
        expect(error.hidden).toBe(false);
        expect(error.textContent).toBe('Incorrect password. Try again.');
        expect(document.activeElement).toBe(input);
        modals.closeDecryptPasswordModal(null);
    });
});