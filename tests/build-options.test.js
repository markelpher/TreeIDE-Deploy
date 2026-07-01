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

    it('enables tree encryption when saving tree only', () => {
        const options = readBuildOptions(makeEls({ outputMode: BUILD_OUTPUT_MODES.TREE }));
        expect(options.treeEncryptEnabled).toBe(true);
    });

    it('enables tree encryption when including tree in zip-only export', () => {
        const options = readBuildOptions(makeEls({
            outputMode: BUILD_OUTPUT_MODES.ZIP,
            includeTreeInZip: true
        }));
        expect(options.treeEncryptEnabled).toBe(true);
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