import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const MAX_DESCRIPTION_LENGTH = 5000;
const USER_REPORT_LIMITS = { label: 50, title: 80, description: 5000, steps: 3000, expected: 2000 };
const MAX_RENDERER_ERRORS = 20;
const MAX_ERROR_LENGTH = 4000;
export const DIAGNOSTIC_SESSION_MARKER = `[TreeIDE diagnostic session ${randomUUID()}]`;

function safeEnum(value, allowed, fallback) {
    return allowed.includes(value) ? value : fallback;
}

export function readFileTail(filePath, maxBytes) {
    const size = fs.statSync(filePath).size;
    const length = Math.max(0, Math.min(size, maxBytes));
    if (length === 0) { return Buffer.alloc(0); }
    const buffer = Buffer.alloc(length);
    const descriptor = fs.openSync(filePath, 'r');
    try {
        fs.readSync(descriptor, buffer, 0, length, size - length);
    } finally {
        fs.closeSync(descriptor);
    }
    return buffer;
}

export function extractCurrentSessionLog(value, marker = DIAGNOSTIC_SESSION_MARKER) {
    const text = String(value || '');
    const markerIndex = text.lastIndexOf(marker);
    if (markerIndex < 0) { return ''; }
    const lineStart = text.lastIndexOf('\n', markerIndex);
    return text.slice(lineStart < 0 ? 0 : lineStart + 1).trimEnd();
}

export function formatDiagnosticTimestamp(value, locale = 'en') {
    const date = new Date(value || Date.now());
    if (Number.isNaN(date.getTime())) { return String(value || 'unknown'); }
    const locales = { en: 'en-US', pt: 'pt-BR', es: 'es-ES' };
    try {
        return new Intl.DateTimeFormat(locales[locale] || locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            dayPeriod: 'long',
            timeZoneName: 'short',
        }).format(date);
    } catch {
        return date.toLocaleString();
    }
}

export function formatCurrentSessionLog({ mainLog, rendererErrors = [], generatedAt, locale = 'en' }) {
    const lines = [
        'Tree IDE diagnostic log',
        `Generated: ${formatDiagnosticTimestamp(generatedAt, locale)}`,
        'Scope: current app execution only',
        'Privacy: local paths, email addresses, IP addresses and URL secrets are redacted',
        '',
        '--- Main process log ---',
        mainLog || 'No main-process log lines were available for this execution.',
        '',
        '--- Renderer errors ---',
    ];
    if (rendererErrors.length) {
        rendererErrors.forEach((entry, index) => {
            lines.push(`[${index + 1}] ${entry}`, '');
        });
    } else {
        lines.push('No renderer errors were recorded for this execution.', '');
    }
    return `${lines.join('\n').trimEnd()}\n`;
}

export function sanitizeDiagnosticText(value, privatePaths = []) {
    let text = String(value || '');
    text = text
        .replace(/(?:file:\/\/\/)?[A-Z]:\\[^\r\n]*/gi, '<local-path>')
        .replace(/(^|[\s(])\/(?:Users|home|tmp|var\/folders)\/[^\r\n]*/gm, '$1<local-path>');
    for (const [index, privatePath] of privatePaths.filter(Boolean).entries()) {
        text = text.replaceAll(String(privatePath), `<private-path-${index + 1}>`);
    }
    return text
        .replace(/\b[\w.+-]+@[\w.-]+\.[A-Z]{2,}\b/gi, '<email>')
        .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '<ip-address>')
        .replace(/([?&](?:token|key|secret|password|auth)=)[^&\s]+/gi, '$1<redacted>');
}

export function normalizeRendererDiagnostics(input = {}, privatePaths = []) {
    const errors = Array.isArray(input.errors) ? input.errors : [];
    return {
        language: safeEnum(input.language, ['en', 'pt', 'es'], 'unknown'),
        theme: safeEnum(input.theme, ['light', 'dark', 'system'], 'unknown'),
        updateChannel: safeEnum(input.updateChannel, ['stable', 'beta'], 'unknown'),
        openProjectCount: Math.max(0, Math.min(100, Number(input.openProjectCount) || 0)),
        unsavedProjectCount: Math.max(0, Math.min(100, Number(input.unsavedProjectCount) || 0)),
        rendererErrorCount: Math.max(errors.length, Number(input.rendererErrorCount) || 0),
        rendererErrors: errors.slice(-MAX_RENDERER_ERRORS).map((entry) => (
            sanitizeDiagnosticText(entry, privatePaths).slice(0, MAX_ERROR_LENGTH)
        )),
    };
}

export function buildDiagnosticReport({
    appVersion,
    isPackaged,
    versions,
    system,
    renderer,
    description,
    issueDetails,
    includesLog,
    includesScreenshot,
    privatePaths = [],
}) {
    const sanitizedUserReport = Object.fromEntries(Object.entries(USER_REPORT_LIMITS).map(([key, limit]) => [
        key,
        sanitizeDiagnosticText(issueDetails?.[key] || (key === 'description' ? description : ''), privatePaths).slice(0, limit),
    ]));
    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        privacy: {
            automaticUpload: false,
            issueDraftTextPrefilled: true,
            projectNamesIncluded: false,
            projectContentsIncluded: false,
            pathsSanitized: true,
            includesLog: Boolean(includesLog),
            includesScreenshot: Boolean(includesScreenshot),
        },
        app: {
            version: String(appVersion || 'unknown'),
            packaged: Boolean(isPackaged),
            electron: String(versions?.electron || 'unknown'),
            chrome: String(versions?.chrome || 'unknown'),
            node: String(versions?.node || 'unknown'),
        },
        system: {
            platform: String(system?.platform || 'unknown'),
            release: String(system?.release || 'unknown'),
            arch: String(system?.arch || 'unknown'),
            locale: String(system?.locale || 'unknown'),
            cpuCount: Math.max(0, Number(system?.cpuCount) || 0),
            memoryGiB: Math.max(0, Number(system?.memoryGiB) || 0),
        },
        session: normalizeRendererDiagnostics(renderer, privatePaths),
        userDescription: sanitizedUserReport.description.slice(0, MAX_DESCRIPTION_LENGTH),
        userReport: sanitizedUserReport,
    };
}
