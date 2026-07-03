import { readFile } from 'node:fs/promises';

const WORKFLOW_PATH = '.github/workflows/release-finalize.yml';

describe('release finalize workflow commits', () => {
    it('creates changelog doc commits through GitHub API and requires a verified commit', async () => {
        const workflow = await readFile(WORKFLOW_PATH, 'utf8');

        expect(workflow).toContain('createCommitOnBranch');
        expect(workflow).toContain('commit.verification');
        expect(workflow).toContain('GitHub did not mark changelog commit');
        expect(workflow).not.toContain('git commit --signoff');
        expect(workflow).not.toContain('git commit -m "docs: updated localized changelogs for $tag"');
        expect(workflow).not.toContain('git push origin "HEAD:$branch"');
    });
});