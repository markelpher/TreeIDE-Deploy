import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
    DEFAULT_DISCORD_APPLICATION_ID,
    buildActivityPayload,
    createDiscordPresence,
    normalizeActivity,
    normalizeApplicationId
} from '../src/main/discordPresence.js';
import { IDLE_TIMEOUT_MS, resolveBuildActivityState } from '../src/renderer/modules/discord-presence.js';
import { getBuildContentI18nKeys, resolveBuildContentKind } from '../src/renderer/modules/build-content.js';

class FakeClient {
    static instances = [];

    constructor(options) {
        this.options = options;
        this.isConnected = true;
        this.listeners = new Map();
        this.user = {
            setActivity: vi.fn(async () => ({})),
            clearActivity: vi.fn(async () => {})
        };
        this.destroy = vi.fn(async () => {});
        FakeClient.instances.push(this);
    }

    on(event, listener) {
        this.listeners.set(event, listener);
        return this;
    }

    async login() {
        await this.listeners.get('ready')?.();
    }
}

describe('Discord Rich Presence', () => {
    beforeEach(() => {
        FakeClient.instances = [];
    });

    it('ships with the official Tree IDE Discord application ID', () => {
        expect(DEFAULT_DISCORD_APPLICATION_ID).toBe('1526386332371390555');
    });

    it.each(['structure', 'editor', 'text', 'templates', 'build', 'file', 'files', 'settings', 'idle'])('ships a 512px contextual %s icon', (name) => {
        const png = readFileSync(new URL(`../assets/discord-presence/${name}.png`, import.meta.url));
        expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
        expect(png.readUInt32BE(16)).toBe(512);
        expect(png.readUInt32BE(20)).toBe(512);
    });

    it('uses a dedicated structure asset without reusing the code editor icon', () => {
        const structurePayload = buildActivityPayload(
            { state: 'editing_structure', privacy: 'activity', language: 'pt' },
            new Date('2026-01-01T00:00:00Z')
        );
        const codePayload = buildActivityPayload(
            { state: 'editing_code', fileKind: 'code', privacy: 'activity', language: 'pt' },
            new Date('2026-01-01T00:00:00Z')
        );

        expect(structurePayload.smallImageKey).toBe('structure');
        expect(codePayload.smallImageKey).toBe('editor');
    });

    it('uses the settings asset while configuring Tree IDE', () => {
        const payload = buildActivityPayload(
            {
                state: 'settings',
                language: 'pt',
                privacy: 'activity'
            },
            new Date()
        );
        expect(payload.details).toBe('Configurando o Tree IDE');
        expect(payload.smallImageKey).toBe('settings');
    });

    it('uses the dedicated idle asset after inactivity', () => {
        const payload = buildActivityPayload(
            {
                state: 'idle',
                privacy: 'activity',
                language: 'pt'
            },
            new Date('2026-01-01T00:00:00Z')
        );

        expect(payload.details).toBe('Inativo');
        expect(payload.smallImageKey).toBe('idle');
    });

    it('uses the text asset while editing a project file', () => {
        const payload = buildActivityPayload(
            {
                state: 'editing_text',
                fileKind: 'text',
                privacy: 'activity',
                language: 'pt'
            },
            new Date('2026-01-01T00:00:00Z')
        );

        expect(payload.details).toBe('Editando texto');
        expect(payload.smallImageKey).toBe('text');
    });

    it('uses a localized code state while editing source code', () => {
        const payload = buildActivityPayload(
            {
                state: 'editing_code',
                fileKind: 'code',
                privacy: 'activity',
                language: 'pt'
            },
            new Date('2026-01-01T00:00:00Z')
        );

        expect(payload.details).toBe('Editando código');
        expect(payload.smallImageKey).toBe('editor');
    });

    it.each([
        ['viewing_file', 'code', 'editor'],
        ['viewing_file', 'text', 'text'],
        ['editing_code', 'code', 'editor'],
        ['editing_text', 'text', 'text']
    ])('uses the matching %s icon for %s files', (state, fileKind, expectedIcon) => {
        const payload = buildActivityPayload({ state, fileKind, privacy: 'activity', language: 'en' }, new Date('2026-01-01T00:00:00Z'));

        expect(payload.smallImageKey).toBe(expectedIcon);
    });

    it('validates application IDs and normalizes private activity data', () => {
        expect(normalizeApplicationId(' 123456789012345678 ')).toBe('123456789012345678');
        expect(normalizeApplicationId('not-an-id')).toBe('');
        expect(normalizeActivity({ state: 'unknown', language: 'fr', projectName: '  Secret  ' })).toEqual({
            state: 'editing_structure',
            language: 'en',
            privacy: 'activity',
            projectName: 'Secret',
            fileType: '',
            fileKind: 'code'
        });
    });

    it('builds a localized activity with elapsed time, link and external logo', () => {
        const startedAt = new Date('2026-01-01T00:00:00Z');
        const payload = buildActivityPayload(
            {
                state: 'browsing_templates',
                language: 'pt',
                projectName: ''
            },
            startedAt
        );

        expect(payload).toMatchObject({
            type: 0,
            details: 'Explorando modelos',
            state: 'Tree IDE',
            startTimestamp: startedAt,
            largeImageText: 'Tree IDE'
        });
        expect(payload.largeImageKey).toBe('treeide');
        expect(payload.largeImageUrl).toContain('github.com/markelpher/treeide-deploy');
        expect(payload.smallImageKey).toBe('templates');
        expect(payload.smallImageText).toBe('Explorando modelos');
        expect(payload.buttons[0].url).toContain('github.com/markelpher/treeide-deploy');
    });

    it('connects over IPC and publishes the selected app state', async () => {
        const statuses = [];
        const presence = createDiscordPresence({
            ClientClass: FakeClient,
            onStatus: ({ status }) => statuses.push(status)
        });

        await presence.configure({
            enabled: true,
            activity: { state: 'creating_folders', language: 'es' }
        });

        await vi.waitFor(() => expect(FakeClient.instances).toHaveLength(1));
        const client = FakeClient.instances[0];
        await vi.waitFor(() => expect(client.user.setActivity).toHaveBeenCalled());
        expect(client.options).toMatchObject({
            clientId: DEFAULT_DISCORD_APPLICATION_ID,
            transport: { type: 'ipc' }
        });
        expect(client.user.setActivity.mock.calls.at(-1)[0]).toMatchObject({
            details: 'Creando carpetas',
            state: 'Tree IDE'
        });
        expect(statuses).toContain('connected');
    });

    it('does not expose a project name unless the renderer explicitly supplies it', () => {
        const privatePayload = buildActivityPayload(
            {
                state: 'viewing_file',
                language: 'en',
                privacy: 'activity',
                projectName: 'Hidden Project',
                fileType: 'JavaScript'
            },
            new Date()
        );
        const sharedPayload = buildActivityPayload(
            {
                state: 'viewing_file',
                language: 'en',
                privacy: 'detailed',
                projectName: 'My Project',
                fileType: 'JavaScript'
            },
            new Date()
        );

        expect(privatePayload.state).toBe('Tree IDE');
        expect(sharedPayload.state).toBe('My Project · JavaScript');
    });

    it('supports basic privacy and every Build Studio output state', () => {
        const basic = buildActivityPayload(
            {
                state: 'exporting_file',
                language: 'en',
                privacy: 'basic',
                projectName: 'Hidden'
            },
            new Date()
        );
        expect(basic.details).toBe('Using Tree IDE');
        expect(basic.state).toBe('Tree IDE');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 1, folders: 0 })).toBe('creating_file');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 2, folders: 0 })).toBe('creating_files');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 0, folders: 1 })).toBe('creating_folder');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 0, folders: 2 })).toBe('creating_folders');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 1, folders: 1 })).toBe('creating_file_and_folder');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: false, files: 2, folders: 2 })).toBe('creating_files_and_folders');
        expect(resolveBuildActivityState({ outputMode: 'structure', alsoExportZip: true })).toBe('exporting_file');
        expect(resolveBuildActivityState({ outputMode: 'zip', alsoExportZip: false })).toBe('exporting_file');
        expect(resolveBuildActivityState({ outputMode: 'tree', alsoExportZip: false })).toBe('exporting_file');
        expect(IDLE_TIMEOUT_MS).toBe(300000);
    });

    it.each([
        ['creating_file', 'Criando arquivo', 'file'],
        ['creating_files', 'Criando arquivos', 'files'],
        ['creating_folder', 'Criando pasta', 'structure'],
        ['creating_folders', 'Criando pastas', 'structure'],
        ['creating_file_and_folder', 'Criando arquivo e pasta', 'build'],
        ['creating_files_and_folders', 'Criando arquivos e pastas', 'build']
    ])('uses the localized build state %s and its contextual icon', (state, details, icon) => {
        const payload = buildActivityPayload({ state, privacy: 'activity', language: 'pt' }, new Date());
        expect(payload.details).toBe(details);
        expect(payload.smallImageKey).toBe(icon);
    });

    it.each([
        [{ files: 1, folders: 0 }, 'file'],
        [{ files: 3, folders: 0 }, 'files'],
        [{ files: 0, folders: 1 }, 'folder'],
        [{ files: 0, folders: 3 }, 'folders'],
        [{ files: 1, folders: 1 }, 'file_and_folder'],
        [{ files: 2, folders: 1 }, 'files_and_folders']
    ])('shares the build content classification for %j', (counts, kind) => {
        expect(resolveBuildContentKind(counts)).toBe(kind);
        expect(getBuildContentI18nKeys(counts)).toEqual({
            kind,
            title: `build_output_${kind}`,
            description: `build_output_${kind}_desc`
        });
    });

    it('uses one generic localized state for every file export', () => {
        const payload = buildActivityPayload(
            { state: 'exporting_file', privacy: 'activity', language: 'pt' },
            new Date('2026-01-01T00:00:00Z')
        );

        expect(payload.details).toBe('Exportando arquivo');
        expect(payload.smallImageKey).toBe('build');
        expect(payload.details).not.toMatch(/zip|senha|criptograf|\.tree/i);
    });

    it('clears the activity and disconnects when disabled', async () => {
        const presence = createDiscordPresence({
            ClientClass: FakeClient
        });
        await presence.configure({
            enabled: true
        });
        await vi.waitFor(() => expect(FakeClient.instances).toHaveLength(1));
        const client = FakeClient.instances[0];

        await presence.configure({ enabled: false });

        expect(client.user.clearActivity).toHaveBeenCalledOnce();
        expect(client.destroy).toHaveBeenCalledOnce();
        expect(presence.getStatus()).toEqual({ status: 'disabled' });
    });

    it('clears activity while paused and restores it on resume', async () => {
        const statuses = [];
        const presence = createDiscordPresence({
            ClientClass: FakeClient,
            onStatus: ({ status }) => statuses.push(status)
        });
        await presence.configure({ enabled: true });
        await vi.waitFor(() => expect(FakeClient.instances).toHaveLength(1));
        const client = FakeClient.instances[0];
        await vi.waitFor(() => expect(client.user.setActivity).toHaveBeenCalled());

        await presence.pause();
        expect(client.user.clearActivity).toHaveBeenCalledOnce();
        expect(presence.getStatus()).toEqual({ status: 'paused' });

        await presence.resume();
        expect(client.user.setActivity).toHaveBeenCalledTimes(2);
        expect(statuses.at(-1)).toBe('connected');
    });

    it('recreates the RPC client when manually reconnecting', async () => {
        const statuses = [];
        const presence = createDiscordPresence({
            ClientClass: FakeClient,
            onStatus: ({ status }) => statuses.push(status)
        });
        await presence.configure({ enabled: true });
        await vi.waitFor(() => expect(FakeClient.instances).toHaveLength(1));
        const firstClient = FakeClient.instances[0];

        const result = await presence.reconnect();

        expect(result).toEqual({ status: 'connecting' });
        expect(firstClient.destroy).toHaveBeenCalledOnce();
        await vi.waitFor(() => expect(FakeClient.instances).toHaveLength(2));
        await vi.waitFor(() => expect(statuses.at(-1)).toBe('connected'));
    });

    it('reports a missing configuration without creating a client', async () => {
        const presence = createDiscordPresence({
            ClientClass: FakeClient,
            environmentApplicationId: ''
        });
        const result = await presence.configure({ enabled: true });

        expect(result).toEqual({ status: 'configuration-required' });
        expect(FakeClient.instances).toHaveLength(0);
    });
});
