import { Client } from '@xhayper/discord-rpc';

const RETRY_DELAY_MS = 15000;
const DEFAULT_DISCORD_APPLICATION_ID = '1526386332371390555';
const VALID_ACTIVITY_STATES = new Set([
    'editing_structure',
    'editing_code',
    'editing_text',
    'viewing_file',
    'browsing_templates',
    'customizing_template',
    'exporting_file',
    'creating_file',
    'creating_files',
    'creating_folder',
    'creating_folders',
    'creating_file_and_folder',
    'creating_files_and_folders',
    'settings',
    'idle'
]);
const VALID_LANGUAGES = new Set(['en', 'pt', 'es']);
const VALID_PRIVACY_LEVELS = new Set(['basic', 'activity', 'detailed']);
const VALID_FILE_KINDS = new Set(['code', 'text']);

const ACTIVITY_TEXT = {
    en: {
        basic: 'Using Tree IDE',
        editing_structure: 'Editing structure',
        editing_code: 'Editing code',
        editing_text: 'Editing text',
        viewing_file: 'Viewing a file',
        browsing_templates: 'Browsing templates',
        customizing_template: 'Customizing a template',
        exporting_file: 'Exporting file',
        creating_file: 'Creating file',
        creating_files: 'Creating files',
        creating_folder: 'Creating folder',
        creating_folders: 'Creating folders',
        creating_file_and_folder: 'Creating file and folder',
        creating_files_and_folders: 'Creating files and folders',
        settings: 'Configuring Tree IDE',
        idle: 'Idle',
        app: 'Tree IDE',
        button: 'View Tree IDE'
    },
    pt: {
        basic: 'Usando o Tree IDE',
        editing_structure: 'Editando estrutura',
        editing_code: 'Editando código',
        editing_text: 'Editando texto',
        viewing_file: 'Visualizando arquivo',
        browsing_templates: 'Explorando modelos',
        customizing_template: 'Personalizando modelo',
        exporting_file: 'Exportando arquivo',
        creating_file: 'Criando arquivo',
        creating_files: 'Criando arquivos',
        creating_folder: 'Criando pasta',
        creating_folders: 'Criando pastas',
        creating_file_and_folder: 'Criando arquivo e pasta',
        creating_files_and_folders: 'Criando arquivos e pastas',
        settings: 'Configurando o Tree IDE',
        idle: 'Inativo',
        app: 'Tree IDE',
        button: 'Ver o Tree IDE'
    },
    es: {
        basic: 'Usando Tree IDE',
        editing_structure: 'Editando estructura',
        editing_code: 'Editando código',
        editing_text: 'Editando texto',
        viewing_file: 'Visualizando archivo',
        browsing_templates: 'Explorando plantillas',
        customizing_template: 'Personalizando plantilla',
        exporting_file: 'Exportando archivo',
        creating_file: 'Creando archivo',
        creating_files: 'Creando archivos',
        creating_folder: 'Creando carpeta',
        creating_folders: 'Creando carpetas',
        creating_file_and_folder: 'Creando archivo y carpeta',
        creating_files_and_folders: 'Creando archivos y carpetas',
        settings: 'Configurando Tree IDE',
        idle: 'Inactivo',
        app: 'Tree IDE',
        button: 'Ver Tree IDE'
    }
};

const TREE_IDE_URL = 'https://github.com/markelpher/treeide-deploy';
const TREE_IDE_LOGO_ASSET_KEY = 'treeide';
const ACTIVITY_ICON_GROUPS = {
    editing_structure: 'structure',
    editing_code: 'editor',
    editing_text: 'text',
    viewing_file: 'editor',
    browsing_templates: 'templates',
    customizing_template: 'templates',
    exporting_file: 'build',
    creating_file: 'file',
    creating_files: 'files',
    creating_folder: 'structure',
    creating_folders: 'structure',
    creating_file_and_folder: 'build',
    creating_files_and_folders: 'build',
    settings: 'settings',
    idle: 'idle'
};

