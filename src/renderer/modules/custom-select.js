export function createCustomSelect(_app) {

// Shared outside click handler - closes all open selects
    let outsideClickHandler = null;
    let isOutsideHandlerAttached = false;
    let customSelectCount = 0;

    let activeDropdown = null;
    let repositionHandler = null;

    function detachRepositionHandler() {
        if (repositionHandler) {
            window.removeEventListener('resize', repositionHandler);
            window.removeEventListener('scroll', repositionHandler, true);
            repositionHandler = null;
        }
    }

    function positionDropdown(customSelect) {
        const trigger = customSelect.querySelector('.custom-select-trigger');
        const optionsContainer = customSelect.querySelector('.custom-select-options');
        if (!trigger || !optionsContainer) { return; }
        const rect = trigger.getBoundingClientRect();
        optionsContainer.style.position = 'fixed';
        optionsContainer.style.top = `${rect.bottom + 6}px`;
        optionsContainer.style.left = `${rect.left}px`;
        optionsContainer.style.width = `${rect.width}px`;
        optionsContainer.style.zIndex = '10000';
    }

    function resetDropdownPosition(customSelect) {
        const optionsContainer = customSelect.querySelector('.custom-select-options');
        if (!optionsContainer) { return; }
        optionsContainer.style.position = '';
        optionsContainer.style.top = '';
        optionsContainer.style.left = '';
        optionsContainer.style.width = '';
        optionsContainer.style.zIndex = '';
    }

    function closeDropdown(customSelect) {
        customSelect.classList.remove('open');
        const trigger = customSelect.querySelector('.custom-select-trigger');
        if (trigger) { trigger.setAttribute('aria-expanded', 'false'); }
        resetDropdownPosition(customSelect);
        if (activeDropdown === customSelect) {
            activeDropdown = null;
            detachRepositionHandler();
        }
    }

    function ensureOutsideClickHandler() {
        if (isOutsideHandlerAttached) {return;}
        outsideClickHandler = (e) => {
            if (!e.target.closest('.custom-select')) {
                document.querySelectorAll('.custom-select.open').forEach(closeDropdown);
            }
        };
        document.addEventListener('click', outsideClickHandler);
        isOutsideHandlerAttached = true;
    }

    function removeOutsideClickHandler() {
        if (outsideClickHandler && isOutsideHandlerAttached) {
            document.removeEventListener('click', outsideClickHandler);
            isOutsideHandlerAttached = false;
        }
    }

    function incrementCustomSelectCount() {
        customSelectCount++;
        ensureOutsideClickHandler();
    }

    function decrementCustomSelectCount() {
        customSelectCount = Math.max(0, customSelectCount - 1);
        if (customSelectCount === 0) {
            removeOutsideClickHandler();
        }
    }

    function createCustomSelect(selectElement) {
        if (!selectElement || selectElement.dataset.customized) {return null;}

        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        customSelect.dataset.for = selectElement.id;

        const trigger = document.createElement('div');
        trigger.className = 'custom-select-trigger';
        trigger.tabIndex = 0;
        trigger.setAttribute('role', 'combobox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-haspopup', 'listbox');
        if (selectElement.id) {
            const label = document.querySelector(`label[for="${selectElement.id}"]:not(.toggle-switch)`);
            if (label) {trigger.setAttribute('aria-labelledby', label.id || selectElement.id + '-label');}
        }

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'custom-select-options';
        optionsContainer.setAttribute('role', 'listbox');

        // Get initial selected option
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        trigger.textContent = selectedOption ? selectedOption.textContent : '';

        // Build options
        function buildOptions() {
            optionsContainer.textContent = '';
            const currentValue = selectElement.value;

            Array.from(selectElement.options).forEach(option => {
                const optionEl = document.createElement('div');
                optionEl.className = 'custom-select-option';
                optionEl.dataset.value = option.value;
                optionEl.textContent = option.textContent;
                optionEl.setAttribute('role', 'option');

                if (option.value === currentValue) {
                    optionEl.classList.add('selected');
                    optionEl.setAttribute('aria-selected', 'true');
                }

                optionEl.addEventListener('click', () => {
                    selectElement.value = option.value;
                    trigger.textContent = option.textContent;

                    // Update selected state
                    optionsContainer.querySelectorAll('.custom-select-option').forEach(o => {
                        o.classList.remove('selected');
                        o.removeAttribute('aria-selected');
                    });
                    optionEl.classList.add('selected');
                    optionEl.setAttribute('aria-selected', 'true');

                    // Close dropdown
                    closeDropdown(customSelect);

                    // Trigger change event on original select
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                });

                optionsContainer.appendChild(optionEl);
            });
        }

        buildOptions();

        function openDropdown() {
            document.querySelectorAll('.custom-select.open').forEach(s => {
                if (s !== customSelect) { closeDropdown(s); }
            });
            customSelect.classList.add('open');
            trigger.setAttribute('aria-expanded', 'true');
            positionDropdown(customSelect);
            activeDropdown = customSelect;
            detachRepositionHandler();
            repositionHandler = () => {
                if (customSelect.classList.contains('open')) {
                    positionDropdown(customSelect);
                }
            };
            window.addEventListener('resize', repositionHandler);
            window.addEventListener('scroll', repositionHandler, true);
        }

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = customSelect.classList.contains('open');
            if (isOpen) {closeDropdown(customSelect);}
            else {openDropdown();}
        });

        // Keyboard navigation
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                trigger.click();
            }
            if (e.key === 'Escape') {
                closeDropdown(customSelect);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const selected = optionsContainer.querySelector('.custom-select-option.selected');
                const next = selected ? selected.nextElementSibling : optionsContainer.firstElementChild;
                if (next) {next.click();}
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const selected = optionsContainer.querySelector('.custom-select-option.selected');
                const prev = selected ? selected.previousElementSibling : optionsContainer.lastElementChild;
                if (prev) {prev.click();}
            }
        });

        optionsContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        customSelect.appendChild(trigger);
        customSelect.appendChild(optionsContainer);

        // Hide original select; place custom control after it so flex
        // layouts that align the last child to the right still work.
        selectElement.style.display = 'none';
        selectElement.dataset.customized = 'true';
        selectElement.after(customSelect);

        incrementCustomSelectCount();

        return {
            element: customSelect,
            update: () => {
                const opt = selectElement.options[selectElement.selectedIndex];
                trigger.textContent = opt ? opt.textContent : '';
                optionsContainer.querySelectorAll('.custom-select-option').forEach(o => {
                    const isSelected = o.dataset.value === selectElement.value;
                    o.classList.toggle('selected', isSelected);
                    if (isSelected) {o.setAttribute('aria-selected', 'true');}
                    else {o.removeAttribute('aria-selected');}
                });
            },
            refreshOptions: buildOptions,
            destroy: () => {
                customSelect.remove();
                selectElement.style.display = '';
                delete selectElement.dataset.customized;
                decrementCustomSelectCount();
            }
        };
    }

    // Initialize all styled-selects
    function initCustomSelects() {
        const selects = document.querySelectorAll('.styled-select');
        const customSelects = {};

        selects.forEach(select => {
            if (select.dataset.customized) {return;}
            const instance = createCustomSelect(select);
            if (instance && select.id) {
                customSelects[select.id] = instance;
            }
        });

        return customSelects;
    }

    function refreshAllCustomSelects() {
        document.querySelectorAll('.custom-select').forEach(cs => {
            const selectId = cs.dataset.for;
            const selectEl = document.getElementById(selectId);
            if (!selectEl) {return;}
            const trigger = cs.querySelector('.custom-select-trigger');
            const optionsContainer = cs.querySelector('.custom-select-options');
            if (!trigger || !optionsContainer) {return;}

            // Rebuild options from current select state
            const currentValue = selectEl.value;
            const selectedOption = selectEl.options[selectEl.selectedIndex];
            trigger.textContent = selectedOption ? selectedOption.textContent : '';

            optionsContainer.textContent = '';
            Array.from(selectEl.options).forEach(option => {
                const optionEl = document.createElement('div');
                optionEl.className = 'custom-select-option';
                optionEl.dataset.value = option.value;
                optionEl.textContent = option.textContent;
                optionEl.setAttribute('role', 'option');

                if (option.value === currentValue) {
                    optionEl.classList.add('selected');
                    optionEl.setAttribute('aria-selected', 'true');
                }

                optionEl.addEventListener('click', () => {
                    selectEl.value = option.value;
                    trigger.textContent = option.textContent;
                    optionsContainer.querySelectorAll('.custom-select-option').forEach(o => {
                        o.classList.remove('selected');
                        o.removeAttribute('aria-selected');
                    });
                    optionEl.classList.add('selected');
                    optionEl.setAttribute('aria-selected', 'true');
                    closeDropdown(cs);
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                });

                optionsContainer.appendChild(optionEl);
            });
        });
    }

    return {
        init: initCustomSelects,
        create: createCustomSelect,
        refreshAll: refreshAllCustomSelects
    };

}
