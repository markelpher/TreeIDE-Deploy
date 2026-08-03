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
                    <option value="pt">Português (Brasil)</option>
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

    it('positions the options panel aligned with the trigger', () => {
        document.body.innerHTML = `
            <div class="modal-content">
                <div class="settings-row">
                    <label for="langSelect">Language</label>
                    <select id="langSelect" class="styled-select">
                        <option value="en">English</option>
                        <option value="pt">Português (Brasil)</option>
                    </select>
                </div>
            </div>
        `;

        const select = document.getElementById('langSelect');
        customSelect.create(select);

        const custom = document.querySelector('.custom-select');
        const trigger = custom.querySelector('.custom-select-trigger');
        const options = custom._optionsContainer;

        trigger.getBoundingClientRect = () => ({
            top: 100,
            left: 240,
            bottom: 132,
            right: 420,
            width: 180,
            height: 32,
            x: 240,
            y: 100,
            toJSON: () => ({})
        });

        trigger.click();

        expect(options.parentElement).toBe(document.body);
        expect(options.style.position).toBe('fixed');
        expect(options.style.left).toBe('240px');
        expect(options.style.width).toBe('180px');
        expect(options.style.top).toBe('138px');
        expect(options.style.display).toBe('block');
        expect(options.classList.contains('is-open')).toBe(true);
    });

    it('updates trigger text when selection changes', () => {
        document.body.innerHTML = `
            <select id="langSelect" class="styled-select">
                <option value="en">English</option>
                <option value="pt">Português (Brasil)</option>
            </select>
        `;
        const select = document.getElementById('langSelect');
        const instance = customSelect.create(select);
        select.value = 'pt';
        instance.update();
        const trigger = document.querySelector('.custom-select-trigger');
        expect(trigger.textContent).toBe('Português (Brasil)');
    });
});