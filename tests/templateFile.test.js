import {
    buildTemplateFilePayload,
    isProjectTreePath,
    isTreeTemplatePath,
    parseTemplateFile,
    serializeTemplateFile,
    TEMPLATE_FILE_FORMAT
} from '../src/shared/templateFile.js';

describe('templateFile', () => {
    const sample = {
        label: 'My Starter',
        tree: '{projectName}/\n    README.md',
        files: { '{projectName}/README.md': '# Hi' }
    };

    it('serializes and parses a template file', () => {
        const raw = serializeTemplateFile(sample);
        const parsed = parseTemplateFile(raw);
        expect(parsed.label).toBe('My Starter');
        expect(parsed.tree).toContain('{projectName}');
        expect(parsed.files['{projectName}/README.md']).toBe('# Hi');
    });

    it('builds a versioned payload', () => {
        const payload = buildTemplateFilePayload(sample);
        expect(payload.format).toBe(TEMPLATE_FILE_FORMAT);
        expect(payload.version).toBe(1);
    });

    it('falls back to name when label is missing', () => {
        const payload = buildTemplateFilePayload({
            name: 'Legacy Starter',
            tree: 'app/\n    README.md',
            files: {}
        });
        expect(payload.label).toBe('Legacy Starter');
    });

    it('distinguishes template paths from project .tree files', () => {
        expect(isTreeTemplatePath('starter.tree-template')).toBe(true);
        expect(isTreeTemplatePath('C:\\Models\\starter.tree-template')).toBe(true);
        expect(isProjectTreePath('project.tree')).toBe(true);
        expect(isProjectTreePath('starter.tree-template')).toBe(false);
        expect(isTreeTemplatePath('project.tree')).toBe(false);
    });

    it('rejects invalid template files', () => {
        expect(() => parseTemplateFile('')).toThrow('template_import_invalid');
        expect(() => parseTemplateFile('{}')).toThrow('template_import_invalid');
        expect(() => parseTemplateFile(JSON.stringify({ format: 'other', label: 'x', tree: '', files: {} })))
            .toThrow('template_import_invalid');
    });
});