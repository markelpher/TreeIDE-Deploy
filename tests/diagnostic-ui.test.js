import { readFileSync } from 'node:fs';

describe('diagnostic report UI', () => {
    const html = readFileSync(new URL('../src/renderer/index.html', import.meta.url), 'utf8');
    const modalsSource = readFileSync(new URL('../src/renderer/modules/modals.js', import.meta.url), 'utf8');
    const shellSource = readFileSync(new URL('../src/renderer/modules/shell.js', import.meta.url), 'utf8');
    const modalStyles = readFileSync(new URL('../src/renderer/css/modals.css', import.meta.url), 'utf8');

    it('offers a privacy-first report action with screenshot opt-in', () => {
        expect(html).toContain('id="menu-report-problem"');
        expect(html).toContain('id="diagnosticReportModal"');
        expect(html).toContain('id="diagnosticIncludeLog" type="checkbox" checked');
        expect(html).toContain('id="diagnosticIncludeScreenshot" type="checkbox"');
        expect(html).not.toContain('id="diagnosticIncludeScreenshot" type="checkbox" checked');
        expect(html).toContain('id="diagnosticRedirectPopup"');
        expect(html).toContain('id="diagnosticRedirectPopup" class="diagnostic-redirect-popup" role="button" tabindex="0"');
        expect(html).toContain('data-i18n="diagnostic_redirect_message"');
        expect(html).not.toContain('class="diagnostic-redirect-icon"');
        expect(html).toContain('id="diagnosticDescriptionCount"');
        expect(html).toContain('id="diagnosticIssueTitle"');
        expect(html).toContain('id="diagnosticIssueLabel"');
        expect(html).toContain('class="styled-select diagnostic-title-label"');
        expect(html).toContain('id="diagnosticSteps"');
        expect(html).toContain('id="diagnosticExpected"');
        expect(html).toContain('aria-describedby="diagnosticDescriptionHint diagnosticDescriptionCount"');
        expect(html).not.toContain('data-lucide="shield-check"');
        expect(shellSource).toContain('getDiagnosticIssueDetails');
        expect(shellSource).toContain('getRepositoryLabels');
        expect(shellSource).toContain('selectedOptions[0]?.textContent');
        expect(shellSource).toContain('diagnostic-label-custom-select-options');
        expect(shellSource).toContain('resetDiagnosticReport');
        expect(shellSource).toContain("popup.addEventListener('click', dismissPopup)");
        expect(shellSource).toContain('setTimeout(finish, OPEN_ISSUE_DELAY_MS)');
        expect(shellSource).toContain('discardDiagnosticReport');
        expect(shellSource).toContain("customSelect?.style.removeProperty('width')");
        expect(shellSource).toContain('diagnosticFields.forEach(updateDiagnosticField)');
        expect(modalStyles).toMatch(/\.diagnostic-description\s*\{[^}]*resize:\s*none/s);
        expect(modalStyles).toMatch(/\.diagnostic-title-label\s*\{[^}]*box-sizing:\s*content-box/s);
        expect(modalStyles).toContain('.diagnostic-label-custom-select-options');
    });

    it('only dismisses a modal when the pointer gesture starts on its backdrop', () => {
        expect(modalsSource).toContain("window.addEventListener('pointerdown'");
        expect(modalsSource).toContain('const clickedModalBackdrop = e.target === pressedModalBackdrop');
        expect(modalsSource).toContain("clickedModalBackdrop && e.target.id === 'diagnosticReportModal'");
    });
});
