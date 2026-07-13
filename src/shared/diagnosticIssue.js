const REPOSITORY_ISSUES_URL = 'https://github.com/markelpher/treeide-deploy/issues/new';

function normalizeIssueDetails(input) {
    if (typeof input === 'string') {
        return { label: 'bug', title: '', description: input.trim(), steps: '', expected: '' };
    }
    return {
        label: String(input?.label || 'bug').trim().slice(0, 50),
        title: String(input?.title || '').trim().slice(0, 80),
        description: String(input?.description || '').trim(),
        steps: String(input?.steps || '').trim(),
        expected: String(input?.expected || '').trim(),
    };
}

export function buildDiagnosticIssueDraft(input, t) {
    const details = normalizeIssueDetails(input);
    const body = [
        `## ${t('diagnostic_issue_description')}`,
        '',
        details.description || t('diagnostic_issue_description_empty'),
        '',
        `## ${t('diagnostic_issue_steps')}`,
        '',
        details.steps || '1. ',
        '',
        `## ${t('diagnostic_issue_expected')}`,
        '',
        details.expected || t('diagnostic_issue_expected_placeholder'),
        '',
        `## ${t('diagnostic_issue_package')}`,
        '',
        t('diagnostic_issue_package_instructions'),
    ].join('\n');
    return {
        label: details.label,
        title: `[${details.label}] ${details.title}`,
        body,
    };
}

export function buildDiagnosticIssueUrl(details, t) {
    const draft = buildDiagnosticIssueDraft(details, t);
    const params = [
        ['title', draft.title],
        ['body', draft.body],
        ['labels', draft.label],
    ].map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
    return `${REPOSITORY_ISSUES_URL}?${params}`;
}
