const STORAGE_KEY = 'panel_layout';
const MIN_PANEL_WIDTH = 180;
const HANDLE_WIDTH = 1;
const KEYBOARD_STEP = 16;
const RESPONSIVE_QUERY = '(max-width: 980px)';

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function resolveEditorWidth(containerWidth, editorFrac, threeColumn, minPanel = MIN_PANEL_WIDTH) {
    const handleCount = threeColumn ? 2 : 1;
    const handlesWidth = handleCount * HANDLE_WIDTH;
    const available = containerWidth - handlesWidth;
    const otherMin = minPanel * (threeColumn ? 2 : 1);
    const max = Math.max(minPanel, available - otherMin);
    const fallback = threeColumn ? 1 / 3 : 0.5;
    const target = (editorFrac ?? fallback) * containerWidth;
    return Math.round(clamp(target, minPanel, max));
}

export function resolveTreeWidth(previewWidth, treeFrac, minPanel = MIN_PANEL_WIDTH) {
    const handlesWidth = HANDLE_WIDTH;
    const available = previewWidth - handlesWidth;
    const max = Math.max(minPanel, available - minPanel);
    const target = (treeFrac ?? 0.5) * previewWidth;
    return Math.round(clamp(target, minPanel, max));
}

export function createPanelResize(app) {
    let layout = { editorFrac: null, treeFrac: null };
    let activePair = null;
    let dragContext = null;
    let els = null;
    let mediaQuery = null;
    let mediaListener = null;

    function resetToDefaults({ persist = false } = {}) {
        layout = { editorFrac: null, treeFrac: null };
        if (!persist) {
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (err) {
                console.warn('Failed to clear panel layout:', err);
            }
        }
        clearInlineSizes();
        applyLayout();
    }

    function loadLayout() {
        const sessionMode = localStorage.getItem('session_mode') || 'restore';
        if (sessionMode === 'clean') {
            layout = { editorFrac: null, treeFrac: null };
            return;
        }
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) { return; }
            const parsed = JSON.parse(raw);
            if (typeof parsed.editorFrac === 'number' && parsed.editorFrac > 0 && parsed.editorFrac < 1) {
                layout.editorFrac = parsed.editorFrac;
            }
            if (typeof parsed.treeFrac === 'number' && parsed.treeFrac > 0 && parsed.treeFrac < 1) {
                layout.treeFrac = parsed.treeFrac;
            }
        } catch {
            layout = { editorFrac: null, treeFrac: null };
        }
    }

    function saveLayout() {
        const sessionMode = localStorage.getItem('session_mode') || 'restore';
        if (sessionMode === 'clean') {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
        } catch (err) {
            console.warn('Failed to persist panel layout:', err);
        }
    }

    function isResponsiveStack() {
        return mediaQuery?.matches ?? false;
    }

    function isThreeColumn() {
        return Boolean(els?.filePreviewPanel?.classList.contains('show'));
    }

    function clearInlineSizes() {
        if (!els) { return; }
        els.editorShell.style.flex = '';
        els.editorShell.style.width = '';
        els.treeView.style.flex = '';
        els.treeView.style.width = '';
        if (els.filePreviewPanel) {
            els.filePreviewPanel.style.flex = '';
            els.filePreviewPanel.style.width = '';
        }
    }

    function applyLayout() {
        if (!els?.container) { return; }

        if (isResponsiveStack()) {
            clearInlineSizes();
            if (els.treeFileHandle) {
                els.treeFileHandle.hidden = true;
            }
            return;
        }

        const containerWidth = els.container.clientWidth;
        if (containerWidth <= 0) { return; }

        const threeColumn = isThreeColumn();
        const editorWidth = resolveEditorWidth(containerWidth, layout.editorFrac, threeColumn);

        layout.editorFrac = editorWidth / containerWidth;
        els.editorShell.style.flex = `0 0 ${editorWidth}px`;
        els.editorShell.style.width = `${editorWidth}px`;

        if (threeColumn) {
            const previewWidth = containerWidth - editorWidth - (2 * HANDLE_WIDTH);
            const treeWidth = resolveTreeWidth(previewWidth, layout.treeFrac);
            layout.treeFrac = previewWidth > 0 ? treeWidth / previewWidth : 0.5;

            els.treeView.style.flex = `0 0 ${treeWidth}px`;
            els.treeView.style.width = `${treeWidth}px`;
            els.filePreviewPanel.style.flex = '1 1 0';
            els.filePreviewPanel.style.width = '';
            if (els.treeFileHandle) {
                els.treeFileHandle.hidden = false;
            }
        } else {
            els.treeView.style.flex = '1 1 0';
            els.treeView.style.width = '';
            if (els.treeFileHandle) {
                els.treeFileHandle.hidden = true;
            }
        }
    }

    function ariaLabel(pair) {
        const key = pair === 'editor-tree'
            ? 'panel_resize_editor_tree'
            : 'panel_resize_tree_file';
        return app.i18n?.t(key) || 'Resize panels';
    }

    function refreshHandleLabels() {
        if (!els) { return; }
        if (els.editorTreeHandle) {
            els.editorTreeHandle.setAttribute('aria-label', ariaLabel('editor-tree'));
        }
        if (els.treeFileHandle) {
            els.treeFileHandle.setAttribute('aria-label', ariaLabel('tree-file'));
        }
    }

    function setResizing(active) {
        document.body.classList.toggle('is-panel-resizing', active);
        els?.editorTreeHandle?.classList.toggle('is-active', active && activePair === 'editor-tree');
        els?.treeFileHandle?.classList.toggle('is-active', active && activePair === 'tree-file');
    }

    function finishDrag() {
        if (!activePair) { return; }
        setResizing(false);
        saveLayout();
        activePair = null;
        dragContext = null;
    }

    function updateFromPointer(clientX) {
        if (!dragContext || !els?.container) { return; }

        if (activePair === 'editor-tree') {
            const rect = dragContext.containerRect;
            const threeColumn = isThreeColumn();
            const otherMin = MIN_PANEL_WIDTH * (threeColumn ? 2 : 1);
            const max = rect.width - otherMin - (threeColumn ? 2 : 1) * HANDLE_WIDTH;
            const nextWidth = clamp(clientX - rect.left, MIN_PANEL_WIDTH, max);
            layout.editorFrac = nextWidth / rect.width;
            applyLayout();
            return;
        }

        if (activePair === 'tree-file') {
            const rect = dragContext.previewRect;
            const max = rect.width - MIN_PANEL_WIDTH - HANDLE_WIDTH;
            const nextWidth = clamp(clientX - rect.left, MIN_PANEL_WIDTH, max);
            layout.treeFrac = rect.width > 0 ? nextWidth / rect.width : 0.5;
            applyLayout();
        }
    }

    function startDrag(pair, clientX) {
        if (isResponsiveStack() || !els?.container) { return; }
        if (pair === 'tree-file' && !isThreeColumn()) { return; }

        activePair = pair;
        dragContext = {
            containerRect: els.container.getBoundingClientRect(),
            previewRect: els.previewArea.getBoundingClientRect()
        };
        setResizing(true);
        updateFromPointer(clientX);
    }

    function nudge(pair, delta) {
        if (isResponsiveStack() || !els?.container) { return; }

        const containerWidth = els.container.clientWidth;
        if (containerWidth <= 0) { return; }

        if (pair === 'editor-tree') {
            const current = resolveEditorWidth(containerWidth, layout.editorFrac, isThreeColumn());
            const threeColumn = isThreeColumn();
            const otherMin = MIN_PANEL_WIDTH * (threeColumn ? 2 : 1);
            const max = containerWidth - otherMin - (threeColumn ? 2 : 1) * HANDLE_WIDTH;
            const next = clamp(current + delta, MIN_PANEL_WIDTH, max);
            layout.editorFrac = next / containerWidth;
            applyLayout();
            saveLayout();
            return;
        }

        if (pair === 'tree-file' && isThreeColumn()) {
            const editorWidth = resolveEditorWidth(containerWidth, layout.editorFrac, true);
            const previewWidth = containerWidth - editorWidth - (2 * HANDLE_WIDTH);
            const current = resolveTreeWidth(previewWidth, layout.treeFrac);
            const max = previewWidth - MIN_PANEL_WIDTH - HANDLE_WIDTH;
            const next = clamp(current + delta, MIN_PANEL_WIDTH, max);
            layout.treeFrac = previewWidth > 0 ? next / previewWidth : 0.5;
            applyLayout();
            saveLayout();
        }
    }

    function bindHandle(handle, pair) {
        if (!handle) { return; }

        handle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) { return; }
            e.preventDefault();
            handle.setPointerCapture(e.pointerId);
            startDrag(pair, e.clientX);
        });

        handle.addEventListener('pointermove', (e) => {
            if (!activePair || activePair !== pair) { return; }
            e.preventDefault();
            updateFromPointer(e.clientX);
        });

        handle.addEventListener('pointerup', (e) => {
            if (!activePair || activePair !== pair) { return; }
            if (handle.hasPointerCapture(e.pointerId)) {
                handle.releasePointerCapture(e.pointerId);
            }
            finishDrag();
        });

        handle.addEventListener('pointercancel', () => {
            if (activePair === pair) {
                finishDrag();
            }
        });

        handle.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') { return; }
            e.preventDefault();
            const delta = e.key === 'ArrowLeft' ? -KEYBOARD_STEP : KEYBOARD_STEP;
            nudge(pair, delta);
        });
    }

    function bindElements() {
        els = {
            container: document.getElementById('editorLayout') || document.querySelector('.container'),
            editorShell: document.querySelector('.editor-shell'),
            previewArea: document.querySelector('.preview-area'),
            treeView: document.getElementById('treeView'),
            filePreviewPanel: document.getElementById('filePreviewPanel'),
            editorTreeHandle: document.getElementById('editorTreeResize'),
            treeFileHandle: document.getElementById('treeFileResize')
        };
    }

    function init() {
        bindElements();
        loadLayout();
        refreshHandleLabels();

        mediaQuery = window.matchMedia(RESPONSIVE_QUERY);
        mediaListener = () => applyLayout();
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', mediaListener);
        } else {
            mediaQuery.addListener(mediaListener);
        }

        bindHandle(els.editorTreeHandle, 'editor-tree');
        bindHandle(els.treeFileHandle, 'tree-file');

        if (typeof ResizeObserver !== 'undefined' && els.container) {
            const ro = new ResizeObserver(() => applyLayout());
            ro.observe(els.container);
        } else {
            window.addEventListener('resize', applyLayout);
        }

        applyLayout();
    }

    return {
        init,
        applyLayout,
        refreshHandleLabels,
        resetToDefaults,
        nudge,
        get layout() { return { ...layout }; }
    };
}