export function createShortcuts(app) {

const SHORTCUTS_KEY = 'custom_shortcuts';

    // Default shortcuts configuration
    const defaultShortcuts = {
        // File operations
        new_project: { key: 'n', ctrl: true, shift: false, alt: false, label: 'new', category: 'file' },
        open_project: { key: 'o', ctrl: true, shift: false, alt: false, label: 'open', category: 'file' },
        save_project: { key: 's', ctrl: true, shift: false, alt: false, label: 'save', category: 'file' },
        save_as: { key: 's', ctrl: true, shift: true, alt: false, label: 'save_as', category: 'file' },
        save_all: { key: 's', ctrl: true, shift: false, alt: true, label: 'save_all', category: 'file' },
        build: { key: 'b', ctrl: true, shift: false, alt: false, label: 'build', category: 'file' },

        // Edit operations
        undo: { key: 'z', ctrl: true, shift: false, alt: false, label: 'undo', category: 'edit' },
        redo: { key: 'y', ctrl: true, shift: false, alt: false, label: 'redo', category: 'edit' },
        indent: { key: 'Tab', ctrl: false, shift: false, alt: false, label: 'indent', category: 'edit' },
        outdent: { key: 'Tab', ctrl: false, shift: true, alt: false, label: 'outdent', category: 'edit' },

        // View operations
        fullscreen: { key: 'F11', ctrl: false, shift: false, alt: false, label: 'fullscreen', category: 'view' },
        reload: { key: 'r', ctrl: true, shift: false, alt: false, label: 'reload', category: 'view' },
        zoom_in: { key: '=', ctrl: true, shift: false, alt: false, label: 'zoom_in', category: 'view' },
        zoom_out: { key: '-', ctrl: true, shift: false, alt: false, label: 'zoom_out', category: 'view' },
        zoom_reset: { key: '0', ctrl: true, shift: false, alt: false, label: 'actual_size', category: 'view' },
        command_palette: { key: 'p', ctrl: true, shift: true, alt: false, label: 'command_palette', category: 'view' },

        // Tab operations
        new_tab: { key: 't', ctrl: true, shift: false, alt: false, label: 'new_tab', category: 'tab' },
        next_tab: { key: 'Tab', ctrl: true, shift: false, alt: false, label: 'next_tab', category: 'tab' },
        prev_tab: { key: 'Tab', ctrl: true, shift: true, alt: false, label: 'prev_tab', category: 'tab' },
        close_tab: { key: 'w', ctrl: true, shift: false, alt: false, label: 'close_tab', category: 'tab' },
        close_file_tab: { key: 'w', ctrl: true, shift: true, alt: false, label: 'close_file_tab', category: 'tab' },
        close_window: { key: 'q', ctrl: true, shift: false, alt: false, label: 'close_window', category: 'tab' }
    };

    let customShortcuts = {};
    let capturingAction = null;
    // Cached reverse-lookup map (key signature -> action). Rebuilt only when
    // shortcuts change — the keyboard handler is called on every keypress, so
    // rebuilding the map inline caused needless GC pressure.
    let keyMapCache = null;

    // Load custom shortcuts from localStorage
    function loadCustomShortcuts() {
        try {
            const saved = localStorage.getItem(SHORTCUTS_KEY);
            if (saved) {
                customShortcuts = JSON.parse(saved);
            }
        } catch (e) {
            customShortcuts = {};
        }
        keyMapCache = null;
    }

    // Save custom shortcuts to localStorage
    function saveCustomShortcuts() {
        try {
            localStorage.setItem(SHORTCUTS_KEY, JSON.stringify(customShortcuts));
        } catch (e) {
            console.warn('Failed to save custom shortcuts');
        }
        keyMapCache = null;
    }

    // Get the shortcut for an action
    function getShortcut(action) {
        return customShortcuts[action] || defaultShortcuts[action] || null;
    }

    // Format shortcut as string for display
    function formatShortcut(shortcut) {
        if (!shortcut) {return '';}
        const parts = [];
        if (shortcut.ctrl) {parts.push('Ctrl');}
        if (shortcut.shift) {parts.push('Shift');}
        if (shortcut.alt) {parts.push('Alt');}
        parts.push(shortcut.key);
        return parts.join('+');
    }

    const escapeHtml = app.helpers.escapeHtml;

    function formatShortcutBadges(shortcut) {
        if (!shortcut) {return '';}
        const modifiers = [];
        if (shortcut.ctrl) {modifiers.push('Ctrl');}
        if (shortcut.shift) {modifiers.push('Shift');}
        if (shortcut.alt) {modifiers.push('Alt');}
        const modHtml = modifiers.map(m => `<kbd class="shortcut-key-badge modifier">${m}</kbd>`).join('<span class="shortcut-key-separator">+</span>');
        const keyHtml = `<kbd class="shortcut-key-badge">${escapeHtml(shortcut.key)}</kbd>`;
        return modifiers.length > 0 ? `${modHtml}<span class="shortcut-key-separator">+</span>${keyHtml}` : keyHtml;
    }

    // Check if a keyboard event matches a shortcut
    function matchesShortcut(e, shortcut) {
        if (!shortcut) {return false;}
        return (
            e.ctrlKey === shortcut.ctrl &&
            e.shiftKey === shortcut.shift &&
            e.altKey === shortcut.alt &&
            e.key.toLowerCase() === shortcut.key.toLowerCase()
        );
    }

    // Build a reverse-lookup map from the resolved shortcut of every action
    // (defaults overridden by any custom binding) to the action name. This
    // avoids the previous bug where iterating `defaultShortcuts` in declaration
    // order could match the original action for a key that the user had
    // remapped to a different action.
    function buildKeyMap() {
        const map = new Map();
        for (const action of Object.keys(defaultShortcuts)) {
            const shortcut = getShortcut(action);
            if (!shortcut) {continue;}
            const sig = `${shortcut.ctrl ? 1 : 0}|${shortcut.shift ? 1 : 0}|${shortcut.alt ? 1 : 0}|${shortcut.key.toLowerCase()}`;
            map.set(sig, action);
        }
        return map;
    }

    function getKeyMap() {
        if (keyMapCache) {return keyMapCache;}
        keyMapCache = buildKeyMap();
        return keyMapCache;
    }

    // Get the action that matches a keyboard event
    function getActionForEvent(e) {
        const map = getKeyMap();
        const sig = `${e.ctrlKey ? 1 : 0}|${e.shiftKey ? 1 : 0}|${e.altKey ? 1 : 0}|${(e.key || '').toLowerCase()}`;
        if (map.has(sig)) {return map.get(sig);}
        return null;
    }

    // Start capturing a new shortcut
    function startCapture(action, buttonEl) {
        capturingAction = action;
        if (buttonEl) {
            const shortcut = getShortcut(action);
            const hintText = app.i18n ? app.i18n.t('shortcut_capture_hint') : 'Press a key…';
            buttonEl.innerHTML = `${formatShortcutBadges(shortcut)}<span class="shortcut-key-hint">${hintText}</span>`;
            buttonEl.classList.add('capturing');
        }
    }

    // Stop capturing
    function stopCapture(buttonEl, applied) {
        if (buttonEl && !applied) {
            const shortcut = getShortcut(capturingAction);
            buttonEl.innerHTML = formatShortcutBadges(shortcut);
            buttonEl.classList.remove('capturing');
        }
        capturingAction = null;
    }

    // Handle keydown during capture
    function handleCaptureKeydown(e) {
        if (!capturingAction) {return false;}

        e.preventDefault();
        e.stopPropagation();

        // Don't allow Escape as a shortcut
        if (e.key === 'Escape') {
            const btn = document.querySelector('.shortcut-key.capturing');
            stopCapture(btn, false);
            return true;
        }

        // Don't allow bare modifier keys (wait for actual key)
        if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
            return true;
        }

        // Function keys are OK without modifiers
        const isFunctionKey = e.key.startsWith('F') && e.key.length <= 3;
        // Require at least one modifier for non-function keys
        if (!e.ctrlKey && !e.shiftKey && !e.altKey && !isFunctionKey) {
            const btn = document.querySelector('.shortcut-key.capturing');
            const hint = app.i18n ? app.i18n.t('shortcut_hint_modifier') : 'Use Ctrl/Shift/Alt';
            if (btn) {
                const shortcut = getShortcut(capturingAction);
                btn.innerHTML = `${formatShortcutBadges(shortcut)}<span class="shortcut-key-hint">${hint}</span>`;
            }
            return true;
        }

        const newShortcut = {
            key: e.key,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey
        };

        // Check for conflicts and resolve
        const conflicts = [];
        const conflictLabels = [];
        Object.entries(defaultShortcuts).forEach(([action, def]) => {
            if (action === capturingAction) {return;}
            const existing = getShortcut(action);
            if (existing.ctrl === newShortcut.ctrl &&
                existing.shift === newShortcut.shift &&
                existing.alt === newShortcut.alt &&
                existing.key.toLowerCase() === newShortcut.key.toLowerCase()) {
                conflicts.push(action);
                const labelKey = def.label || action;
                conflictLabels.push(app.i18n ? app.i18n.t(labelKey) : labelKey);
            }
        });

        // Resolve conflicts by resetting conflicting shortcuts to defaults
        conflicts.forEach(action => {
            customShortcuts[action] = { ...defaultShortcuts[action] };
        });

        customShortcuts[capturingAction] = newShortcut;
        saveCustomShortcuts();

        capturingAction = null;

        // Re-render the table to show the resolved state
        renderShortcutsTable(conflicts);

        // Notify the user about resolved conflicts
        if (conflicts.length > 0 && app.toast && app.toast.showToast) {
            const template = app.i18n
                ? app.i18n.t('shortcut_conflict_resolved')
                : 'Reset {count} shortcut(s) to default: {names}';
            const message = template
                .replace('{count}', conflicts.length)
                .replace('{names}', conflictLabels.join(', '));
            app.toast.showToast(message, 4000);
        }

        return true;
    }

    // Render the shortcuts table in settings
    function renderShortcutsTable(flashActions = []) {
        const tbody = document.getElementById('shortcutsTableBody');
        if (!tbody) {return;}

        const categoryLabels = {
            file: 'File',
            edit: 'Edit',
            view: 'View',
            tab: 'Tab'
        };

        const categoryI18n = {
            file: 'file',
            edit: 'edit',
            view: 'view',
            tab: 'tab_category'
        };

        // Group actions by category
        const categories = {};
        Object.entries(defaultShortcuts).forEach(([action, def]) => {
            const cat = def.category || 'other';
            if (!categories[cat]) {categories[cat] = [];}
            categories[cat].push(action);
        });

        const flashSet = new Set(flashActions);

        let html = '';
        Object.entries(categories).forEach(([cat, actions]) => {
            const catLabel = app.i18n ? app.i18n.t(categoryI18n[cat] || cat) : categoryLabels[cat] || cat;
            html += `<tr class="shortcut-category-row"><td colspan="2" class="shortcut-category" data-i18n="${categoryI18n[cat] || cat}">${catLabel}</td></tr>`;
            actions.forEach(action => {
                const shortcut = getShortcut(action);
                const labelKey = shortcut.label || action;
                const badges = formatShortcutBadges(shortcut);
                const rowClass = flashSet.has(action) ? 'shortcut-row conflict-flash' : 'shortcut-row';
                html += `<tr class="${rowClass}">
                    <td data-i18n="${labelKey}">${app.i18n ? app.i18n.t(labelKey) : labelKey}</td>
                    <td><button class="shortcut-key" data-action="${action}">${badges}</button></td>
                </tr>`;
            });
        });

        tbody.innerHTML = html;

        // Add click handlers for capture
        tbody.querySelectorAll('.shortcut-key').forEach(btn => {
            btn.addEventListener('click', () => {
                // Stop any existing capture
                const existing = document.querySelector('.shortcut-key.capturing');
                if (existing) {
                    existing.innerHTML = formatShortcutBadges(getShortcut(existing.dataset.action));
                    existing.classList.remove('capturing');
                }
                startCapture(btn.dataset.action, btn);
            });
        });

        // Refresh i18n
        if (app.i18n && app.i18n.updateUI) {
            app.i18n.updateUI();
        }
    }

    // Restore default shortcuts
    function restoreDefaults() {
        customShortcuts = {};
        saveCustomShortcuts();
        renderShortcutsTable();
    }

    // Initialize
    loadCustomShortcuts();

    // Export
    return {
        defaultShortcuts,
        getShortcut,
        formatShortcut,
        matchesShortcut,
        getActionForEvent,
        handleCaptureKeydown,
        renderShortcutsTable,
        restoreDefaults,
        get isCapturing() { return !!capturingAction; }
    };

}
