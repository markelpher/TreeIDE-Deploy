import crypto from 'node:crypto';
import {
    TREE_ENCRYPTED_V1_MAGIC,
    TREE_ENCRYPTED_V2_MAGIC,
    decryptTreeContent,
    encryptTreeContent,
    isEncryptedTreeContent
} from '../src/main/project/treeCrypto.js';

describe('treeCrypto', () => {
    const sample = 'src/\n    index.js\nREADME.md';

    it('detects encrypted content', () => {
        expect(isEncryptedTreeContent(sample)).toBe(false);
        expect(isEncryptedTreeContent(encryptTreeContent(sample, 'secret'))).toBe(true);
    });

    it('encrypts with TREEIDE2 header and strong scrypt parameters', () => {
        const encrypted = encryptTreeContent(sample, 'my-password');
        expect(encrypted.startsWith(`${TREE_ENCRYPTED_V2_MAGIC}\n`)).toBe(true);
        const [, headerLine] = encrypted.split('\n');
        const header = JSON.parse(headerLine);
        expect(header.cipher).toBe('aes-256-gcm');
        expect(header.kdf).toBe('scrypt');
        expect(header.n).toBe(262144);
        expect(header.salt).toBe(32);
    });

    it('encrypts and decrypts tree content', () => {
        const encrypted = encryptTreeContent(sample, 'my-password');
        const decrypted = decryptTreeContent(encrypted, 'my-password');
        expect(decrypted).toBe(sample);
    });

    it('fails decryption with wrong password', () => {
        const encrypted = encryptTreeContent(sample, 'right');
        expect(() => decryptTreeContent(encrypted, 'wrong')).toThrow();
    });

    it('returns plain content when not encrypted', () => {
        expect(decryptTreeContent(sample, 'ignored')).toBe(sample);
    });

    it('decrypts legacy TREEIDE1 files', () => {
        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(12);
        const key = crypto.scryptSync('legacy-pass', salt, 32);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        const encrypted = Buffer.concat([cipher.update(sample, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        const payload = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
        const legacy = `${TREE_ENCRYPTED_V1_MAGIC}\n${payload}\n`;

        expect(isEncryptedTreeContent(legacy)).toBe(true);
        expect(decryptTreeContent(legacy, 'legacy-pass')).toBe(sample);
    });
});