function normalizeApplicationId(value) {
    const id = String(value || '').trim();
    return /^\d{17,20}$/.test(id) ? id : '';
}

function normalizeActivity(value = {}) {
    const state = VALID_ACTIVITY_STATES.has(value.state) ? value.state : 'editing_structure';
    const language = VALID_LANGUAGES.has(value.language) ? value.language : 'en';
    const privacy = VALID_PRIVACY_LEVELS.has(value.privacy) ? value.privacy : 'activity';
    const projectName = String(value.projectName || '')
        .trim()
        .slice(0, 64);
    const fileType = String(value.fileType || '')
        .trim()
        .slice(0, 32);
    const fileKind = VALID_FILE_KINDS.has(value.fileKind) ? value.fileKind : 'code';
    return { state, language, privacy, projectName, fileType, fileKind };
}

function buildActivityPayload(activity, startedAt, options = {}) {
    const normalized = normalizeActivity(activity);
    const text = ACTIVITY_TEXT[normalized.language];
    const showsActivity = normalized.privacy !== 'basic';
    const details = showsActivity ? text[normalized.state] : text.basic;
    const detailedState = [normalized.projectName, normalized.fileType].filter(Boolean).join(' · ');
    const usesFileKindIcon = ['viewing_file', 'editing_code', 'editing_text'].includes(normalized.state);
    const iconGroup =
        showsActivity && usesFileKindIcon
            ? normalized.fileKind === 'text'
                ? 'text'
                : 'editor'
            : showsActivity
              ? ACTIVITY_ICON_GROUPS[normalized.state]
              : 'editor';
    const payload = {
        type: 0,
        details,
        state: normalized.privacy === 'detailed' && detailedState ? detailedState : text.app,
        startTimestamp: startedAt,
        largeImageKey: options.imageKey || TREE_IDE_LOGO_ASSET_KEY,
        largeImageText: text.app,
        largeImageUrl: TREE_IDE_URL,
        smallImageKey: iconGroup,
        smallImageText: details,
        buttons: [{ label: text.button, url: TREE_IDE_URL }]
    };
    return payload;
}

