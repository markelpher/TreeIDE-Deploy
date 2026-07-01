/**
 * @vitest-environment happy-dom
 */

import { createCustomSelect } from '../src/renderer/modules/custom-select.js';

const customSelect = createCustomSelect({});

describe('customSelect', () => {
    it('creates a styled dropdown aligned as the last control', () => {
        document.body.innerHTML = `
            <div class="settings-row">
                <label for="demoSelect">Language</label>
                <select id="demoSelect" class="styled-select">
                    <option value="en">English</option>
                    <option value="pt">Português</option>
                </select>
            </div>
        `;

        const instance = customSelect.create(document.getElementById('demoSelect'));
        expect(instance).toBeTruthy();

        const row = document.querySelector('.settings-row');
        const custom = row.querySelector('.custom-select');
        expect(custom).toBeTruthy();
        expect(row.lastElementChild).toBe(custom);
    });

    it('updates trigger text when selection changes', () => {
        document.body.innerHTML = `
            <select id="langSelect" class="styled-select">
                <option value="en">English</option>
                <option value="pt">Português</option>
            </select>
        `;
        const select = document.getElementById('langSelect');
        const instance = customSelect.create(select);
        select.value = 'pt';
        instance.update();
        const trigger = document.querySelector('.custom-select-trigger');
        expect(trigger.textContent).toBe('Português');
    });
});