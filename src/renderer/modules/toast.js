export function createToast(app) {

let toastTimer = null;

    function resolveToastText(message) {
        const resolve = app.helpers?.resolveUserMessage;
        const raw = resolve ? resolve(message) : String(message ?? '').trim();
        if (!raw) {return '';}

        if (app.i18n?.hasKey?.(raw)) {
            return app.i18n.t(raw);
        }

        return raw;
    }

    function showToast(message, duration = 2000) {
        const toast = document.getElementById('toast');
        if (!toast) {return;}

        const text = resolveToastText(message);
        if (!text) {return;}

        if (toastTimer) {clearTimeout(toastTimer);}
        const display = text.replace(/\s+/g, ' ').trim();
        toast.textContent = display.length > 180 ? `${display.slice(0, 177)}...` : display;
        toast.style.display = 'block';
        toastTimer = setTimeout(() => {
            toast.style.display = 'none';
            toastTimer = null;
        }, duration);
    }

    return { showToast, resolveToastText };

}
