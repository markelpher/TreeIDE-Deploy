import crypto from 'node:crypto';
import { argon2id as argon2idWasm } from 'hash-wasm';

export const TREE_ENCRYPTED_V2_MAGIC = 'TREEIDE2';
export const TREE_ENCRYPTED_MAGIC = TREE_ENCRYPTED_V2_MAGIC;

const CIPHER = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

const V2_SALT_LEN = 32;

// High-strength password-based profile. AES-256 remains resistant to known
// quantum cryptanalysis at a practical security margin; Argon2id raises the
// cost of password guessing. This is not a public-key ML-KEM scheme.
const V2_ARGON2 = {
    memory: 256 * 1024,
    passes: 4,
    parallelism: 4,
    tagLength: KEY_LEN
};

const V2_HEADER = {
    v: 2,
    kdf: 'argon2id',
    cipher: CIPHER,
    memory: V2_ARGON2.memory,
    passes: V2_ARGON2.passes,
    parallelism: V2_ARGON2.parallelism,
    tagLength: V2_ARGON2.tagLength,
    salt: V2_SALT_LEN,
    iv: IV_LEN,
    authTag: TAG_LEN
};

/** Cached probe: Electron/BoringSSL exposes argon2Sync but throws NOT_SUPPORTED. */
let nativeArgon2Supported;

function supportsNativeArgon2() {
    if (nativeArgon2Supported !== undefined) {
        return nativeArgon2Supported;
    }
    if (typeof crypto.argon2Sync !== 'function') {
        nativeArgon2Supported = false;
        return false;
    }
    try {
        crypto.argon2Sync('argon2id', {
            message: Buffer.alloc(1),
            nonce: Buffer.alloc(8),
            parallelism: 1,
            tagLength: 32,
            memory: 8,
            passes: 1
        });
        nativeArgon2Supported = true;
    } catch {
        // Electron/BoringSSL exposes the API but throws ERR_CRYPTO_ARGON2_NOT_SUPPORTED.
        nativeArgon2Supported = false;
    }
    return nativeArgon2Supported;
}

/**
 * @param {string} content
 * @returns {boolean}
 */
export function isEncryptedTreeContent(content) {
    if (typeof content !== 'string') { return false; }
    return content.startsWith(`${TREE_ENCRYPTED_V2_MAGIC}\n`);
}

/**
 * Derive an AES-256 key with Argon2id.
 * Prefers Node's OpenSSL-backed argon2 when available; falls back to hash-wasm
 * (required in Electron, which ships BoringSSL without Argon2).
 * @param {string} password
 * @param {Buffer} salt
 * @returns {Promise<Buffer>}
 */
async function deriveArgon2idKey(password, salt) {
    if (supportsNativeArgon2()) {
        return crypto.argon2Sync('argon2id', {
            message: Buffer.from(password, 'utf8'),
            nonce: salt,
            parallelism: V2_ARGON2.parallelism,
            tagLength: V2_ARGON2.tagLength,
            memory: V2_ARGON2.memory,
            passes: V2_ARGON2.passes
        });
    }

    const key = await argon2idWasm({
        password,
        salt: new Uint8Array(salt),
        parallelism: V2_ARGON2.parallelism,
        iterations: V2_ARGON2.passes,
        memorySize: V2_ARGON2.memory,
        hashLength: V2_ARGON2.tagLength,
        outputType: 'binary'
    });
    return Buffer.from(key);
}

/**
 * @param {Buffer} iv
 * @param {Buffer} plaintext
 * @param {Buffer} key
 * @returns {{ encrypted: Buffer, tag: Buffer }}
 */
function encryptAesGcm(iv, plaintext, key, additionalData) {
    const cipher = crypto.createCipheriv(CIPHER, key, iv);
    if (additionalData) {
        cipher.setAAD(additionalData);
    }
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return { encrypted, tag: cipher.getAuthTag() };
}

/**
 * @param {Buffer} payload
 * @param {Buffer} key
 * @returns {Buffer}
 */
function decryptAesGcm(payload, key, additionalData) {
    if (payload.length < IV_LEN + TAG_LEN + 1) {
        throw new Error('Invalid encrypted tree payload');
    }
    const iv = payload.subarray(0, IV_LEN);
    const tag = payload.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const encrypted = payload.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(CIPHER, key, iv);
    if (additionalData) {
        decipher.setAAD(additionalData);
    }
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * @param {string} content
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function encryptTreeContent(content, password) {
    if (!password) {
        return content;
    }
    const salt = crypto.randomBytes(V2_SALT_LEN);
    const iv = crypto.randomBytes(IV_LEN);
    const header = JSON.stringify(V2_HEADER);
    const additionalData = Buffer.from(`${TREE_ENCRYPTED_V2_MAGIC}\n${header}`, 'utf8');
    const key = await deriveArgon2idKey(password, salt);
    const { encrypted, tag } = encryptAesGcm(iv, Buffer.from(content, 'utf8'), key, additionalData);
    const payload = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
    return `${TREE_ENCRYPTED_V2_MAGIC}\n${header}\n${payload}\n`;
}

/**
 * @param {string} content
 * @returns {{ payloadB64: string, header: Record<string, string | number>, headerLine: string }}
 */
function parseEncryptedTreeFile(content) {
    const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    if (lines.length < 3 || lines[0] !== TREE_ENCRYPTED_V2_MAGIC) {
        throw new Error('Invalid encrypted tree payload');
    }
    const headerLine = lines[1];
    const header = JSON.parse(headerLine);
    return { header, headerLine, payloadB64: lines[2] };
}

/**
 * @param {string} content
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function decryptTreeContent(content, password) {
    if (!isEncryptedTreeContent(content)) {
        return content;
    }

    const parsed = parseEncryptedTreeFile(content);
    const data = Buffer.from(parsed.payloadB64, 'base64');

    const header = parsed.header;
    const validHeader = header?.v === V2_HEADER.v
        && header?.kdf === V2_HEADER.kdf
        && header?.cipher === V2_HEADER.cipher
        && header?.memory === V2_HEADER.memory
        && header?.passes === V2_HEADER.passes
        && header?.parallelism === V2_HEADER.parallelism
        && header?.tagLength === V2_HEADER.tagLength
        && header?.salt === V2_HEADER.salt
        && header?.iv === V2_HEADER.iv
        && header?.authTag === V2_HEADER.authTag;
    if (!validHeader || data.length < V2_SALT_LEN + IV_LEN + TAG_LEN + 1) {
        throw new Error('Invalid encrypted tree payload');
    }
    const salt = data.subarray(0, V2_SALT_LEN);
    const encryptedPayload = data.subarray(V2_SALT_LEN);
    const key = await deriveArgon2idKey(password, salt);
    const additionalData = Buffer.from(`${TREE_ENCRYPTED_V2_MAGIC}\n${parsed.headerLine}`, 'utf8');
    return decryptAesGcm(encryptedPayload, key, additionalData).toString('utf8');
}
