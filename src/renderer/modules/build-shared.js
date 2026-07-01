/**
 * Shared build logic for wizard (B) and studio (C).
 */

import {
    BUILD_OUTPUT_MODES,
    getBuildInspectionFlags,
    isZipExtrasEnabled,
    validateBuildPasswords
} from './build-options.js';
import { resolveProjectName, sanitizeProjectFileName } from '../../shared/helpers.js';

export function createBuildShared(app) {

    const t = (key) => app.i18n.t(key);
    const format = (template, values) => app.fileops.formatMessage(template, values);

    function resolveTabProjectName(tab) {
        return sanitizeProjectFileName(resolveProjectName({
            tabName: tab?.name,
            lastSavedName: tab?.lastSavedProjectName,
            filePath: tab?.filePath,
            untitledLabel: t('untitled')
        }));
    }

    function resolveTabTreeData(tab, editorContent) {
        const parsed = app.tree.parseEditorContent(editorContent || '');
        const stored = tab.treeData;
        const hasStored = stored !== null && typeof stored === 'object' && Object.keys(stored).length > 0;
        if (hasStored) { return stored; }
        return parsed;
    }

    function getTabBuildPayload(tab) {
        const S = app.state;
        if (tab.id === app.tabs.activeProjectTabId) {
            const editor = S.editor;
            const editorContent = editor?.value || '';
            const treeData = app.tree.parseEditorContent(editorContent);
            return {
                tab,
                treeData,
                editorContent,
                fileContents: { ...S.fileContents }
            };
        }
        const editorContent = tab.editorContent || '';
        return {
            tab,
            treeData: resolveTabTreeData(tab, editorContent),
            editorContent,
            fileContents: { ...(tab.fileContents || {}) }
        };
    }

    function countFolders(tree, count = 0) {
        Object.keys(tree || {}).forEach((key) => {
            const child = tree[key];
            const isFolder = key.endsWith('/') || Object.keys(child).length > 0;
            if (isFolder) {
                count += 1;
                count = countFolders(child, count);
            }
        });
        return count;
    }

    function getPayloadStats(payload) {
        const validation = app.validation.validateEditorContent(payload.editorContent || '');
        const tree = payload.treeData;
        return {
            validation,
            files: app.tree.getFilePathsFromTree(tree).length,
            folders: countFolders(tree),
            name: payload.tab.name || t('untitled')
        };
    }

    function isTabBuildable(tab) {
        const payload = getTabBuildPayload(tab);
        const validation = app.validation.validateEditorContent(payload.editorContent || '');
        return validation.hasItems && validation.errors.length === 0;
    }

    function getProjectTabsForBuildUi() {
        const tabs = app.tabs.projectTabs;
        const buildable = tabs.filter(isTabBuildable);
        return buildable.length > 0 ? buildable : tabs;
    }

    function shouldShowBuildTabBar(availableTabs, excludedTabIds) {
        const excludedCount = excludedTabIds instanceof Set ? excludedTabIds.size : 0;
        return availableTabs.length >= 2 || excludedCount > 0;
    }

    function renderBuildProjectTabHtml(tab, { isActive, showClose, escapeHtml }) {
        const displayName = escapeHtml(tab.name || t('untitled'));
        const excludeTitle = escapeHtml(t('build_exclude_tab'));
        const closeButton = showClose
            ? `<span class="project-tab-close" data-build-close-tab-id="${escapeHtml(tab.id)}" title="${excludeTitle}" aria-label="${excludeTitle}">
                <i data-lucide="x" aria-hidden="true"></i>
               </span>`
            : '';
        return `<button type="button" class="project-tab${isActive ? ' active' : ''}" data-tab-id="${escapeHtml(tab.id)}" role="tab" aria-selected="${isActive}">
            <span class="project-tab-name">${displayName}</span>
            ${closeButton}
        </button>`;
    }

    function renderBuildProjectTabBar(tabs, activeTabId, { escapeHtml }) {
        if (!tabs.length) {
            return '';
        }
        const showClose = tabs.length > 1;
        return tabs.map((tab) => renderBuildProjectTabHtml(tab, {
            isActive: tab.id === activeTabId,
            showClose,
            escapeHtml
        })).join('');
    }

    function getPayloadDisplayMeta(payload) {
        const stats = getPayloadStats(payload);
        const structuralErrors = stats.validation.errors.filter((error) => error.line !== null);
        return {
            ...stats,
            isEmpty: !stats.validation.hasItems,
            structuralErrors,
            detailText: structuralErrors.length > 0
                ? (structuralErrors[0]?.message ?? '')
                : format(t('build_wizard_files_folders'), { files: stats.files, folders: stats.folders })
        };
    }

    function validatePayloads(payloads) {
        if (payloads.length === 0) {
            app.toast.showToast(t('build_wizard_no_tabs_selected'), 3000);
            return false;
        }
        for (const payload of payloads) {
            const validation = app.validation.validateEditorContent(payload.editorContent || '');
            if (validation.errors.length > 0) {
                app.toast.showToast(validation.errors[0]?.message ?? validation.errors[0], 4000);
                return false;
            }
            if (!validation.hasItems) {
                app.toast.showToast(t('empty_structure_error'), 4000);
                return false;
            }
        }
        return true;
    }

    function canOpenBuildStudio() {
        const tabs = getProjectTabsForBuildUi();
        const payloads = tabs.map((tab) => getTabBuildPayload(tab));
        return validatePayloads(payloads);
    }

    const MAX_LISTED_STRUCTURE_FILES = 8;

    function formatBuildExistingWarning({
        structureExisting,
        existingStructureNames = [],
        existingTreeNames = [],
        existingZipNames = []
    }) {
        const parts = [];

        if (structureExisting > 0) {
            if (existingStructureNames.length > 0
                && existingStructureNames.length <= MAX_LISTED_STRUCTURE_FILES) {
                parts.push(existingStructureNames.join(', '));
            } else {
                parts.push(format(t('build_existing_structure_part'), { count: structureExisting }));
            }
        }
        if (existingTreeNames.length > 0) {
            parts.push(existingTreeNames.join(', '));
        }
        if (existingZipNames.length > 0) {
            parts.push(existingZipNames.join(', '));
        }

        return format(t('build_wizard_existing_output_warning'), { details: parts.join(', ') });
    }

    async function inspectPayloads(payloads, targetPath, buildOptions = null) {
        if (!targetPath) {
            return {
                inspections: [],
                totalExisting: 0,
                structureExisting: 0,
                existingStructureNames: [],
                existingTreeNames: [],
                existingZipNames: []
            };
        }

        const flags = buildOptions ? getBuildInspectionFlags(buildOptions) : {
            checkStructure: true,
            checkTree: false,
            checkZip: false
        };
        const inspections = [];
        const existingStructureNames = [];
        const existingTreeNames = [];
        const existingZipNames = [];
        let totalExisting = 0;
        let structureExisting = 0;

        for (const payload of payloads) {
            const projectName = resolveTabProjectName(payload.tab);
            const inspection = await app.electronAPI.inspectStructure(payload.treeData, targetPath, {
                ...flags,
                projectName
            });
            if (inspection.error) {
                app.toast.showToast(inspection.error, 4000);
                return {
                    inspections: [],
                    totalExisting: 0,
                    structureExisting: 0,
                    existingStructureNames: [],
                    existingTreeNames: [],
                    existingZipNames: [],
                    error: inspection.error
                };
            }

            const structureCount = inspection.existingFiles?.length || 0;
            const treeName = inspection.existingTree?.name;
            const zipName = inspection.existingZip?.name;

            inspections.push({ payload, inspection });
            structureExisting += structureCount;
            inspection.existingFiles?.forEach((file) => {
                const name = file.key || file.path;
                if (name && !existingStructureNames.includes(name)) {
                    existingStructureNames.push(name);
                }
            });
            if (treeName && !existingTreeNames.includes(treeName)) {
                existingTreeNames.push(treeName);
            }
            if (zipName && !existingZipNames.includes(zipName)) {
                existingZipNames.push(zipName);
            }
            totalExisting += structureCount + (treeName ? 1 : 0) + (zipName ? 1 : 0);
        }

        existingStructureNames.sort((a, b) => a.localeCompare(b));

        return {
            inspections,
            totalExisting,
            structureExisting,
            existingStructureNames,
            existingTreeNames,
            existingZipNames
        };
    }

    function preparePayload(payload) {
        const tab = payload.tab;
        if (tab.id !== app.tabs.activeProjectTabId) {
            app.tabs.switchToTab(tab.id);
        }
        app.tabs.saveCurrentTabState();
        const fresh = getTabBuildPayload(tab);
        app.fileops.syncFileContentsWithTree(fresh.treeData);
        return {
            ...fresh,
            projectName: resolveTabProjectName(tab)
        };
    }

    async function exportPayloadZip(payload, {
        includeTreeInZip = false,
        zipPassword = '',
        treePassword = '',
        targetPath = '',
        conflictMode = 'skip',
        silent = false
    } = {}) {
        const prepared = preparePayload(payload);
        const lang = app.i18n.getCurrentLang();
        const exportOptions = {
            fileContents: prepared.fileContents,
            password: zipPassword || undefined,
            outputDirectory: targetPath || undefined,
            conflictMode
        };
        if (includeTreeInZip) {
            exportOptions.includeTreeContent = prepared.editorContent || '';
            exportOptions.treeFileName = `${prepared.projectName}.tree`;
            if (treePassword) {
                exportOptions.encryptTreePassword = treePassword;
            }
        }
        const result = await app.electronAPI.exportZip(
            prepared.treeData,
            prepared.projectName,
            exportOptions,
            lang
        );
        if (result.error) {
            app.toast.showToast(result.error, 4000);
            return false;
        }
        if (result.canceled) { return false; }
        if (result.skipped) { return 'skipped'; }
        if (!silent) {
            app.toast.showToast(t('zip_exported'));
        }
        return true;
    }

    async function savePayloadTree(payload, {
        treePassword = '',
        targetPath = '',
        conflictMode = 'skip'
    } = {}) {
        const prepared = preparePayload(payload);
        const lang = app.i18n.getCurrentLang();
        const result = await app.electronAPI.saveTreeAs(
            prepared.editorContent || '',
            prepared.projectName,
            lang,
            {
                encryptPassword: treePassword || undefined,
                outputDirectory: targetPath || undefined,
                conflictMode
            }
        );
        if (result.error) {
            app.toast.showToast(result.error, 4000);
            return false;
        }
        if (result.canceled) { return false; }
        if (result.skipped) { return 'skipped'; }
        return true;
    }

    async function runBuild(buildOptions) {
        const {
            payloads,
            targetPath,
            conflictMode,
            outputMode = BUILD_OUTPUT_MODES.STRUCTURE,
            alsoExportZip = false,
            includeTreeInZip = false,
            zipPassword = '',
            zipPasswordConfirm = '',
            treePassword = '',
            treePasswordConfirm = ''
        } = buildOptions;

        const passwordError = validateBuildPasswords({
            outputMode,
            alsoExportZip,
            includeTreeInZip,
            zipPassword,
            zipPasswordConfirm,
            treePassword,
            treePasswordConfirm,
            zipEnabled: isZipExtrasEnabled(outputMode, alsoExportZip),
            treeEncryptEnabled: outputMode === BUILD_OUTPUT_MODES.TREE
                || (includeTreeInZip && isZipExtrasEnabled(outputMode, alsoExportZip))
        }, t);
        if (passwordError) {
            app.toast.showToast(passwordError, 4000);
            return false;
        }

        let completed = 0;
        let skipped = 0;

        for (const payload of payloads) {
            if (outputMode === BUILD_OUTPUT_MODES.STRUCTURE) {
                const prepared = preparePayload(payload);
                const result = await app.electronAPI.createStructure(
                    prepared.treeData,
                    targetPath,
                    { conflictMode, fileContents: prepared.fileContents }
                );
                if (result.error) {
                    app.toast.showToast(result.error, 4000);
                    return false;
                }
                if (result.canceled) { return false; }
                app.fileops.setBuildFolderPath(result.path);
                completed++;

                if (alsoExportZip) {
                    const zipOk = await exportPayloadZip(prepared, {
                        includeTreeInZip,
                        zipPassword,
                        treePassword,
                        targetPath,
                        conflictMode,
                        silent: true
                    });
                    if (zipOk === false) { return false; }
                    if (zipOk === 'skipped') { skipped++; }
                }
            } else if (outputMode === BUILD_OUTPUT_MODES.ZIP) {
                const zipOk = await exportPayloadZip(payload, {
                    includeTreeInZip,
                    zipPassword,
                    treePassword,
                    targetPath,
                    conflictMode,
                    silent: payloads.length > 1
                });
                if (zipOk === false) { return false; }
                if (zipOk === 'skipped') { skipped++; }
                else { completed++; }
            } else if (outputMode === BUILD_OUTPUT_MODES.TREE) {
                const treeOk = await savePayloadTree(payload, {
                    treePassword,
                    targetPath,
                    conflictMode
                });
                if (treeOk === false) { return false; }
                if (treeOk === 'skipped') { skipped++; }
                else { completed++; }
            }
        }

        if (completed === 0 && skipped > 0) {
            app.toast.showToast(t('build_output_skipped'), 3000);
            return true;
        }
        if (completed === 0) { return false; }

        if (payloads.length > 1) {
            if (outputMode === BUILD_OUTPUT_MODES.ZIP) {
                app.toast.showToast(format(t('build_zip_tabs_done'), { count: completed }), 3000);
            } else if (outputMode === BUILD_OUTPUT_MODES.TREE) {
                app.toast.showToast(format(t('build_tree_tabs_done'), { count: completed }), 3000);
            } else {
                app.toast.showToast(format(t('build_tabs_done'), { count: completed }), 3000);
            }
            return true;
        }

        if (outputMode === BUILD_OUTPUT_MODES.ZIP) {
            app.toast.showToast(t('zip_exported'));
        } else if (outputMode === BUILD_OUTPUT_MODES.TREE) {
            app.toast.showToast(t('tree_saved'));
        } else if (alsoExportZip) {
            app.toast.showToast(t('structure_and_zip_created'));
        } else {
            app.toast.showToast(t('structure_created'));
        }
        return true;
    }

    return {
        getTabBuildPayload,
        countFolders,
        getPayloadStats,
        isTabBuildable,
        getProjectTabsForBuildUi,
        getPayloadDisplayMeta,
        shouldShowBuildTabBar,
        renderBuildProjectTabHtml,
        renderBuildProjectTabBar,
        validatePayloads,
        canOpenBuildStudio,
        inspectPayloads,
        formatBuildExistingWarning,
        runBuild,
        format,
        t
    };

}