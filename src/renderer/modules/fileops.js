import { findRenameMatch } from '../../shared/helpers.js';
import { toHtmlLang } from '../../shared/i18n.js';

export function createFileops(app) {

const defaultFileLangs = {};

    function getHtmlLang() {
        const lang = (app.i18n && app.i18n.getCurrentLang && app.i18n.getCurrentLang()) || 'en';
        return toHtmlLang(lang);
    }

    function getProjectName() {
        return app.state?.lastSavedProjectName
            || (app.i18n ? app.i18n.t('untitled') : 'Untitled');
    }

    function getAuthorName() {
        return 'Tree IDE';
    }

    function replaceTemplatePlaceholders(content) {
        const t = (key) => (app.i18n ? app.i18n.t(key) : key);
        return content
            .replace(/\{lang\}/g, getHtmlLang())
            .replace(/\{projectName\}/g, getProjectName())
            .replace(/\{author\}/g, getAuthorName())
            .replace(/\{hello\}/g, t('hello_greeting'))
            .replace(/\{hello_from\}/g, t('hello_from'))
            .replace(/\{document\}/g, t('document_title'))
            .replace(/\{generated\}/g, t('generated_with'))
            .replace(/\{edit_component\}/g, t('edit_component'))
            .replace(/\{start_editing\}/g, t('start_editing'))
            .replace(/\{run_install\}/g, t('run_install'))
            .replace(/\{run_tests\}/g, t('run_tests_pytest'));
    }

    function getDefaultContentForFile(filePath) {
        const fileName = filePath.split('/').pop().toLowerCase();
        const ext = fileName.includes('.') ? fileName.split('.').pop() : '';
        const t = (key) => (app.i18n ? app.i18n.t(key) : key);

        if (fileName === 'package.json') {return app.defaultFileContentsByExtension.json;}
        if (fileName === 'readme.md') {
            return `# ${filePath.split('/')[0] || t('untitled')}\n\n${t('generated_with')}\n`;
        }
        if (fileName === '.gitignore' || fileName === 'gitignore') {return `node_modules/\ndist/\n.env\n`;}
        if (fileName === 'dockerfile' || fileName.startsWith('dockerfile.')) {return app.defaultFileContentsByExtension.dockerfile;}
        if (fileName === 'docker-compose' || fileName === 'docker-compose.yml' || fileName === 'docker-compose.yaml' ||
            fileName === 'compose.yml' || fileName === 'compose.yaml') {return app.defaultFileContentsByExtension.docker_compose;}
        if (fileName === 'makefile' || fileName === 'gnumakefile') {return app.defaultFileContentsByExtension.makefile;}
        if (fileName === 'cmakelists.txt') {return app.defaultFileContentsByExtension.cmake;}
        if (fileName === 'nginx.conf') {return app.defaultFileContentsByExtension.nginx;}
        if (fileName === '.env') {return '';}

        if (ext === 'md' || ext === 'markdown') {
            return `# ${t('new_document')}\n\n${t('write_content_here')}\n`;
        }

        const content = app.defaultFileContentsByExtension[ext] || '';
        return replaceTemplatePlaceholders(content);
    }

    function collectTrackedFilePaths(fileContents) {
        const S = app.state;
        const paths = new Set(Object.keys(fileContents));
        if (S.activePreviewPath) { paths.add(S.activePreviewPath); }
        const activeTab = app.tabs.getActiveTab();
        if (activeTab?.openFileTabs) {
            activeTab.openFileTabs.forEach((ft) => paths.add(ft.path));
        }
        if (activeTab?.activeFileTabPath) { paths.add(activeTab.activeFileTabPath); }
        return paths;
    }

    function resolveTrackedFileContent(oldPath, fileContents) {
        const S = app.state;
        if (Object.prototype.hasOwnProperty.call(fileContents, oldPath)) {
            return fileContents[oldPath];
        }
        if (S.activePreviewPath === oldPath && S.filePreviewEditor) {
            return S.filePreviewEditor.value;
        }
        const activeTab = app.tabs.getActiveTab();
        if (activeTab && Object.prototype.hasOwnProperty.call(activeTab.fileContents, oldPath)) {
            return activeTab.fileContents[oldPath];
        }
        if (activeTab?.openFileTabs?.some((ft) => ft.path === oldPath)) {
            return getDefaultContentForFile(oldPath);
        }
        return undefined;
    }

    function syncFileContentsWithTree(tree) {
        const S = app.state;
        const filePaths = new Set(app.tree.getFilePathsFromTree(tree));
        const nextContents = {};
        const fileContents = S.fileContents;

        const trackedPaths = collectTrackedFilePaths(fileContents);
        const removedPaths = [...trackedPaths].filter((p) => !filePaths.has(p));
        const addedPaths = [];

        filePaths.forEach((filePath) => {
            if (Object.prototype.hasOwnProperty.call(fileContents, filePath)) {
                nextContents[filePath] = fileContents[filePath];
            } else {
                addedPaths.push(filePath);
                nextContents[filePath] = getDefaultContentForFile(filePath);
                defaultFileLangs[filePath] = app.i18n.getCurrentLang();
            }
        });

        const renames = [];

        if (removedPaths.length > 0 && addedPaths.length > 0) {
            const usedAdded = new Set();
            removedPaths.forEach((oldPath) => {
                const oldContent = resolveTrackedFileContent(oldPath, fileContents);
                if (oldContent === undefined) {
                    delete defaultFileLangs[oldPath];
                    return;
                }
                const match = findRenameMatch(oldPath, addedPaths, usedAdded);
                if (match) {
                    usedAdded.add(match);
                    renames.push({ oldPath, newPath: match, oldContent });
                } else {
                    delete defaultFileLangs[oldPath];
                }
            });
        } else {
            removedPaths.forEach((oldPath) => delete defaultFileLangs[oldPath]);
        }

        renames.forEach(({ oldPath, newPath, oldContent }) => {
            nextContents[newPath] = oldContent;
            if (Object.prototype.hasOwnProperty.call(defaultFileLangs, oldPath)) {
                defaultFileLangs[newPath] = defaultFileLangs[oldPath];
                delete defaultFileLangs[oldPath];
            }
        });

        S.fileContents = nextContents;

        renames.forEach(({ oldPath, newPath }) => {
            if (S.activePreviewPath === oldPath) {
                S.activePreviewPath = newPath;
            }
            app.tabs.updateFileTabPath(oldPath, newPath);
            if (S.activePreviewPath === newPath) {
                app.editor.openFilePreview(newPath);
            }
        });

        persistFileContents();
    }

    function persistFileContents() {
        app.storage.persistFileContents();
    }

    function loadSavedFileContents() {
        app.storage.loadSavedFileContents();
    }

    function isMarkdownFile(filePath) {
        return /\.(md|markdown)$/i.test(filePath);
    }

    function getFileTypeLabel(filePath) {
        return app.fileTypes.getFileTypeLabel(filePath);
    }

    const formatMessage = app.helpers.formatMessage;

    function handleSaveResult(result) {
        if (result?.error) {
            app.toast.showToast(result.error, 4000);
            return true;
        }
        return false;
    }

    async function autoSaveToDisk() {
        const S = app.state;
        if (!S.currentFilePath || S._isSaving) {return;}
        if (!S.editor?.value?.trim()) {return;}

        S._isSaving = true;
        try {
            const result = await app.electronAPI.saveTree(S.currentFilePath, S.editor.value, app.i18n.getCurrentLang());
            if (handleSaveResult(result)) { return; }
            S.isModified = false;
            const activeTab = app.tabs.getActiveTab();
            if (activeTab) {
                activeTab.editorContent = S.editor.value;
                app.tabs.markTabSaved(activeTab, S.editor.value, S.fileContents);
                app.tabs.renderProjectTabBar();
                app.tabs.saveTabsToStorage();
            }
        } catch (_err) {
            // silent: auto-save failures don't interrupt the user
        } finally {
            S._isSaving = false;
        }
    }

    async function saveProject(askPath = false) {
        const S = app.state;
        const toast = app.toast;
        const { showToast } = toast;

        if (S._isSaving) {return false;}

        const content = S.editor?.value || '';
        const validation = app.validation.validateEditorContent(content);
        if (!validation.hasItems) {
            showToast(app.i18n.t('validation_empty'), 4000);
            return false;
        }

        S._isSaving = true;
        try {
            const activeTab = app.tabs.getActiveTab();
            const currentName = activeTab ? (activeTab.name || '') : '';

            if (!S.currentFilePath || askPath || (currentName !== S.lastSavedProjectName)) {
                const projectName = currentName || 'project';
                const result = await app.electronAPI.saveTreeAs(S.editor.value, projectName, app.i18n.getCurrentLang());
                if (result.canceled) { return false; }
                if (handleSaveResult(result) || !result.filePath) { return false; }
                S.currentFilePath = result.filePath;
                const savedFileName = result.filePath.split(/[\\/]/).pop().replace(/\.tree$/i, '');
                S.lastSavedProjectName = savedFileName;
                S.isModified = false;
                persistFileContents();
                showToast(app.i18n.t('saved'));

                if (activeTab) {
                    activeTab.name = savedFileName;
                    activeTab.filePath = S.currentFilePath;
                    activeTab.lastSavedProjectName = savedFileName;
                    activeTab.editorContent = S.editor.value;
                    app.tabs.markTabSaved(activeTab, S.editor.value, S.fileContents);
                    app.tabs.renderProjectTabBar();
                    app.tabs.saveTabsToStorage();
                }
                return true;
            } else {
                const result = await app.electronAPI.saveTree(S.currentFilePath, S.editor.value, app.i18n.getCurrentLang());
                if (handleSaveResult(result)) { return false; }
                S.isModified = false;
                persistFileContents();
                showToast(app.i18n.t('saved'));
                S.lastSavedProjectName = currentName;

                const activeTab2 = app.tabs.getActiveTab();
                if (activeTab2) {
                    activeTab2.name = currentName;
                    activeTab2.filePath = S.currentFilePath;
                    activeTab2.lastSavedProjectName = S.lastSavedProjectName;
                    activeTab2.editorContent = S.editor.value;
                    app.tabs.markTabSaved(activeTab2, S.editor.value, S.fileContents);
                    app.tabs.renderProjectTabBar();
                    app.tabs.saveTabsToStorage();
                }
                return true;
            }
        } finally {
            S._isSaving = false;
        }
    }

    async function exportCurrentTreeAsZip(options = {}) {
        const S = app.state;
        const { showToast } = app.toast;
        S.currentTree = app.tree.parseEditorContent(S.editor.value);
        syncFileContentsWithTree(S.currentTree);
        const validation = app.validation.validateEditorContent(S.editor.value);
        app.validation.updateValidationPanel(validation);

        if (validation.errors.length > 0 || !validation.hasItems) {
            showToast(validation.errors[0]?.message || app.i18n.t('empty_structure_error'), 4000);
            return false;
        }

        const activeTab = app.tabs.getActiveTab();
        const projectName = (activeTab && activeTab.name) || 'project';
        const result = await app.electronAPI.exportZip(S.currentTree, projectName, { fileContents: S.fileContents }, app.i18n.getCurrentLang());

        if (result.error) { showToast(result.error, 4000); return false; }
        if (result.canceled) { return false; }
        if (!options.silent) {
            showToast(app.i18n.t('zip_exported'));
        }
        return true;
    }

    async function handleLoadUnified() {
        const lang = app.i18n.getCurrentLang();
        const result = await app.electronAPI.loadUnified(lang);
        if (result.canceled) { return; }
        await app.loadProject.loadProjectFromResult(app, result, result.filePath || '');
    }

    function setBuildFolderPath(path) {
        const S = app.state;
        S.buildFolderPath = path || '';
        if (S.buildFolderPath) {
            localStorage.setItem('build_folder_path', S.buildFolderPath);
        } else {
            localStorage.removeItem('build_folder_path');
        }
        updateBuildFolderDisplay();
    }

    function updateBuildFolderDisplay() {
        const S = app.state;
        const noFolder = app.i18n.t('no_folder_selected');
        const settingsPath = document.getElementById('buildFolderPath');
        const welcomePath = document.getElementById('welcomeBuildFolderPath');

        if (settingsPath) {settingsPath.style.display = 'none';}
        if (welcomePath) {welcomePath.style.display = 'none';}

        const escapePath = (v) => app.helpers.escapeHtml(v || '');
        const displayText = escapePath(S.buildFolderPath) || noFolder;
        const cssClass = S.buildFolderPath ? 'folder-path-list-item' : 'folder-path-list-item empty';
        const listHtml = `<div class="${cssClass}" title="${escapePath(S.buildFolderPath)}">${displayText}</div>`;
        const settingsList = document.getElementById('buildFolderList');
        const welcomeList = document.getElementById('welcomeBuildFolderList');
        if (settingsList) {settingsList.innerHTML = listHtml;}
        if (welcomeList) {welcomeList.innerHTML = listHtml;}
    }

    async function chooseBuildFolder() {
        const result = await app.electronAPI.selectBuildFolder();
        if (result.canceled) {return;}
        setBuildFolderPath(result.path);
    }

    async function ensureBuildFolderPath() {
        const S = app.state;
        if (S.buildFolderPath) {return S.buildFolderPath;}
        const result = await app.electronAPI.selectBuildFolder();
        if (result.canceled) {return '';}
        setBuildFolderPath(result.path);
        return result.path;
    }

    function getDefaultFileLangs() { return defaultFileLangs; }

    function bindBuildButton() {
        const createBtn = document.getElementById('createBtn');
        if (!createBtn || !app.buildStudio) { return; }

        createBtn.addEventListener('click', () => {
            void app.buildStudio.open();
        });
    }

    return {
        syncFileContentsWithTree, persistFileContents, loadSavedFileContents,
        isMarkdownFile, getFileTypeLabel, formatMessage,
        getDefaultContentForFile, replaceTemplatePlaceholders, getHtmlLang,
        saveProject, autoSaveToDisk, exportCurrentTreeAsZip,
        handleLoadUnified, setBuildFolderPath, updateBuildFolderDisplay,
        chooseBuildFolder, ensureBuildFolderPath, getDefaultFileLangs,
        bindBuildButton
    };

}
