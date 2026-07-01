/**
 * @vitest-environment happy-dom
 */

import { clamp, createPanelResize, resolveEditorWidth, resolveTreeWidth } from '../src/renderer/modules/panel-resize.js';

describe('panel resize layout', () => {
    it('clamps values inside bounds', () => {
        expect(clamp(10, 0, 5)).toBe(5);
        expect(clamp(-1, 0, 5)).toBe(0);
        expect(clamp(3, 0, 5)).toBe(3);
    });

    it('resolves equal two-column editor width', () => {
        expect(resolveEditorWidth(1000, null, false)).toBe(500);
    });

    it('resolves equal three-column editor width', () => {
        expect(resolveEditorWidth(900, null, true)).toBe(300);
    });

    it('respects minimum panel width', () => {
        expect(resolveEditorWidth(300, 0.1, false)).toBe(180);
    });

    it('resolves tree width inside preview area', () => {
        expect(resolveTreeWidth(600, null)).toBe(300);
    });
});

describe('panel layout session behavior', () => {
    const storage = new Map();

    beforeEach(() => {
        storage.clear();
        globalThis.localStorage = {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => storage.set(key, value),
            removeItem: (key) => storage.delete(key)
        };
    });

    it('does not load saved layout in clean session mode', () => {
        storage.set('session_mode', 'clean');
        storage.set('panel_layout', JSON.stringify({ editorFrac: 0.7, treeFrac: 0.4 }));

        const app = {
            i18n: { t: (key) => key },
            state: { filePreviewPanel: { classList: { contains: () => false } } }
        };
        document.body.innerHTML = `
            <div id="editorLayout" class="container" style="width:1000px;height:400px;display:flex;">
                <div class="editor-shell" style="flex:1"></div>
                <div id="editorTreeResize"></div>
                <div class="preview-area" style="flex:1;display:flex;">
                    <div id="treeView" style="flex:1"></div>
                    <div id="treeFileResize" hidden></div>
                    <aside id="filePreviewPanel"></aside>
                </div>
            </div>
        `;

        const panelResize = createPanelResize(app);
        panelResize.init();

        expect(panelResize.layout.editorFrac).toBeNull();
        expect(panelResize.layout.treeFrac).toBeNull();
    });
});