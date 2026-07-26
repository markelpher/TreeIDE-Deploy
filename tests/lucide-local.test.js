/**
 * @vitest-environment happy-dom
 */

import { installLucide } from '../src/renderer/modules/lucide-local.js';

describe('offline Lucide bundle', () => {
    it('renders the favorites star from the local icon map', () => {
        document.body.innerHTML = '<i data-lucide="star"></i>';
        const { createIcons } = installLucide();
        createIcons();

        const icon = document.querySelector('svg.lucide-star');
        expect(icon).toBeTruthy();
        expect(icon.querySelector('path')?.getAttribute('d')).toContain('11.525');
    });

    it('renders the Rich Presence chart icon from the local icon map', () => {
        document.body.innerHTML = '<i data-lucide="square-chart-gantt"></i>';
        const { createIcons } = installLucide();
        createIcons();

        expect(document.querySelector('svg.lucide-square-chart-gantt')).toBeTruthy();
    });

    it('renders the About info icon from the local icon map', () => {
        document.body.innerHTML = '<i data-lucide="info"></i>';
        const { createIcons } = installLucide();
        createIcons();
        expect(document.querySelector('svg.lucide-info')).toBeTruthy();
    });

    it('renders the reload icon from the local icon map', () => {
        document.body.innerHTML = '<i data-lucide="refresh-ccw"></i>';
        const { createIcons } = installLucide();
        createIcons();
        expect(document.querySelector('svg.lucide-refresh-ccw')).toBeTruthy();
    });

    it.each(['folder-plus', 'rotate-ccw', 'rotate-cw', 'square-x', 'zoom-in', 'zoom-out', 'expand'])(
        'renders the %s command icon from the local icon map',
        (iconName) => {
            document.body.innerHTML = `<i data-lucide="${iconName}"></i>`;
            const { createIcons } = installLucide();
            createIcons();
            expect(document.querySelector(`svg.lucide-${iconName}`)).toBeTruthy();
        }
    );
});
