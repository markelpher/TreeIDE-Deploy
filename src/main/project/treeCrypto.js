import crypto from 'node:crypto';

export const TREE_ENCRYPTED_V1_MAGIC = 'TREEIDE1';
export const TREE_ENCRYPTED_V2_MAGIC = 'TREEIDE2';
/** @deprecated Use TREE_ENCRYPTED_V2_MAGIC */
export const TREE_ENCRYPTED_MAGIC = TREE_ENCRYPTED_V2_MAGIC;

const CIPHER = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const TAG_LEN = 16;

const V1_SALT_LEN = 16;
const V2_SALT_LEN = 32;

/** @type {import('node:crypto').ScryptOptions} */
const V2_SCRYPT = {
    N: 262144,
    r: 8,
    p: 1,
    maxmem: 512 * 1024 * 1024
};

const V2_HEADER = {
    v: 2,
    kdf: 'scrypt',
    cipher: CIPHER,
    n: V2_SCRYPT.N,
    r: V2_SCRYPT.r,
    p: V2_SCRYPT.p,
    salt: V2_SALT_LEN,
    iv: IV_LEN
};

/**
 * @param {string} content
 * @returns {boolean}
 */
export function isEncryptedTreeContent(content) {
    if (typeof content !== 'string') { return false; }
    return content.startsWith(`${TREE_ENCRYPTED_V1_MAGIC}\n`)
        || content.startsWith(`${TREE_ENCRYPTED_V2_MAGIC}\n`);
}

/**
 * @param {string} password
 * @param {Buffer} salt
 * @param {import('node:crypto').ScryptOptions | undefined} scryptOptions
 * @returns {Buffer}
 */
function deriveKey(password, salt, scryptOptions) {
    return crypto.scryptSync(password, salt, KEY_LEN, scryptOptions);
}

/**
 * @param {Buffer} iv
 * @param {Buffer} plaintext
 * @param {Buffer} key
 * @returns {{ encrypted: Buffer, tag: Buffer }}
 */
function encryptAesGcm(iv, plaintext, key) {
    const cipher = crypto.createCipheriv(CIPHER, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return { encrypted, tag: cipher.getAuthTag() };
}

/**
 * @param {Buffer} payload
 * @param {Buffer} key
 * @returns {Buffer}
 */
function decryptAesGcm(payload, key) {
    if (payload.length < IV_LEN + TAG_LEN + 1) {
        throw new Error('Invalid encrypted tree payload');
    }
    const iv = payload.subarray(0, IV_LEN);
    const tag = payload.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const encrypted = payload.subarray(IV_LEN + TAG_LEN);
    const decipher = crypto.createDecipheriv(CIPHER, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * @param {string} content
 * @param {string} password
 * @returns {string}
 */
export function encryptTreeContent(content, password) {
    if (!password) {
        return content;
    }
    const salt = crypto.randomBytes(V2_SALT_LEN);
    const iv = crypto.randomBytes(IV_LEN);
    const key = deriveKey(password, salt, V2_SCRYPT);
    const { encrypted, tag } = encryptAesGcm(iv, Buffer.from(content, 'utf8'), key);
    const payload = Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
    const header = JSON.stringify(V2_HEADER);
    return `${TREE_ENCRYPTED_V2_MAGIC}\n${header}\n${payload}\n`;
}

/**
 * @param {string} content
 * @returns {{ version: 1 | 2, payloadB64: string, header?: typeof V2_HEADER }}
 */
function parseEncryptedTreeFile(content) {
    const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    if (lines.length < 2) {
        throw new Error('Invalid encrypted tree payload');
    }

    if (lines[0] === TREE_ENCRYPTED_V1_MAGIC) {
        return { version: 1, payloadB64: lines[1] };
    }

    if (lines[0] === TREE_ENCRYPTED_V2_MAGIC) {
        if (lines.length < 3) {
            throw new Error('Invalid encrypted tree payload');
        }
        const header = JSON.parse(lines[1]);
        return { version: 2, header, payloadB64: lines[2] };
    }

    throw new Error('Unsupported encrypted tree format');
}

/**
 * @param {string} content
 * @param {string} password
 * @returns {string}
 */
export function decryptTreeContent(content, password) {
    if (!isEncryptedTreeContent(content)) {
        return content;
    }

    const parsed = parseEncryptedTreeFile(content);
    const data = Buffer.from(parsed.payloadB64, 'base64');

    if (parsed.version === 1) {
        if (data.length < V1_SALT_LEN + IV_LEN + TAG_LEN + 1) {
            throw new Error('Invalid encrypted tree payload');
        }
        const salt = data.subarray(0, V1_SALT_LEN);
        const encryptedPayload = data.subarray(V1_SALT_LEN);
        const key = deriveKey(password, salt);
        return decryptAesGcm(encryptedPayload, key).toString('utf8');
    }

    const saltLen = parsed.header?.salt || V2_SALT_LEN;
    if (data.length < saltLen + IV_LEN + TAG_LEN + 1) {
        throw new Error('Invalid encrypted tree payload');
    }
    const salt = data.subarray(0, saltLen);
    const encryptedPayload = data.subarray(saltLen);
    const scryptOptions = parsed.header
        ? { N: parsed.header.n, r: parsed.header.r, p: parsed.header.p, maxmem: V2_SCRYPT.maxmem }
        : V2_SCRYPT;
    const key = deriveKey(password, salt, scryptOptions);
    return decryptAesGcm(encryptedPayload, key).toString('utf8');
}