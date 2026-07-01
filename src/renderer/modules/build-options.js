/**
 * Build output options for the studio UI.
 */

export const BUILD_OUTPUT_MODES = {
    STRUCTURE: 'structure',
    ZIP: 'zip',
    TREE: 'tree'
};

/** @param {'buildStudio'} prefix */
export function getBuildOptionsElements(prefix) {
    return {
        outputModeStructure: document.getElementById(`${prefix}OutputModeStructure`),
        outputModeZip: document.getElementById(`${prefix}OutputModeZip`),
        outputModeTree: document.getElementById(`${prefix}OutputModeTree`),
        structureSection: document.getElementById(`${prefix}StructureSection`),
        zipExtras: document.getElementById(`${prefix}ZipExtras`),
        treeExtras: document.getElementById(`${prefix}TreeExtras`),
        alsoExportZip: document.getElementById(`${prefix}AlsoExportZip`),
        alsoExportZipLabel: document.getElementById(`${prefix}AlsoExportZipLabel`),
        includeTreeInZip: document.getElementById(`${prefix}IncludeTreeInZip`),
        includeTreeInZipLabel: document.getElementById(`${prefix}IncludeTreeInZipLabel`),
        zipPassword: document.getElementById(`${prefix}ZipPassword`),
        zipPasswordConfirm: document.getElementById(`${prefix}ZipPasswordConfirm`),
        treePassword: document.getElementById(`${prefix}TreePassword`),
        treePasswordConfirm: document.getElementById(`${prefix}TreePasswordConfirm`),
        createBtn: document.getElementById('buildStudioCreate')
    };
}

/** @param {ReturnType<typeof getBuildOptionsElements>} els */
export function getSelectedOutputMode(els) {
    if (els.outputModeZip?.checked) { return BUILD_OUTPUT_MODES.ZIP; }
    if (els.outputModeTree?.checked) { return BUILD_OUTPUT_MODES.TREE; }
    return BUILD_OUTPUT_MODES.STRUCTURE;
}

export function isZipExtrasEnabled(outputMode, alsoExportZip) {
    return outputMode === BUILD_OUTPUT_MODES.ZIP
        || (outputMode === BUILD_OUTPUT_MODES.STRUCTURE && alsoExportZip);
}

/** @param {ReturnType<typeof readBuildOptions>} buildOptions */
export function getBuildInspectionFlags(buildOptions) {
    const { outputMode, alsoExportZip, includeTreeInZip } = buildOptions;
    return {
        checkStructure: true,
        checkTree: outputMode === BUILD_OUTPUT_MODES.TREE || Boolean(includeTreeInZip),
        checkZip: outputMode === BUILD_OUTPUT_MODES.ZIP || Boolean(alsoExportZip)
    };
}

/** @param {ReturnType<typeof getBuildOptionsElements>} els */
export function readBuildOptions(els) {
    const outputMode = getSelectedOutputMode(els);
    const alsoExportZip = Boolean(els.alsoExportZip?.checked);
    const includeTreeInZip = Boolean(els.includeTreeInZip?.checked);
    const zipPassword = els.zipPassword?.value || '';
    const zipPasswordConfirm = els.zipPasswordConfirm?.value || '';
    const treePassword = els.treePassword?.value || '';
    const treePasswordConfirm = els.treePasswordConfirm?.value || '';
    const zipEnabled = isZipExtrasEnabled(outputMode, alsoExportZip);

    return {
        outputMode,
        alsoExportZip,
        includeTreeInZip,
        zipPassword,
        zipPasswordConfirm,
        treePassword,
        treePasswordConfirm,
        zipEnabled,
        treeEncryptEnabled: outputMode === BUILD_OUTPUT_MODES.TREE
            || (includeTreeInZip && zipEnabled)
    };
}

/**
 * @param {ReturnType<typeof readBuildOptions>} options
 * @param {(key: string) => string} t
 * @returns {string | null}
 */
