import {
    buildDiagnosticReport,
    extractCurrentSessionLog,
    formatCurrentSessionLog,
    formatDiagnosticTimestamp,
    normalizeRendererDiagnostics,
    readFileTail,
    sanitizeDiagnosticText,
} from '../src/main/diagnostics.js';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

describe('privacy-safe diagnostics', () => {
    it('redacts local paths, email addresses, IPs and URL secrets', () => {
        const input = [
            'at C:\\Users\\Alice Smith\\Projects\\secret\\app.js:10:2',
            'contact alice@example.com from 192.168.1.12',
            'https://example.test/api?token=super-secret&mode=test',
        ].join('\n');
        const sanitized = sanitizeDiagnosticText(input);

        expect(sanitized).not.toContain('Alice Smith');
        expect(sanitized).not.toContain('secret\\app.js');
        expect(sanitized).not.toContain('alice@example.com');
        expect(sanitized).not.toContain('192.168.1.12');
        expect(sanitized).not.toContain('super-secret');
        expect(sanitized).toContain('<local-path>');
        expect(sanitized).toContain('<email>');
        expect(sanitized).toContain('<ip-address>');
    });

    it('keeps only an allowlisted renderer snapshot', () => {
        const snapshot = normalizeRendererDiagnostics({
            language: 'pt',
            theme: 'dark',
            updateChannel: 'beta',
            openProjectCount: 3,
            unsavedProjectCount: 1,
            projectName: 'private-project',
            projectContents: 'API_KEY=secret',
        });

        expect(snapshot).toMatchObject({
            language: 'pt',
            theme: 'dark',
            updateChannel: 'beta',
            openProjectCount: 3,
            unsavedProjectCount: 1,
        });
        expect(snapshot).not.toHaveProperty('projectName');
        expect(snapshot).not.toHaveProperty('projectContents');
    });

    it('documents that reports are local and excludes project data', () => {
        const report = buildDiagnosticReport({
            appVersion: '2.0.104',
            isPackaged: true,
            versions: { electron: '42', chrome: '142', node: '24' },
            system: { platform: 'win32', release: '11', arch: 'x64', memoryGiB: 16 },
            renderer: { openProjectCount: 2 },
            description: 'The action failed',
            issueDetails: {
                label: 'bug',
                title: 'Export failed',
                description: 'The action failed',
                steps: '1. Export from C:\\Users\\Alice\\private',
                expected: 'A ZIP should be created',
            },
            includesLog: true,
            includesScreenshot: false,
        });

        expect(report.privacy).toMatchObject({
            automaticUpload: false,
            issueDraftTextPrefilled: true,
            projectNamesIncluded: false,
            projectContentsIncluded: false,
            includesScreenshot: false,
        });
        expect(report.session).not.toHaveProperty('projectName');
        expect(report.session).not.toHaveProperty('projectContents');
        expect(report.userReport.title).toBe('Export failed');
        expect(report.userReport.label).toBe('bug');
        expect(report.userReport.steps).not.toContain('Alice');
    });

    it('reads only the requested tail of an app log', () => {
        const dir = mkdtempSync(path.join(os.tmpdir(), 'treeide-diagnostics-'));
        const logPath = path.join(dir, 'main.log');
        try {
            writeFileSync(logPath, '0123456789', 'utf8');
            expect(readFileTail(logPath, 4).toString('utf8')).toBe('6789');
        } finally {
            rmSync(dir, { recursive: true, force: true });
        }
    });

    it('extracts only the latest app execution from a shared log file', () => {
        const log = [
            '10:00 [session] first',
            '10:01 old execution error',
            '11:00 [session] second',
            '11:01 current execution error',
        ].join('\n');

        const current = extractCurrentSessionLog(log, '[session]');

        expect(current).toContain('second');
        expect(current).toContain('current execution error');
        expect(current).not.toContain('first');
        expect(current).not.toContain('old execution error');
    });

    it('formats the log into main-process and renderer sections', () => {
        const formatted = formatCurrentSessionLog({
            mainLog: 'main failure',
            rendererErrors: ['renderer failure'],
            generatedAt: '2026-07-13T00:00:00.000Z',
            locale: 'pt',
        });

        expect(formatted).toContain('Scope: current app execution only');
        expect(formatted).toContain('--- Main process log ---');
        expect(formatted).toContain('main failure');
        expect(formatted).toContain('--- Renderer errors ---');
        expect(formatted).toContain('renderer failure');
    });

    it('formats the generated time with a localized day period', () => {
        const formatted = formatDiagnosticTimestamp('2026-07-13T17:00:00.000Z', 'pt');

        expect(formatted).toMatch(/(tarde|noite|PM)/i);
        expect(formatted).not.toContain('T17:00:00.000Z');
    });
});
