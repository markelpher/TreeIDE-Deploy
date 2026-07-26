import { describe, expect, it, vi } from 'vitest';
import { createWindowVisibilityController } from '../src/main/window.js';

function createFakeWindow() {
    return {
        isDestroyed: vi.fn(() => false),
        isMinimized: vi.fn(() => false),
        restore: vi.fn(),
        maximize: vi.fn(),
        show: vi.fn(),
        focus: vi.fn()
    };
}

describe('startup window visibility', () => {
    it('keeps the window hidden until Electron and the renderer are ready', () => {
        const win = createFakeWindow();
        const controller = createWindowVisibilityController(win, { fallbackDelayMs: 0 });

        controller.markNativeReady();

        expect(win.show).not.toHaveBeenCalled();
        controller.markRendererReady();
        expect(win.maximize).toHaveBeenCalledOnce();
        expect(win.show).toHaveBeenCalledOnce();
        expect(win.focus).toHaveBeenCalledOnce();
    });

    it('also waits when the renderer becomes ready before Electron', () => {
        const win = createFakeWindow();
        const controller = createWindowVisibilityController(win, { fallbackDelayMs: 0 });

        controller.markRendererReady();
        expect(win.show).not.toHaveBeenCalled();
        controller.markNativeReady();
        expect(win.show).toHaveBeenCalledOnce();
    });

    it('queues a request to reopen the app during first-run initialization', () => {
        const win = createFakeWindow();
        const controller = createWindowVisibilityController(win, { fallbackDelayMs: 0 });

        controller.requestReveal();
        controller.markNativeReady();
        expect(win.show).not.toHaveBeenCalled();
        controller.markRendererReady();
        expect(win.show).toHaveBeenCalledOnce();
    });

    it('restores a minimized initialized window without maximizing it again', () => {
        const win = createFakeWindow();
        const controller = createWindowVisibilityController(win, { fallbackDelayMs: 0 });
        controller.markNativeReady();
        controller.markRendererReady();
        win.isMinimized.mockReturnValue(true);
        win.maximize.mockClear();
        win.show.mockClear();
        win.focus.mockClear();

        controller.requestReveal();

        expect(win.restore).toHaveBeenCalledOnce();
        expect(win.maximize).not.toHaveBeenCalled();
        expect(win.show).toHaveBeenCalledOnce();
        expect(win.focus).toHaveBeenCalledOnce();
    });
});
