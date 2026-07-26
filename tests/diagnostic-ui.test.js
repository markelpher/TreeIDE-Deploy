import { readFileSync } from 'node:fs';

describe('diagnostic report UI', () => {
    const html = readFileSync(new URL('../src/renderer/index.html', import.meta.url), 'utf8');
    const modalsSource = readFileSync(new URL('../src/renderer/modules/modals.js', import.meta.url), 'utf8');
    const shellSource = readFileSync(new URL('../src/renderer/modules/shell.js', import.meta.url), 'utf8');
    const modalStyles = readFileSync(new URL('../src/renderer/css/modals.css', import.meta.url), 'utf8');

    it('offers a privacy-first report action with screenshot opt-in', () => {
        expect(html).toContain('id="menu-report-problem"');
        expect(html).toContain('id="diagnosticReportModal"');
        expect(html).toMatch(/<input[^>]*id="diagnosticIncludeLog"[^>]*type="checkbox"[^>]*checked/);
        expect(html).toMatch(/<input[^>]*id="diagnosticIncludeScreenshot"[^>]*type="checkbox"/);
        expect(html).not.toMatch(/<input[^>]*id="diagnosticIncludeScreenshot"[^>]*\schecked(?:\s|\/?>)/);
        expect(html).toContain('id="diagnosticRedirectPopup"');
        expect(html).toMatch(/<div[^>]*id="diagnosticRedirectPopup"[^>]*class="diagnostic-redirect-popup"[^>]*role="button"[^>]*tabindex="0"/);
        expect(html).toContain('data-i18n="diagnostic_redirect_message"');
        expect(html).not.toContain('class="diagnostic-redirect-icon"');
        expect(html).toContain('id="diagnosticDescriptionCount"');
        expect(html).toContain('id="diagnosticIssueTitle"');
        expect(html).toContain('id="diagnosticIssueLabel"');
        expect(html).toContain('class="styled-select diagnostic-title-label"');
        expect(html).toContain('Click the label to select the issue category');
        expect(html).toContain('id="diagnosticSteps"');
        expect(html).toContain('id="diagnosticExpected"');
        expect(html).toContain('id="diagnosticCaptureToolbar"');
        expect(html).toContain('id="diagnosticCaptureSelection"');
        expect(html).toContain('id="diagnosticSelectionRect"');
        expect(html).toContain('id="diagnosticCaptureRegion"');
        expect(html).toContain('id="diagnosticCaptureFull"');
        expect(html).toContain('id="diagnosticCapturePreviews"');
        expect(html).toContain('id="diagnosticCaptureHide"');
        expect(html).toContain('id="diagnosticCaptureRestore"');
        expect(html).toContain('id="diagnosticCaptureViewer"');
        expect(html).toContain('id="diagnosticCaptureViewerImage"');
        expect(html).toContain('id="diagnosticCaptureDone"');
        const captureUiMarkup = html.slice(
            html.indexOf('id="diagnosticCaptureToolbar"'),
            html.indexOf('id="welcomeModal"')
        );
        expect(captureUiMarkup).not.toContain('data-lucide=');
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
        expect(shellSource).toContain('beginDiagnosticCapture');
        expect(shellSource).toContain('captureAppScreenshot');
        expect(shellSource).toContain('getDiagnosticSelectionBounds');
        expect(shellSource).toContain('renderDiagnosticCapturePreviews');
        expect(shellSource).toContain('setDiagnosticCaptureToolbarCollapsed');
        expect(shellSource).toContain('showDiagnosticCaptureViewer');
        expect(shellSource).toContain("diagnostic-capture-preview-open");
        expect(shellSource).toContain("URL.createObjectURL(blob)");
        expect(shellSource).toContain("requestAnimationFrame(() => diagnosticCaptureRegion?.click())");
        expect(html).toContain('aria-keyshortcuts="Shift+P"');
        expect(html).toContain('<kbd>Shift+P</kbd>');
        expect(html).not.toMatch(/id="diagnosticCaptureRegion"(?:(?!<\/button>)[\s\S])*<kbd>/);
        expect(shellSource).toContain("event.code === 'KeyP'");
        expect(shellSource).toContain('event.stopImmediatePropagation()');
        expect(shellSource).not.toContain("event.code === 'KeyS'");
        expect(shellSource).toContain('payload.screenshots = screenshots');
        expect(shellSource).not.toContain("diagnosticModal.style.visibility = 'hidden'");
        expect(modalStyles).toContain('.diagnostic-capture-toolbar.is-capturing');
        expect(modalStyles).toContain('.diagnostic-capture-selection');
        expect(modalStyles).toContain('.diagnostic-capture-selection.is-dragging .diagnostic-selection-instruction');
        expect(modalStyles).toContain('.diagnostic-capture-toolbar.is-selecting');
        expect(modalStyles).toContain('.diagnostic-capture-restore.is-selecting');
        expect(modalStyles).toContain('.diagnostic-selection-rect');
        expect(modalStyles).toContain('.diagnostic-capture-preview');
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
