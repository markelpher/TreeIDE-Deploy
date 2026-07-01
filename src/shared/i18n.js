import en from './locales/en.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };

export const SUPPORTED_LOCALES = ['en', 'pt'];
export const DEFAULT_LOCALE = 'en';

export const translations = { en, pt };

export function isSupportedLocale(lang) {
    return SUPPORTED_LOCALES.includes(lang);
}

const TEXT_NODE = 3;

/** Elements filled at runtime — never overwrite with static i18n strings. */
const DYNAMIC_I18N_SKIP_IDS = new Set([
    'fileName',
    'aboutVersion',
    'settingsCurrentVersion',
    'settingsLastChecked',
    'releaseUpdateCurrent',
    'releaseUpdateLatest',
    'templateFileName'
]);

function updateDocumentI18n(i18n) {
    if (typeof document === 'undefined' || !document.querySelectorAll) { return; }

    const currentLang = i18n.getCurrentLang();
    document.documentElement.lang = currentLang === 'pt' ? 'pt-br' : 'en';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
        if (DYNAMIC_I18N_SKIP_IDS.has(el.id)) { return; }
        const key = el.getAttribute('data-i18n');
        const translated = i18n.t(key);
        const shortcut = el.querySelector('.shortcut');
        if (shortcut) {
            const textNode = Array.from(el.childNodes).find((n) => n.nodeType === TEXT_NODE);
            if (textNode) {
                textNode.textContent = `${translated} `;
            } else {
                el.insertBefore(document.createTextNode(`${translated} `), el.firstChild);
            }
        } else {
            el.textContent = translated;
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = i18n.t(key);
    });

    if (typeof window !== 'undefined' && window.lucide) {
        window.lucide.createIcons();
    }
}

function detectLang() {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('language');
        if (isSupportedLocale(stored)) { return stored; }
    }
    if (typeof navigator !== 'undefined' && navigator.language?.split('-')[0] === 'pt') {
        return 'pt';
    }
    return DEFAULT_LOCALE;
}

export function createI18n(initialLang) {
    let currentLang = isSupportedLocale(initialLang) ? initialLang : detectLang();
    let onLanguageChange = null;

    function hasKey(key) {
        if (typeof key !== 'string' || !key) { return false; }
        return !!(translations[currentLang]?.[key] || translations[DEFAULT_LOCALE]?.[key]);
    }

    function t(key) {
        return translations[currentLang]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;
    }

    function setLanguage(lang, options = {}) {
        if (!isSupportedLocale(lang)) { return; }
        currentLang = lang;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('language', lang);
        }
        if (!options.skipUiUpdate && onLanguageChange) {
            onLanguageChange();
        }
    }

    function getCurrentLang() {
        return currentLang;
    }

    function setOnLanguageChange(fn) {
        onLanguageChange = fn;
    }

    function updateUI() {
        updateDocumentI18n({ t, getCurrentLang });
    }

    return {
        t,
        hasKey,
        setLanguage,
        getCurrentLang,
        updateUI,
        setOnLanguageChange,
        get lang() { return currentLang; }
    };
}

export function mainT(lang, key) {
    return translations[lang]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;
}
