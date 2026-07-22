/**
 * @vitest-environment happy-dom
 */

import { readFileSync } from 'node:fs';
import { createI18n } from '../src/shared/i18n.js';

describe('accessible UI', () => {
    const html = readFileSync('src/renderer/index.html', 'utf8');

    it('uses listbox, combobox, live-region and favorite semantics', () => {
        expect(html).toMatch(/<input[^>]*id="commandPaletteInput"[^>]*type="text"[^>]*role="combobox"/);
        expect(html).toMatch(/<p[^>]*id="commandPaletteStatus"[^>]*class="sr-only"[^>]*aria-live="polite"/);
        expect(html).toMatch(/<div[^>]*id="templatesList"[^>]*class="templates-list"[^>]*role="listbox"/);
        expect(html).toMatch(/<p[^>]*id="templatesResultsStatus"[^>]*class="sr-only"[^>]*aria-live="polite"/);
        expect(html).toContain('id="templatesTabFavorites"');
        expect(html).toContain('data-i18n-aria-label="close_templates"');
    });

    it('localizes accessible labels', () => {
        document.body.innerHTML = '<button data-i18n-aria-label="close_templates" aria-label="Close templates"></button>';
        const i18n = createI18n('pt');
        i18n.updateUI();
        expect(document.querySelector('button').getAttribute('aria-label')).toBe('Fechar modelos');
    });
});
