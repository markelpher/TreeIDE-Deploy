/**
 * @vitest-environment happy-dom
 */

import { createCommandPalette } from '../src/renderer/modules/command-palette.js';

function createPaletteApp() {
    return {
        i18n: { t: (key) => ({
            new: 'New',
            open: 'Open',
            save: 'Save',
            save_as: 'Save As',
            save_all: 'Save All',
            undo: 'Undo',
            redo: 'Redo',
            new_tab: 'New Tab',
            next_tab: 'Next Tab',
            prev_tab: 'Previous Tab',
            close_tab: 'Close Tab',
            close_file_tab: 'Close File Tab',
            build: 'Build',
            templates: 'Templates',
            settings: 'Settings',
            reload: 'Reload',
            zoom_in: 'Zoom In',
            zoom_out: 'Zoom Out',
            actual_size: 'Actual Size',
            fullscreen: 'Full Screen',
            check_updates: 'Check for updates',
            about: 'About Tree IDE',
            report_problem: 'Report a problem',
            command_palette_results: '{count} commands found.',
            untitled: 'Untitled'
        })[key] || key },
        helpers: { escapeHtml: (value) => String(value) },
        icons: { refreshIcons: vi.fn() },
        shortcuts: {
            getShortcut: vi.fn(() => null),
            formatShortcut: vi.fn(() => '')
        },
        tabs: {
            activeProjectTabId: 'tab-1',
            projectTabs: [
                { id: 'tab-1', isModified: true, activeFileTabPath: 'README.md' },
                { id: 'tab-2', isModified: false, activeFileTabPath: null }
            ],
            createTab: vi.fn(),
            switchToTab: vi.fn(),
            closeTab: vi.fn(),
            closeFileTab: vi.fn(),
            getActiveTab() { return this.projectTabs.find((tab) => tab.id === this.activeProjectTabId); }
        },
        fileops: { handleLoadUnified: vi.fn(), saveProject: vi.fn() },
        templates: { openTemplatesModal: vi.fn() }
    };
}

describe('command palette', () => {
    let app;
    let palette;

    beforeEach(() => {
        document.body.innerHTML = `
            <button id="createBtn"></button>
            <button id="menu-settings"></button>
            <button id="menu-fullscreen"></button>
            <button id="menu-report-problem"></button>
            <button id="menu-save-all"></button>
            <button id="menu-undo"></button>
            <button id="menu-redo"></button>
            <button id="menu-reload"></button>
            <button id="menu-zoom-in"></button>
            <button id="menu-zoom-out"></button>
            <button id="menu-zoom-reset"></button>
            <button id="checkUpdateBtn"></button>
            <button id="menu-credits"></button>
            <div id="commandPaletteModal" class="modal">
                <input id="commandPaletteInput">
                <div id="commandPaletteList"></div>
                <p id="commandPaletteEmpty" class="hidden"></p>
                <p id="commandPaletteStatus"></p>
            </div>
        `;
        app = createPaletteApp();
        palette = createCommandPalette(app);
        palette.init();
    });

    it('filters commands and executes the selected result', () => {
        palette.open();
        const input = document.getElementById('commandPaletteInput');
        expect(document.querySelectorAll('.command-palette-option')).toHaveLength(23);
        expect(document.activeElement).toBe(input);
        expect(input.getAttribute('aria-expanded')).toBe('true');
        expect(input.getAttribute('aria-activedescendant')).toBe('commandPaletteOption0');
        expect(document.querySelector('[data-command-index="0"] i')?.dataset.lucide).toBe('folder-plus');
        expect(document.querySelector('[data-command-index="5"] i')?.dataset.lucide).toBe('rotate-ccw');
        expect(document.querySelector('[data-command-index="6"] i')?.dataset.lucide).toBe('rotate-cw');
        expect(document.querySelector('[data-command-index="11"] i')?.dataset.lucide).toBe('square-x');
        expect(document.querySelector('[data-command-index="15"] i')?.dataset.lucide).toBe('refresh-ccw');
        expect(document.querySelector('[data-command-index="16"] i')?.dataset.lucide).toBe('zoom-in');
        expect(document.querySelector('[data-command-index="17"] i')?.dataset.lucide).toBe('zoom-out');
        expect(document.querySelector('[data-command-index="19"] i')?.dataset.lucide).toBe('expand');
        expect(document.querySelector('[data-command-index="21"] i')?.dataset.lucide).toBe('info');
        expect(document.getElementById('commandPaletteStatus').textContent).toBe('23 commands found.');

        input.value = 'templates';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(document.querySelectorAll('.command-palette-option')).toHaveLength(1);
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

        expect(app.templates.openTemplatesModal).toHaveBeenCalledOnce();
        expect(document.getElementById('commandPaletteModal').style.display).toBe('none');
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('supports keyboard navigation and closes with Escape', () => {
        palette.open();
        const input = document.getElementById('commandPaletteInput');
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(document.querySelector('[aria-selected="true"]')?.dataset.commandIndex).toBe('1');

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(document.getElementById('commandPaletteModal').style.display).toBe('none');
    });

    it('executes project and file tab commands', () => {
        palette.open();
        const input = document.getElementById('commandPaletteInput');

        input.value = 'next tab';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(app.tabs.switchToTab).toHaveBeenCalledWith('tab-2');

        palette.open();
        input.value = 'close file tab';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(app.tabs.closeFileTab).toHaveBeenCalledWith('README.md');
    });

    it('disables contextual commands when only one project tab is available', () => {
        app.tabs.projectTabs = [{ id: 'tab-1', isModified: false, activeFileTabPath: null }];
        palette.open();
        const input = document.getElementById('commandPaletteInput');

        input.value = 'next tab';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        expect(document.querySelector('.command-palette-option')?.disabled).toBe(true);
        expect(document.querySelector('.command-palette-option')?.getAttribute('aria-disabled')).toBe('true');
    });
});
