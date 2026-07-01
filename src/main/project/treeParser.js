import fs from 'node:fs';
import { parseEditorContent } from '../../shared/helpers.js';

/** @param {string} content @returns {Object} */
export function parseTreeContent(content) {
    return parseEditorContent(content);
}

/** @param {string} filePath @returns {Object} */
export function parseTreeFile(filePath) {
    return parseTreeContent(fs.readFileSync(filePath, 'utf-8'));
}