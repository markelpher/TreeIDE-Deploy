export function createStorage(app) {

const AUTOSAVE_KEY = 'autosave_file_contents';

    function getFileContents() {
        return (app.state && app.state.fileContents) || {};
    }

    function setFileContents(contents) {
        if (app.state) {app.state.fileContents = contents;}
    }

    function persistFileContents() {
        try {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(getFileContents()));
        } catch (err) {
            console.warn('Failed to persist file contents:', err);
            if (app.toast && typeof app.toast.showToast === 'function') {
                app.toast.showToast(app.i18n.t('storage_error'));
            }
        }
        queueIndexedDbWrite();
    }

    let _pendingDbWrite = null;

    function queueIndexedDbWrite() {
        if (!app.dbStorage) {return;}
        if (_pendingDbWrite) {return;}
        _pendingDbWrite = Promise.resolve().then(() => {
            const data = JSON.stringify(getFileContents());
            return app.dbStorage.set(AUTOSAVE_KEY, data);
        }).then(() => {
            _pendingDbWrite = null;
        }).catch((err) => {
            _pendingDbWrite = null;
            console.warn('IndexedDB write failed:', err);
        });
    }

    async function flushPendingWrites() {
        if (_pendingDbWrite) {
            try { await _pendingDbWrite; } catch { /* already logged */ }
        }
    }

    async function persistFileContentsSync() {
        persistFileContents();
        await flushPendingWrites();
    }

    function loadSavedFileContents() {
        try {
            setFileContents(JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || '{}'));
        } catch {
            setFileContents({});
        }
    }

    async function loadSavedFileContentsAsync() {
        // Fallback: if localStorage was empty, try IndexedDB
        if (Object.keys(getFileContents()).length > 0) {return;}
        if (!app.dbStorage) {return;}
        try {
            const raw = await app.dbStorage.get(AUTOSAVE_KEY);
            if (raw) {
                setFileContents(JSON.parse(raw));
            }
        } catch (err) {
            console.warn('IndexedDB fallback read failed:', err);
        }
    }

    return {
        persistFileContents,
        persistFileContentsSync,
        flushPendingWrites,
        loadSavedFileContents,
        loadSavedFileContentsAsync,
        get AUTOSAVE_KEY() { return AUTOSAVE_KEY; }
    };

}
