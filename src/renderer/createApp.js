import * as helpers from '../shared/helpers.js';
import { createI18n } from '../shared/i18n.js';
import { defaultFileContentsByExtension } from './data/defaults.js';
import { templatesData } from './data/templates/index.js';
import { installLucide } from './modules/lucide-local.js';
import { createIcons } from './modules/icons.js';
import { createDbStorage } from './modules/db-storage.js';
import { createToast } from './modules/toast.js';
import { createMarkdown } from './modules/markdown.js';
import { createStorage } from './modules/storage.js';
import { createFileTypes } from './modules/file-types.js';
import { createValidation } from './modules/validation.js';
import { createTree } from './modules/tree.js';
import { createUndoredo } from './modules/undoredo.js';
import { createModals } from './modules/modals.js';
import { createTabs } from './modules/tabs.js';
import { createEditor } from './modules/editor.js';
import { createPanelResize } from './modules/panel-resize.js';
import { createFileops } from './modules/fileops.js';
import { createBuildShared } from './modules/build-shared.js';
import { createBuildStudio } from './modules/build-studio.js';
import { createTemplatesUi } from './modules/templates-ui.js';
import { createShortcuts } from './modules/shortcuts.js';
import { createCustomSelect } from './modules/custom-select.js';
import { createShell } from './modules/shell.js';
import * as loadProject from './modules/load-project.js';

function createAppState() {
    const domRefs = {
        editor: null,
        treeView: null,
        filePreviewPanel: null,
        filePreviewEditor: null,
        filePreviewMode: null,
        markdownPreview: null,
        fileNameEl: null,
        confirmModalEl: null
    };

    let debounceTimer;
    let autoSaveTimer;

    const state = {
        get editor() { return domRefs.editor; },
        get treeView() { return domRefs.treeView; },
        get filePreviewPanel() { return domRefs.filePreviewPanel; },
        get filePreviewEditor() { return domRefs.filePreviewEditor; },
        get filePreviewMode() { return domRefs.filePreviewMode; },
        get markdownPreview() { return domRefs.markdownPreview; },
        get fileNameEl() { return domRefs.fileNameEl; },
        get confirmModalEl() { return domRefs.confirmModalEl; },

        currentFilePath: '',
        currentTree: {},
        lastSavedProjectName: '',
        isModified: false,
        buildFolderPath: localStorage.getItem('build_folder_path') || '',
        fileContents: {},
        activePreviewPath: '',
        _isSaving: false
    };

    const dom = {
        bindRefs() {
            domRefs.editor = document.getElementById('editor');
            domRefs.treeView = document.getElementById('treeView');
            domRefs.filePreviewPanel = document.getElementById('filePreviewPanel');
            domRefs.filePreviewEditor = document.getElementById('filePreviewEditor');
            domRefs.filePreviewMode = document.getElementById('filePreviewMode');
            domRefs.markdownPreview = document.getElementById('markdownPreview');
            domRefs.fileNameEl = document.getElementById('fileName');
            domRefs.confirmModalEl = document.getElementById('confirmModal');
        },

        get debounceTimer() { return debounceTimer; },
        set debounceTimer(v) { debounceTimer = v; },

        get autoSaveTimer() { return autoSaveTimer; },
        set autoSaveTimer(v) { autoSaveTimer = v; }
    };

    return { state, dom };
}

export function createApp({ electronAPI }) {
    const i18n = createI18n();
    const { state, dom } = createAppState();

    const app = {
        electronAPI,
        helpers,
        i18n,
        state,
        dom,
        defaultFileContentsByExtension,
        templatesData
    };

    installLucide();

    app.icons = createIcons(app);
    app.dbStorage = createDbStorage(app);
    app.toast = createToast(app);
    app.markdown = createMarkdown(app);
    app.storage = createStorage(app);
    app.fileTypes = createFileTypes(app);
    app.validation = createValidation(app);
    app.tree = createTree(app);
    app.undoredo = createUndoredo(app);
    app.modals = createModals(app);
    app.tabs = createTabs(app);
    app.editor = createEditor(app);
    app.panelResize = createPanelResize(app);
    app.fileops = createFileops(app);
    app.buildShared = createBuildShared(app);
    app.buildStudio = createBuildStudio(app);
    app.templates = createTemplatesUi(app);
    app.shortcuts = createShortcuts(app);
    app.customSelect = createCustomSelect(app);
    app.shell = createShell(app);
    app.loadProject = loadProject;

    i18n.setOnLanguageChange(() => {
        i18n.updateUI();
        if (app.customSelect?.refreshAll) {
            app.customSelect.refreshAll();
        }
        app.panelResize?.refreshHandleLabels();
        void app.modals.initializeAppInfo();
    });

    return app;
}