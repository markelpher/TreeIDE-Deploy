import { buildDiagnosticIssueDraft, buildDiagnosticIssueUrl } from '../src/shared/diagnosticIssue.js';

const pt = {
    diagnostic_issue_title_prefix: '[Bug] ',
    diagnostic_issue_description: 'Descrição do problema',
    diagnostic_issue_description_empty: 'Descreva o problema aqui.',
    diagnostic_issue_steps: 'Passos para reproduzir',
    diagnostic_issue_expected: 'Comportamento esperado',
    diagnostic_issue_expected_placeholder: 'Descreva o que você esperava que acontecesse.',
    diagnostic_issue_package: 'Pacote de diagnóstico',
    diagnostic_issue_package_instructions: 'Anexe o ZIP gerado. Nenhum dado foi enviado automaticamente.',
};
const t = (key) => pt[key] || key;

describe('localized diagnostic issue', () => {
    it('builds the title and body in the user language', () => {
        const draft = buildDiagnosticIssueDraft({
            label: 'enhancement',
            title: 'Falha ao exportar',
            description: 'O arquivo não foi criado.',
            steps: '1. Abrir o projeto\n2. Exportar',
            expected: 'O arquivo deveria ser criado.',
        }, t);

        expect(draft.title).toBe('[enhancement] Falha ao exportar');
        expect(draft.label).toBe('enhancement');
        expect(draft.body).toContain('## Descrição do problema');
        expect(draft.body).toContain('O arquivo não foi criado.');
        expect(draft.body).toContain('## Passos para reproduzir');
        expect(draft.body).toContain('2. Exportar');
        expect(draft.body).toContain('## Comportamento esperado');
        expect(draft.body).toContain('O arquivo deveria ser criado.');
        expect(draft.body).toContain('Nenhum dado foi enviado automaticamente');
    });

    it('encodes the localized draft in the GitHub issue URL', () => {
        const url = new URL(buildDiagnosticIssueUrl({ label: 'help wanted', title: 'Erro de teste', description: 'Detalhes' }, t));

        expect(url.hostname).toBe('github.com');
        expect(url.pathname).toBe('/markelpher/treeide-deploy/issues/new');
        expect(url.searchParams.get('title')).toBe('[help wanted] Erro de teste');
        expect(url.searchParams.get('labels')).toBe('help wanted');
        expect(url.searchParams.get('body')).toContain('Descrição do problema');
    });
});
