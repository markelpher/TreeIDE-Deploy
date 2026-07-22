import {
    BUILD_OUTPUT_MODES,
    getBuildInspectionFlags,
    readBuildOptions,
    syncBuildOptionsUi,
    validateBuildPasswords
} from '../src/renderer/modules/build-options.js';

function makeEls(overrides = {}) {
    const values = {
        outputMode: BUILD_OUTPUT_MODES.STRUCTURE,
        alsoExportZip: false,
        includeTreeInZip: false,
        protectTreeWithPassword: false,
        zipPassword: '',
        zipPasswordConfirm: '',
        treePassword: '',
        treePasswordConfirm: '',
        ...overrides
    };

    const radio = (name, checked) => ({ checked, name });
    return {
        outputModeStructure: radio('output', values.outputMode === BUILD_OUTPUT_MODES.STRUCTURE),
        outputModeZip: radio('output', values.outputMode === BUILD_OUTPUT_MODES.ZIP),
        outputModeTree: radio('output', values.outputMode === BUILD_OUTPUT_MODES.TREE),
        alsoExportZip: { checked: values.alsoExportZip },
        includeTreeInZip: { checked: values.includeTreeInZip },
        protectTreeWithPassword: { checked: values.protectTreeWithPassword },
        zipPassword: { value: values.zipPassword },
        zipPasswordConfirm: { value: values.zipPasswordConfirm },
        treePassword: { value: values.treePassword },
        treePasswordConfirm: { value: values.treePasswordConfirm }
    };
}

describe('build options', () => {
    it('enables zip extras in zip-only output mode', () => {
        const options = readBuildOptions(makeEls({ outputMode: BUILD_OUTPUT_MODES.ZIP }));
        expect(options.outputMode).toBe(BUILD_OUTPUT_MODES.ZIP);
        expect(options.zipEnabled).toBe(true);
        expect(options.treeEncryptEnabled).toBe(false);
    });

    it('enables zip extras when also exporting zip from structure mode', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.STRUCTURE,
            alsoExportZip: true
        }));
        expect(options.zipEnabled).toBe(true);
    });

    it('enables optional tree protection when saving tree only', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.TREE,
            protectTreeWithPassword: true,
            treePassword: 'secret',
            treePasswordConfirm: 'secret'
        }));
        expect(options.treeProtectionAvailable).toBe(true);
        expect(options.treeEncryptEnabled).toBe(true);
    });

    it('enables optional tree protection when including tree in zip-only export', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.ZIP,
            includeTreeInZip: true,
            protectTreeWithPassword: true,
            treePassword: 'secret',
            treePasswordConfirm: 'secret'
        }));
        expect(options.treeEncryptEnabled).toBe(true);
    });

    it('requires a confirmed password when tree protection is selected', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.TREE,
            protectTreeWithPassword: true
        }));
        expect(validateBuildPasswords(options, (key) => key)).toBe('build_password_required');
    });

    it('keeps tree output plaintext when protection is not selected', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.TREE,
            treePassword: 'ignored',
            treePasswordConfirm: 'ignored'
        }));
        expect(options.treeProtectionAvailable).toBe(true);
        expect(options.treeEncryptEnabled).toBe(false);
        expect(options.treePassword).toBe('');
    });

    it('keeps password fields visible but only enables them when protection is selected', () => {
        const els = makeEls({
            outputMode: BUILD_OUTPUT_MODES.TREE,
            protectTreeWithPassword: true,
            treePassword: 'secret',
            treePasswordConfirm: 'secret'
        });
        els.treeExtras = { classList: { toggle: vi.fn() } };
        els.protectTreeWithPasswordLabel = { classList: { toggle: vi.fn() } };
        els.treePasswordFields = { classList: { toggle: vi.fn() } };
        els.treePasswordWarning = { hidden: true };

        syncBuildOptionsUi(els, { t: (key) => key });

        expect(els.treePasswordFields.classList.toggle).toHaveBeenLastCalledWith('is-disabled', false);
        expect(els.treePasswordWarning.hidden).toBe(false);
        expect(els.treePassword.disabled).toBe(false);
        expect(els.treePasswordConfirm.disabled).toBe(false);

        els.protectTreeWithPassword.checked = false;
        syncBuildOptionsUi(els, { t: (key) => key });

        expect(els.treePasswordFields.classList.toggle).toHaveBeenLastCalledWith('is-disabled', true);
        expect(els.treePasswordWarning.hidden).toBe(true);
        expect(els.treePassword.value).toBe('');
        expect(els.treePasswordConfirm.value).toBe('');
    });

    it('inspects structure, tree and zip based on selected output', () => {
        expect(getBuildInspectionFlags(readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.STRUCTURE,
            alsoExportZip: true,
            includeTreeInZip: true
        })))).toEqual({
            checkStructure: true,
            checkTree: true,
            checkZip: true
        });

        expect(getBuildInspectionFlags(readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.ZIP
        })))).toEqual({
            checkStructure: true,
            checkTree: false,
            checkZip: true
        });

        expect(getBuildInspectionFlags(readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.TREE
        })))).toEqual({
            checkStructure: true,
            checkTree: true,
            checkZip: false
        });
    });

    it.each([
        [{ files: 1, folders: 0 }, 'build_output_file + ZIP'],
        [{ files: 2, folders: 0 }, 'build_output_files + ZIP'],
        [{ files: 0, folders: 1 }, 'build_output_folder + ZIP'],
        [{ files: 0, folders: 2 }, 'build_output_folders + ZIP'],
        [{ files: 1, folders: 1 }, 'build_output_file_and_folder + ZIP'],
        [{ files: 2, folders: 2 }, 'build_output_files_and_folders + ZIP']
    ])('uses the detected content in the create-with-zip action for %o', (contentCounts, expected) => {
        const els = makeEls({
            outputMode: BUILD_OUTPUT_MODES.STRUCTURE,
            alsoExportZip: true
        });
        els.createBtn = { textContent: '' };

        syncBuildOptionsUi(els, { t: (key) => key, contentCounts });

        expect(els.createBtn.textContent).toBe(expected);
    });

    it('reports password mismatch for zip export', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.ZIP,
            zipPassword: 'abc',
            zipPasswordConfirm: 'xyz'
        }));
        const error = validateBuildPasswords(options, (key) => key);
        expect(error).toBe('build_password_mismatch');
    });

    it('disables also-export-zip when structure mode is locked', () => {
        const els = makeEls({
            outputMode: BUILD_OUTPUT_MODES.STRUCTURE,
            alsoExportZip: true
        });
        els.alsoExportZipLabel = { classList: { toggle: vi.fn() } };
        els.alsoExportZip.disabled = false;

        syncBuildOptionsUi(els, { t: (key) => key, optionsLocked: true });

        expect(els.alsoExportZip.checked).toBe(false);
        expect(els.alsoExportZip.disabled).toBe(true);
        expect(els.alsoExportZipLabel.classList.toggle).toHaveBeenCalledWith('is-disabled', true);
    });

});
