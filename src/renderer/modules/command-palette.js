export function createCommandPalette(app) {
    let initialized = false;
    let activeIndex = 0;
    let visibleCommands = [];
    let previousFocus = null;

    const normalize = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    const clickElement = (id) => document.getElementById(id)?.click();

    function getProjectTabs() {
        return Array.isArray(app.tabs?.projectTabs) ? app.tabs.projectTabs : [];
    }

    function getActiveProjectTab() {
        return app.tabs?.getActiveTab?.()
            || getProjectTabs().find((tab) => tab.id === app.tabs?.activeProjectTabId)
            || null;
    }

    function switchAdjacentProjectTab(direction) {
        const tabs = getProjectTabs();
        if (tabs.length <= 1) { return; }
        const currentIndex = Math.max(0, tabs.findIndex((tab) => tab.id === app.tabs?.activeProjectTabId));
        const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
        app.tabs.switchToTab?.(tabs[nextIndex].id);
    }

    function closeActiveProjectTab() {
        const tab = getActiveProjectTab();
        if (!tab || getProjectTabs().length <= 1) { return; }
        void app.tabs.closeTab?.(tab.id);
    }

    function closeActiveFileTab() {
        const filePath = getActiveProjectTab()?.activeFileTabPath;
        if (filePath) { app.tabs.closeFileTab?.(filePath); }
    }

    function getCommands() {
        return [
            { id: 'new_project', label: 'new', icon: 'file-plus-2', run: () => app.tabs.createTab({ name: app.i18n.t('untitled') }) },
            { id: 'open_project', label: 'open', icon: 'folder-open', run: () => app.fileops.handleLoadUnified() },
            { id: 'save_project', label: 'save', icon: 'save', run: () => app.fileops.saveProject(false) },
            { id: 'save_as', label: 'save_as', icon: 'save-all', run: () => app.fileops.saveProject(true) },
            {
                id: 'save_all',
                label: 'save_all',
                icon: 'save-all',
                enabled: () => getProjectTabs().some((tab) => tab.isModified),
                run: () => clickElement('menu-save-all')
            },
            { id: 'undo', label: 'undo', icon: 'restore', run: () => clickElement('menu-undo') },
            { id: 'redo', label: 'redo', icon: 'arrow-right', run: () => clickElement('menu-redo') },
            { id: 'new_tab', label: 'new_tab', icon: 'plus', run: () => app.tabs.createTab({ name: app.i18n.t('untitled') }) },
            {
                id: 'next_tab',
                label: 'next_tab',
                icon: 'chevron-right',
                enabled: () => getProjectTabs().length > 1,
                run: () => switchAdjacentProjectTab(1)
            },
            {
                id: 'prev_tab',
                label: 'prev_tab',
                icon: 'chevron-left',
                enabled: () => getProjectTabs().length > 1,
                run: () => switchAdjacentProjectTab(-1)
            },
            {
                id: 'close_tab',
                label: 'close_tab',
                icon: 'x',
                enabled: () => getProjectTabs().length > 1 && Boolean(getActiveProjectTab()),
                run: closeActiveProjectTab
            },
            {
                id: 'close_file_tab',
                label: 'close_file_tab',
                icon: 'file',
                enabled: () => Boolean(getActiveProjectTab()?.activeFileTabPath),
                run: closeActiveFileTab
            },
            { id: 'build', label: 'build', icon: 'hammer', run: () => document.getElementById('createBtn')?.click() },
            { id: 'templates', label: 'templates', icon: 'layout-template', run: () => app.templates.openTemplatesModal() },
            { id: 'settings', label: 'settings', icon: 'settings', run: () => document.getElementById('menu-settings')?.click() },
            { id: 'reload', label: 'reload', icon: 'restore', run: () => clickElement('menu-reload') },
            { id: 'zoom_in', label: 'zoom_in', icon: 'plus', run: () => clickElement('menu-zoom-in') },
            { id: 'zoom_out', label: 'zoom_out', icon: 'minus', run: () => clickElement('menu-zoom-out') },
            { id: 'zoom_reset', label: 'actual_size', icon: 'maximize', run: () => clickElement('menu-zoom-reset') },
            { id: 'fullscreen', label: 'fullscreen', icon: 'maximize', run: () => document.getElementById('menu-fullscreen')?.click() },
            { id: 'check_updates', label: 'check_updates', icon: 'download', run: () => clickElement('checkUpdateBtn') },
            { id: 'about', label: 'about', icon: 'file-text', run: () => clickElement('menu-credits') },
            { id: 'report_problem', label: 'report_problem', icon: 'message-square-warning', run: () => document.getElementById('menu-report-problem')?.click() }
        ];
    }

    function isCommandEnabled(command) {
        return command?.enabled?.() !== false;
    }

    function findEnabledIndex(startIndex, direction = 1) {
        if (!visibleCommands.length) { return -1; }
        for (let offset = 0; offset < visibleCommands.length; offset += 1) {
            const index = (startIndex + (offset * direction) + visibleCommands.length) % visibleCommands.length;
            if (isCommandEnabled(visibleCommands[index])) { return index; }
        }
        return -1;
    }

    function getShortcutText(command) {
        const shortcut = app.shortcuts?.getShortcut?.(command.id);
        return shortcut ? app.shortcuts.formatShortcut(shortcut) : '';
    }

    function render() {
        const input = document.getElementById('commandPaletteInput');
        const list = document.getElementById('commandPaletteList');
        const empty = document.getElementById('commandPaletteEmpty');
        const status = document.getElementById('commandPaletteStatus');
        if (!list) { return; }

        const query = normalize(input?.value);
        visibleCommands = getCommands().filter((command) => {
            const label = app.i18n.t(command.label);
            return !query || normalize(`${label} ${command.id}`).includes(query);
        });
        activeIndex = Math.min(activeIndex, Math.max(0, visibleCommands.length - 1));
        if (!isCommandEnabled(visibleCommands[activeIndex])) {
            activeIndex = findEnabledIndex(activeIndex);
        }
        list.classList.toggle('hidden', visibleCommands.length === 0);
        empty?.classList.toggle('hidden', visibleCommands.length !== 0);

        list.innerHTML = visibleCommands.map((command, index) => {
            const label = app.helpers.escapeHtml(app.i18n.t(command.label));
            const shortcut = app.helpers.escapeHtml(getShortcutText(command));
            const enabled = isCommandEnabled(command);
            return `<button id="commandPaletteOption${index}" type="button" class="command-palette-option${index === activeIndex ? ' active' : ''}" data-command-index="${index}" role="option" aria-selected="${index === activeIndex}" aria-disabled="${!enabled}" tabindex="-1"${enabled ? '' : ' disabled'}>
                <i data-lucide="${command.icon}" aria-hidden="true"></i>
                <span class="command-palette-label">${label}</span>
                ${shortcut ? `<span class="command-palette-shortcut">${shortcut}</span>` : ''}
            </button>`;
        }).join('');
        const activeOption = list.querySelector('.command-palette-option.active');
        input?.setAttribute('aria-activedescendant', activeOption?.id || '');
        if (status) {
            status.textContent = app.helpers.formatMessage
                ? app.helpers.formatMessage(app.i18n.t('command_palette_results'), { count: visibleCommands.length })
                : app.i18n.t('command_palette_results').replace('{count}', visibleCommands.length);
        }
        app.icons.refreshIcons(list);
        activeOption?.scrollIntoView({ block: 'nearest' });
    }

    function close() {
        const modal = document.getElementById('commandPaletteModal');
        if (!modal || modal.style.display !== 'flex') { return; }
        modal.style.display = 'none';
        document.getElementById('commandPaletteInput')?.setAttribute('aria-expanded', 'false');
        app.modals?.releaseFocus?.();
        previousFocus?.focus?.({ preventScroll: true });
        previousFocus = null;
    }

    function execute(index = activeIndex) {
        const command = visibleCommands[index];
        if (!command || !isCommandEnabled(command)) { return; }
        close();
        command.run();
    }

    function open() {
        const modal = document.getElementById('commandPaletteModal');
        const input = document.getElementById('commandPaletteInput');
        if (!modal || !input) { return; }
        previousFocus = document.activeElement;
        input.value = '';
        activeIndex = 0;
        modal.style.display = 'flex';
        input.setAttribute('aria-expanded', 'true');
        render();
        if (app.modals?.trapFocus) {
            app.modals.trapFocus(modal, input);
        } else {
            input.focus();
        }
    }

    function init() {
        if (initialized) { return; }
        const modal = document.getElementById('commandPaletteModal');
        const input = document.getElementById('commandPaletteInput');
        const list = document.getElementById('commandPaletteList');
        if (!modal || !input || !list) { return; }
        initialized = true;

        input.addEventListener('input', () => {
            activeIndex = 0;
            render();
        });
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (!visibleCommands.length) { return; }
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                activeIndex = findEnabledIndex(activeIndex + direction, direction);
                render();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                execute();
            }
        });
        list.addEventListener('mousemove', (event) => {
            const option = event.target.closest('[data-command-index]');
            if (!option) { return; }
            const index = Number(option.dataset.commandIndex);
            if (index !== activeIndex) {
                activeIndex = index;
                render();
            }
        });
        list.addEventListener('click', (event) => {
            const option = event.target.closest('[data-command-index]');
            if (option) { execute(Number(option.dataset.commandIndex)); }
        });
        modal.addEventListener('pointerdown', (event) => {
            if (event.target === modal) { close(); }
        });
    }

    return { init, open, close, render };
}