function createDiscordPresence({
    ClientClass = Client,
    logger = console,
    onStatus = () => {},
    retryDelay = RETRY_DELAY_MS,
    environmentApplicationId = process.env.TREEIDE_DISCORD_CLIENT_ID || DEFAULT_DISCORD_APPLICATION_ID
} = {}) {
    let client = null;
    let enabled = false;
    let imageKey = '';
    let currentActivity = normalizeActivity();
    let retryTimer = null;
    let generation = 0;
    let status = 'disabled';
    let paused = false;
    const startedAt = new Date();

    const emitStatus = (nextStatus, message = '') => {
        status = nextStatus;
        onStatus({ status, message });
    };

    const effectiveApplicationId = () => normalizeApplicationId(environmentApplicationId);

    const clearRetry = () => {
        if (retryTimer) {
            clearTimeout(retryTimer);
        }
        retryTimer = null;
    };

    const destroyClient = async ({ clearActivity = true } = {}) => {
        clearRetry();
        const activeClient = client;
        client = null;
        generation += 1;
        if (!activeClient) {
            return;
        }
        if (clearActivity && activeClient.user?.clearActivity) {
            try {
                await activeClient.user.clearActivity();
            } catch {
                // Discord may already be closed.
            }
        }
        try {
            await activeClient.destroy();
        } catch {
            // The IPC transport may already be disconnected.
        }
    };

    const publishActivity = async () => {
        if (!enabled || paused || !client?.user?.setActivity || !client.isConnected) {
            return false;
        }
        try {
            await client.user.setActivity(buildActivityPayload(currentActivity, startedAt, { imageKey }));
            return true;
        } catch (err) {
            logger.warn?.('Failed to update Discord Rich Presence:', err?.message || err);
            emitStatus('error', 'activity-update-failed');
            return false;
        }
    };

    const scheduleReconnect = (connect) => {
        if (!enabled || paused || retryTimer) {
            return;
        }
        emitStatus('disconnected');
        retryTimer = setTimeout(() => {
            retryTimer = null;
            void connect();
        }, retryDelay);
    };

    const connect = async () => {
        const applicationId = effectiveApplicationId();
        if (!enabled) {
            emitStatus('disabled');
            return;
        }
        if (paused) {
            emitStatus('paused');
            return;
        }
        if (!applicationId) {
            emitStatus('configuration-required');
            return;
        }

        clearRetry();
        await destroyClient({ clearActivity: false });
        const connectGeneration = generation;
        const nextClient = new ClientClass({
            clientId: applicationId,
            transport: { type: 'ipc' }
        });
        client = nextClient;
        emitStatus('connecting');

        nextClient.on('ready', async () => {
            if (client !== nextClient || generation !== connectGeneration) {
                return;
            }
            if (paused) {
                emitStatus('paused');
                try {
                    await nextClient.user?.clearActivity?.();
                } catch {
                    // The system may suspend before Discord answers.
                }
                return;
            }
            emitStatus('connected');
            await publishActivity();
        });
        nextClient.on('disconnected', () => {
            if (client !== nextClient || generation !== connectGeneration) {
                return;
            }
            client = null;
            scheduleReconnect(connect);
        });

        try {
            await nextClient.login();
        } catch (err) {
            if (client !== nextClient || generation !== connectGeneration) {
                return;
            }
            client = null;
            logger.info?.('Discord RPC unavailable; retry scheduled:', err?.message || err);
            try {
                await nextClient.destroy();
            } catch {
                /* already disconnected */
            }
            scheduleReconnect(connect);
        }
    };

    const configure = async (options = {}) => {
        const nextEnabled = options.enabled === true;
        const nextImageKey = String(options.imageKey || '')
            .trim()
            .slice(0, 64);
        const requiresReconnect = nextEnabled !== enabled;
        enabled = nextEnabled;
        imageKey = nextImageKey;
        currentActivity = normalizeActivity(options.activity || currentActivity);

        if (!enabled) {
            await destroyClient();
            emitStatus('disabled');
            return { status };
        }
        if (!effectiveApplicationId()) {
            await destroyClient();
            emitStatus('configuration-required');
            return { status };
        }
        if (requiresReconnect || !client) {
            void connect();
        } else {
            await publishActivity();
        }
        return { status };
    };

    const updateActivity = async (activity) => {
        currentActivity = normalizeActivity(activity);
        await publishActivity();
        return { status };
    };

    const reconnect = async () => {
        if (!enabled) {
            emitStatus('disabled');
            return { status };
        }
        if (paused) {
            emitStatus('paused');
            return { status };
        }
        clearRetry();
        await destroyClient({ clearActivity: false });
        emitStatus('connecting');
        void connect();
        return { status };
    };

    const stop = async () => {
        enabled = false;
        await destroyClient();
        emitStatus('disabled');
    };

    const pause = async () => {
        paused = true;
        clearRetry();
        if (client?.user?.clearActivity && client.isConnected) {
            try {
                await client.user.clearActivity();
            } catch {
                // Discord may close while the system is being suspended.
            }
        }
        if (enabled) {
            emitStatus('paused');
        }
    };

    const resume = async () => {
        paused = false;
        if (!enabled) {
            emitStatus('disabled');
            return;
        }
        if (client?.isConnected) {
            emitStatus('connected');
            await publishActivity();
            return;
        }
        void connect();
    };

    return {
        configure,
        reconnect,
        updateActivity,
        pause,
        resume,
        stop,
        getStatus: () => ({ status }),
        getActivity: () => ({ ...currentActivity })
    };
}

export { ACTIVITY_TEXT, DEFAULT_DISCORD_APPLICATION_ID, buildActivityPayload, createDiscordPresence, normalizeActivity, normalizeApplicationId };
