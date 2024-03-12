export declare const deriveKey: (secret: string, roomName: string) => Promise<CryptoKey>;
export declare function encrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array>;
export declare const encryptJson: (data: Object, key: CryptoKey) => Promise<Uint8Array>;
export declare function decrypt(data: Uint8Array, key: CryptoKey): Promise<Uint8Array>;
/**
 * @param {Uint8Array} data
 * @param {CryptoKey?} key
 * @return {PromiseLike<Object>} decrypted object
 */
export declare const decryptJson: (data: Uint8Array, key: CryptoKey) => Promise<any>;