export function validateBuildPasswords(options, t) {
    const zipFilled = Boolean(options.zipPassword || options.zipPasswordConfirm);
    if (options.zipEnabled && zipFilled && options.zipPassword !== options.zipPasswordConfirm) {
        return t('build_password_mismatch');
    }

    const treeFilled = Boolean(options.treePassword || options.treePasswordConfirm);
    if (options.treeEncryptEnabled && treeFilled && options.treePassword !== options.treePasswordConfirm) {
        return t('build_password_mismatch');
    }

    return null;
}

/**
 * @param {ReturnType<typeof getBuildOptionsElements>} els
 * @param {{ t: (key: string) => string }} ctx
 */
function setExtrasGroupState(groupEl, enabled, inputs = []) {
    if (groupEl) {
        groupEl.classList.toggle('is-disabled', !enabled);
    }
    inputs.forEach((input) => {
        if (input) { input.disabled = !enabled; }
    });
}

export function syncBuildOptionsUi(els, ctx) {
    const options = readBuildOptions(els);
    const isStructure = options.outputMode === BUILD_OUTPUT_MODES.STRUCTURE;
    const isZipOnly = options.outputMode === BUILD_OUTPUT_MODES.ZIP;
    const isTreeOnly = options.outputMode === BUILD_OUTPUT_MODES.TREE;
    const optionsLocked = Boolean(ctx.optionsLocked);

    if (els.structureSection) {
        els.structureSection.hidden = !isStructure;
    }

    const alsoExportZipEnabled = isStructure && !optionsLocked;
    setExtrasGroupState(els.alsoExportZipLabel, alsoExportZipEnabled, [els.alsoExportZip]);
    if (!alsoExportZipEnabled && els.alsoExportZip) {
        els.alsoExportZip.checked = false;
    }

    const zipExtrasEnabled = options.zipEnabled && !optionsLocked;
    if (!zipExtrasEnabled) {
        if (els.includeTreeInZip) { els.includeTreeInZip.checked = false; }
        if (els.zipPassword) { els.zipPassword.value = ''; }
        if (els.zipPasswordConfirm) { els.zipPasswordConfirm.value = ''; }
    }
    setExtrasGroupState(els.zipExtras, zipExtrasEnabled, [
        els.includeTreeInZip,
        els.zipPassword,
        els.zipPasswordConfirm
    ]);
    if (els.includeTreeInZipLabel) {
        els.includeTreeInZipLabel.classList.toggle('is-disabled', !zipExtrasEnabled);
    }

    const treeExtrasEnabled = options.treeEncryptEnabled && !optionsLocked;
    if (!treeExtrasEnabled) {
        if (els.treePassword) { els.treePassword.value = ''; }
        if (els.treePasswordConfirm) { els.treePasswordConfirm.value = ''; }
    }
    setExtrasGroupState(els.treeExtras, treeExtrasEnabled, [
        els.treePassword,
        els.treePasswordConfirm
    ]);

    if (els.createBtn) {
        if (isZipOnly) {
            els.createBtn.textContent = ctx.t('build_action_export_zip');
        } else if (isTreeOnly) {
            els.createBtn.textContent = ctx.t('build_action_save_tree');
        } else if (isStructure && options.alsoExportZip) {
            els.createBtn.textContent = ctx.t('build_action_create_zip');
        } else {
            els.createBtn.textContent = ctx.t('build_studio_create');
        }
    }
}

/** @param {'buildStudio'} prefix */
export function bindBuildOptionsUi(prefix, ctx) {
    const els = getBuildOptionsElements(prefix);
    const handler = () => {
        syncBuildOptionsUi(els, ctx);
        ctx.onChange?.();
    };
    const inputs = [
        els.outputModeStructure,
        els.outputModeZip,
        els.outputModeTree,
        els.alsoExportZip,
        els.includeTreeInZip
    ].filter(Boolean);

    inputs.forEach((input) => input.addEventListener('change', handler));
    syncBuildOptionsUi(els, ctx);
    return { els, handler, cleanup: () => inputs.forEach((input) => input.removeEventListener('change', handler)) };
}