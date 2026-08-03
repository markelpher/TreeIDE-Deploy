import { decryptTreeContent, encryptTreeContent, isEncryptedTreeContent } from '../src/main/project/treeCrypto.js';

describe('encrypted load flow', () => {
    it('detects when a dropped tree file needs a password', async () => {
        const sample = 'src/\n    index.js';
        const encrypted = await encryptTreeContent(sample, 'secret');
        expect(isEncryptedTreeContent(encrypted)).toBe(true);
        expect(await decryptTreeContent(encrypted, 'secret')).toBe(sample);
    });
});