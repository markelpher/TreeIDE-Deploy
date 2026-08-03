const MAX_VISIBLE_TOASTS = 4;
const DEFAULT_DURATION_MS = 3200;
const EXIT_ANIMATION_MS = 220;

/** @type {Map<string, { el: HTMLElement, timer: ReturnType<typeof setTimeout> | null }>} */
const activeToasts = new Map();

export function createToast(app) {

    function resolveToastText(message) {
        const resolve = app.helpers?.resolveUserMessage;
        const raw = resolve ? resolve(message) : String(message ?? '').trim();
        if (!raw) { return ''; }

        if (app.i18n?.hasKey?.(raw)) {
            return app.i18n.t(raw);
        }

        return raw;
    }

    function formatDisplayText(text) {
        const display = text.replace(/\s+/g, ' ').trim();
        return display.length > 180 ? `${display.slice(0, 177)}...` : display;
    }

    function getToastStack() {
        const stack = document.getElementById('toastStack');
        if (stack) { return stack; }

        const legacy = document.getElementById('toast');
        if (!legacy) { return null; }

        legacy.id = 'toastStack';
        legacy.classList.add('toast-stack');
        legacy.textContent = '';
        return legacy;
    }

    function removeToast(key, entry) {
        if (entry.timer) {
            clearTimeout(entry.timer);
            entry.timer = null;
        }
        activeToasts.delete(key);

        if (!entry.el.isConnected) { return; }

        entry.el.classList.add('toast-item-leaving');
        window.setTimeout(() => {
            entry.el.remove();
        }, EXIT_ANIMATION_MS);
    }

    function scheduleRemoval(key, entry, duration) {
        if (entry.timer) { clearTimeout(entry.timer); }
        entry.timer = setTimeout(() => {
            removeToast(key, entry);
        }, duration);
    }

    function trimOldestToasts(stack) {
        // Newest is first (top); oldest sits at the end and is dropped first.
        while (stack.children.length > MAX_VISIBLE_TOASTS) {
            const oldest = stack.lastElementChild;
            if (!oldest) { break; }

            const key = oldest.dataset.toastKey;
            const entry = key ? activeToasts.get(key) : null;
            if (entry) {
                removeToast(key, entry);
            } else {
                oldest.remove();
            }
        }
    }

    function showToast(message, duration = DEFAULT_DURATION_MS) {
        const stack = getToastStack();
        if (!stack) { return; }

        const text = resolveToastText(message);
        if (!text) { return; }

        const display = formatDisplayText(text);
        const visibleDuration = Math.max(duration, DEFAULT_DURATION_MS);
        const existing = activeToasts.get(display);

        if (existing?.el.isConnected) {
            // Same message is the most recent again — keep it on top.
            stack.insertBefore(existing.el, stack.firstChild);
            scheduleRemoval(display, existing, visibleDuration);
            return;
        }

        if (existing) {
            activeToasts.delete(display);
        }

        const item = document.createElement('div');
        item.className = 'toast-item';
        item.dataset.toastKey = display;
        item.textContent = display;
        stack.insertBefore(item, stack.firstChild);

        const entry = { el: item, timer: null };
        activeToasts.set(display, entry);
        scheduleRemoval(display, entry, visibleDuration);
        trimOldestToasts(stack);
    }

    return { showToast, resolveToastText };

}