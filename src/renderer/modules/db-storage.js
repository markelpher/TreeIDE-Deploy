export function createDbStorage(_app) {

const DB_NAME = 'TreeIDE';
    const DB_VERSION = 1;
    const STORE_NAME = 'keyval';
    const STORAGE_VERSION_KEY = 'treeide_storage_version';
    const CURRENT_STORAGE_VERSION = 1;

    let db = null;

    function openDB() {
        return new Promise((resolve, reject) => {
            if (db) { return resolve(db); }
            const timeout = setTimeout(() => {
                reject(new Error('IndexedDB open timeout'));
            }, 5000);
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const database = e.target.result;
                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME);
                }
            };
            request.onsuccess = (e) => {
                clearTimeout(timeout);
                db = e.target.result;
                resolve(db);
            };
            request.onerror = (e) => {
                clearTimeout(timeout);
                reject(e.target.error);
            };
            request.onblocked = () => {
                clearTimeout(timeout);
                reject(new Error('IndexedDB blocked'));
            };
        });
    }

    async function get(key) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function set(key, value) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function remove(key) {
        const database = await openDB();
        return new Promise((resolve, reject) => {
            const tx = database.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async function migrateFromLocalStorage() {
        const version = parseInt(localStorage.getItem(STORAGE_VERSION_KEY) || '0', 10);
        if (version >= CURRENT_STORAGE_VERSION) {return;}

        const keysToMigrate = [
            'autosave_file_contents',
            'autosave_tabs',
            'custom_templates'
        ];

        for (const key of keysToMigrate) {
            const value = localStorage.getItem(key);
            if (value !== null) {
                try {
                    await set(key, value);
                } catch (err) {
                    console.warn('IndexedDB migration failed for ' + key + ':', err);
                }
            }
        }

        localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
    }

    return {
        openDB,
        get,
        set,
        remove,
        migrateFromLocalStorage
    };

}
