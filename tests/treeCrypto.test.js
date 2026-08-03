import {
    TREE_ENCRYPTED_V2_MAGIC,
    decryptTreeContent,
    encryptTreeContent,
    isEncryptedTreeContent
} from '../src/main/project/treeCrypto.js';
import { parseEditorContent } from '../src/shared/helpers.js';

describe('treeCrypto', () => {
    const sample = 'src/\n    index.js\nREADME.md';

    it('detects encrypted content', async () => {
        expect(isEncryptedTreeContent(sample)).toBe(false);
        expect(isEncryptedTreeContent(await encryptTreeContent(sample, 'secret'))).toBe(true);
    });

    it('encrypts with a TREEIDE2 authenticated Argon2id profile', async () => {
        const encrypted = await encryptTreeContent(sample, 'my-password');
        expect(encrypted.startsWith(`${TREE_ENCRYPTED_V2_MAGIC}\n`)).toBe(true);
        const [, headerLine] = encrypted.split('\n');
        const header = JSON.parse(headerLine);
        expect(header.cipher).toBe('aes-256-gcm');
        expect(header.kdf).toBe('argon2id');
        expect(header.memory).toBe(262144);
        expect(header.passes).toBe(4);
        expect(header.parallelism).toBe(4);
        expect(header.salt).toBe(32);
    });

    it('encrypts and decrypts tree content', async () => {
        const encrypted = await encryptTreeContent(sample, 'my-password');
        const decrypted = await decryptTreeContent(encrypted, 'my-password');
        expect(decrypted).toBe(sample);
    });

    it('fails decryption with wrong password', async () => {
        const encrypted = await encryptTreeContent(sample, 'right');
        await expect(decryptTreeContent(encrypted, 'wrong')).rejects.toThrow();
    });

    it('authenticates the TREEIDE2 cryptographic header', async () => {
        const encrypted = await encryptTreeContent(sample, 'right');
        const tampered = encrypted.replace(
            '"v":2,"kdf":"argon2id"',
            '"kdf":"argon2id","v":2'
        );
        await expect(decryptTreeContent(tampered, 'right')).rejects.toThrow();
    });

    it('keeps original Legacy plaintext files unchanged', async () => {
        const legacyTabs = 'tabs/\n\tcontroller/\n\tmodels/\n\t\tUser.py';
        const legacyDots = 'dots/\n...controller/\n......User.py';
        expect(isEncryptedTreeContent(legacyTabs)).toBe(false);
        expect(isEncryptedTreeContent(legacyDots)).toBe(false);
        expect(await decryptTreeContent(legacyTabs, 'ignored')).toBe(legacyTabs);
        expect(await decryptTreeContent(legacyDots, 'ignored')).toBe(legacyDots);
        expect(parseEditorContent(legacyTabs)).toEqual({
            'tabs/': {
                'controller/': {},
                'models/': { 'User.py': {} }
            }
        });
        expect(parseEditorContent(legacyDots)).toEqual({
            'dots/': {
                'controller/': { 'User.py': {} }
            }
        });
    });
});
