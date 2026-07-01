import { frontendTemplates } from './frontend.js';
import { stacksTemplates } from './stacks.js';
import { systemsTemplates } from './systems.js';
import { nativeTemplates } from './native.js';

export const templatesData = {
    ...frontendTemplates,
    ...stacksTemplates,
    ...systemsTemplates,
    ...nativeTemplates
};