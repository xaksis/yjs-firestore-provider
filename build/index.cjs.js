'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var firestore = require('@firebase/firestore');
var Y = require('yjs');
var SimplePeer = require('simple-peer/simplepeer.min.js');
var awarenessProtocol = require('y-protocols/awareness');
var firestore$1 = require('firebase/firestore');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
    if (e && e.__esModule) return e;
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n["default"] = e;
    return Object.freeze(n);
}

var Y__namespace = /*#__PURE__*/_interopNamespace(Y);
var SimplePeer__default = /*#__PURE__*/_interopDefaultLegacy(SimplePeer);
var awarenessProtocol__namespace = /*#__PURE__*/_interopNamespace(awarenessProtocol);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

/**
 * Utility module to work with key-value stores.
 *
 * @module map
 */

/**
 * Creates a new Map instance.
 *
 * @function
 * @return {Map<any, any>}
 *
 * @function
 */
const create$4 = () => new Map();

/**
 * Get map property. Create T if property is undefined and set T on map.
 *
 * ```js
 * const listeners = map.setIfUndefined(events, 'eventName', set.create)
 * listeners.add(listener)
 * ```
 *
 * @function
 * @template V,K
 * @template {Map<K,V>} MAP
 * @param {MAP} map
 * @param {K} key
 * @param {function():V} createT
 * @return {V}
 */
const setIfUndefined = (map, key, createT) => {
  let set = map.get(key);
  if (set === undefined) {
    map.set(key, set = createT());
  }
  return set
};

/**
 * Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
 *
 * @function
 * @template K
 * @template V
 * @template R
 * @param {Map<K,V>} m
 * @param {function(V,K):R} f
 * @return {Array<R>}
 */
const map = (m, f) => {
  const res = [];
  for (const [key, value] of m) {
    res.push(f(value, key));
  }
  return res
};

/**
 * Utility module to work with sets.
 *
 * @module set
 */

const create$3 = () => new Set();

/**
 * Utility module to work with Arrays.
 *
 * @module array
 */

/**
 * Transforms something array-like to an actual Array.
 *
 * @function
 * @template T
 * @param {ArrayLike<T>|Iterable<T>} arraylike
 * @return {T}
 */
const from = Array.from;

/**
 * Observable class prototype.
 *
 * @module observable
 */

/**
 * Handles named events.
 *
 * @template N
 */
class Observable {
  constructor () {
    /**
     * Some desc.
     * @type {Map<N, any>}
     */
    this._observers = create$4();
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  on (name, f) {
    setIfUndefined(this._observers, name, create$3).add(f);
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  once (name, f) {
    /**
     * @param  {...any} args
     */
    const _f = (...args) => {
      this.off(name, _f);
      f(...args);
    };
    this.on(name, _f);
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  off (name, f) {
    const observers = this._observers.get(name);
    if (observers !== undefined) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }

  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @param {N} name The event name.
   * @param {Array<any>} args The arguments that are applied to the event listener.
   */
  emit (name, args) {
    // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
    return from((this._observers.get(name) || create$4()).values()).forEach(f => f(...args))
  }

  destroy () {
    this._observers = create$4();
  }
}

/**
 * An estimate for the difference in milliseconds between the local clock
 * and the server's clock
 */
let delta = null;
/**
 * Get an approximation of the current server time.
 * @param firebaseApp The FirebaseApp
 * @param path The path to a document that can be used to get the server time
 * @returns An approximation of the current server time
 */
function currentTime(firebaseApp, path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (delta !== null) {
            return Date.now() + delta;
        }
        try {
            const db = firestore.getFirestore(firebaseApp);
            const ref = firestore.doc(db, path);
            const before = Date.now();
            yield firestore.setDoc(ref, { now: firestore.serverTimestamp() });
            const after = Date.now();
            const avg = Math.floor((before + after) / 2);
            const nowDoc = yield firestore.getDoc(ref);
            if (nowDoc.exists()) {
                const serverNow = nowDoc.data().now;
                const serverUnixTime = serverNow.seconds * 1000 +
                    Math.floor(serverNow.nanoseconds / 1000000);
                delta = serverUnixTime - avg;
                yield firestore.deleteDoc(ref);
                return Date.now() + delta;
            }
        }
        catch (error) {
            console.log("An error occurred while getting the current time", { error, path });
        }
        // In theory we should never get here, but just in case, fallback
        // to the client time.
        return Date.now();
    });
}
/**
 * Convert a Firestore Timestamp into the number of milliseconds since the
 * Unix epoch in UTC time.
 * @param timestamp A Firestore Timestamp
 * @returns The number of milliseconds since the Unix epoch
 */
function timeSinceEpoch(timestamp) {
    return timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000);
}

const YJS_TIME = "/yjs/time";
function getTimePath(basePath) {
    return basePath + YJS_TIME;
}

/**
 * Utility module to work with strings.
 *
 * @module string
 */

const fromCharCode = String.fromCharCode;

/**
 * @param {string} s
 * @return {string}
 */
const toLowerCase = s => s.toLowerCase();

const trimLeftRegex = /^\s*/g;

/**
 * @param {string} s
 * @return {string}
 */
const trimLeft = s => s.replace(trimLeftRegex, '');

const fromCamelCaseRegex = /([A-Z])/g;

/**
 * @param {string} s
 * @param {string} separator
 * @return {string}
 */
const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Polyfill = str => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  const buf = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buf[i] = /** @type {number} */ (encodedString.codePointAt(i));
  }
  return buf
};

/* c8 ignore next */
const utf8TextEncoder = /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null);

/**
 * @param {string} str
 * @return {Uint8Array}
 */
const _encodeUtf8Native = str => utf8TextEncoder.encode(str);

/**
 * @param {string} str
 * @return {Uint8Array}
 */
/* c8 ignore next */
const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;

/* c8 ignore next */
let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

/* c8 ignore start */
if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
  // Safari doesn't handle BOM correctly.
  // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
  // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
  // Another issue is that from then on no BOM chars are recognized anymore
  /* c8 ignore next */
  utf8TextDecoder = null;
}

/**
 * Often used conditions.
 *
 * @module conditions
 */

/**
 * @template T
 * @param {T|null|undefined} v
 * @return {T|null}
 */
/* c8 ignore next */
const undefinedToNull = v => v === undefined ? null : v;

/* global localStorage, addEventListener */

/**
 * Isomorphic variable storage.
 *
 * Uses LocalStorage in the browser and falls back to in-memory storage.
 *
 * @module storage
 */

/* c8 ignore start */
class VarStoragePolyfill {
  constructor () {
    this.map = new Map();
  }

  /**
   * @param {string} key
   * @param {any} newValue
   */
  setItem (key, newValue) {
    this.map.set(key, newValue);
  }

  /**
   * @param {string} key
   */
  getItem (key) {
    return this.map.get(key)
  }
}
/* c8 ignore stop */

/**
 * @type {any}
 */
let _localStorage = new VarStoragePolyfill();
let usePolyfill = true;

/* c8 ignore start */
try {
  // if the same-origin rule is violated, accessing localStorage might thrown an error
  if (typeof localStorage !== 'undefined') {
    _localStorage = localStorage;
    usePolyfill = false;
  }
} catch (e) { }
/* c8 ignore stop */

/**
 * This is basically localStorage in browser, or a polyfill in nodejs
 */
/* c8 ignore next */
const varStorage = _localStorage;

/**
 * A polyfill for `addEventListener('storage', event => {..})` that does nothing if the polyfill is being used.
 *
 * @param {function({ key: string, newValue: string, oldValue: string }): void} eventHandler
 * @function
 */
/* c8 ignore next */
const onChange = eventHandler => usePolyfill || addEventListener('storage', /** @type {any} */ (eventHandler));

/**
 * Common functions and function call helpers.
 *
 * @module function
 */

const nop = () => {};

/**
 * @template V
 * @template {V} OPTS
 *
 * @param {V} value
 * @param {Array<OPTS>} options
 */
// @ts-ignore
const isOneOf = (value, options) => options.includes(value);
/* c8 ignore stop */

/**
 * Isomorphic module to work access the environment (query params, env variables).
 *
 * @module map
 */

/* c8 ignore next */
// @ts-ignore
const isNode = typeof process !== 'undefined' && process.release &&
  /node|io\.js/.test(process.release.name);
/* c8 ignore next */
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && !isNode;
/* c8 ignore next 3 */
typeof navigator !== 'undefined'
  ? /Mac/.test(navigator.platform)
  : false;

/**
 * @type {Map<string,string>}
 */
let params;

/* c8 ignore start */
const computeParams = () => {
  if (params === undefined) {
    if (isNode) {
      params = create$4();
      const pargs = process.argv;
      let currParamName = null;
      for (let i = 0; i < pargs.length; i++) {
        const parg = pargs[i];
        if (parg[0] === '-') {
          if (currParamName !== null) {
            params.set(currParamName, '');
          }
          currParamName = parg;
        } else {
          if (currParamName !== null) {
            params.set(currParamName, parg);
            currParamName = null;
          }
        }
      }
      if (currParamName !== null) {
        params.set(currParamName, '');
      }
      // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
    } else if (typeof location === 'object') {
      params = create$4(); // eslint-disable-next-line no-undef
      (location.search || '?').slice(1).split('&').forEach((kv) => {
        if (kv.length !== 0) {
          const [key, value] = kv.split('=');
          params.set(`--${fromCamelCase(key, '-')}`, value);
          params.set(`-${fromCamelCase(key, '-')}`, value);
        }
      });
    } else {
      params = create$4();
    }
  }
  return params
};
/* c8 ignore stop */

/**
 * @param {string} name
 * @return {boolean}
 */
/* c8 ignore next */
const hasParam = (name) => computeParams().has(name);

/**
 * @param {string} name
 * @return {string|null}
 */
/* c8 ignore next 4 */
const getVariable = (name) =>
  isNode
    ? undefinedToNull(process.env[name.toUpperCase()])
    : undefinedToNull(varStorage.getItem(name));

/**
 * @param {string} name
 * @return {boolean}
 */
/* c8 ignore next 2 */
const hasConf = (name) =>
  hasParam('--' + name) || getVariable(name) !== null;

/* c8 ignore next */
hasConf('production');

/* c8 ignore next 2 */
const forceColor = isNode &&
  isOneOf(process.env.FORCE_COLOR, ['true', '1', '2']);

/* c8 ignore start */
const supportsColor = !hasParam('no-colors') &&
  (!isNode || process.stdout.isTTY || forceColor) && (
  !isNode || hasParam('color') || forceColor ||
    getVariable('COLORTERM') !== null ||
    (getVariable('TERM') || '').includes('color')
);
/* c8 ignore stop */

/**
 * Common Math expressions.
 *
 * @module math
 */

const floor = Math.floor;
const abs = Math.abs;

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The smaller element of a and b
 */
const min = (a, b) => a < b ? a : b;

/**
 * @function
 * @param {number} a
 * @param {number} b
 * @return {number} The bigger element of a and b
 */
const max = (a, b) => a > b ? a : b;

/**
 * @param {number} n
 * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
 */
const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0;

/* eslint-env browser */
const BIT7 = 64;
const BIT8 = 128;
const BITS6 = 63;
const BITS7 = 127;
/**
 * @type {number}
 */
const BITS31 = 0x7FFFFFFF;

/**
 * Utility helpers for working with numbers.
 *
 * @module number
 */

const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * @module number
 */

/* c8 ignore next */
const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && floor(num) === num);

/**
 * Efficient schema-less binary encoding with support for variable length encoding.
 *
 * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = new encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = new decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module encoding
 */

/**
 * A BinaryEncoder handles the encoding to an Uint8Array.
 */
class Encoder {
  constructor () {
    this.cpos = 0;
    this.cbuf = new Uint8Array(100);
    /**
     * @type {Array<Uint8Array>}
     */
    this.bufs = [];
  }
}

/**
 * @function
 * @return {Encoder}
 */
const createEncoder = () => new Encoder();

/**
 * The current length of the encoded data.
 *
 * @function
 * @param {Encoder} encoder
 * @return {number}
 */
const length = encoder => {
  let len = encoder.cpos;
  for (let i = 0; i < encoder.bufs.length; i++) {
    len += encoder.bufs[i].length;
  }
  return len
};

/**
 * Transform to Uint8Array.
 *
 * @function
 * @param {Encoder} encoder
 * @return {Uint8Array} The created ArrayBuffer.
 */
const toUint8Array = encoder => {
  const uint8arr = new Uint8Array(length(encoder));
  let curPos = 0;
  for (let i = 0; i < encoder.bufs.length; i++) {
    const d = encoder.bufs[i];
    uint8arr.set(d, curPos);
    curPos += d.length;
  }
  uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
  return uint8arr
};

/**
 * Verify that it is possible to write `len` bytes wtihout checking. If
 * necessary, a new Buffer with the required length is attached.
 *
 * @param {Encoder} encoder
 * @param {number} len
 */
const verifyLen = (encoder, len) => {
  const bufferLen = encoder.cbuf.length;
  if (bufferLen - encoder.cpos < len) {
    encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
    encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
    encoder.cpos = 0;
  }
};

/**
 * Write one byte to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The byte that is to be encoded.
 */
const write = (encoder, num) => {
  const bufferLen = encoder.cbuf.length;
  if (encoder.cpos === bufferLen) {
    encoder.bufs.push(encoder.cbuf);
    encoder.cbuf = new Uint8Array(bufferLen * 2);
    encoder.cpos = 0;
  }
  encoder.cbuf[encoder.cpos++] = num;
};

/**
 * Write one byte as an unsigned integer.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeUint8 = write;

/**
 * Write a variable length unsigned integer. Max encodable integer is 2^53.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeVarUint = (encoder, num) => {
  while (num > BITS7) {
    write(encoder, BIT8 | (BITS7 & num));
    num = floor(num / 128); // shift >>> 7
  }
  write(encoder, BITS7 & num);
};

/**
 * Write a variable length integer.
 *
 * We use the 7th bit instead for signaling that this is a negative number.
 *
 * @function
 * @param {Encoder} encoder
 * @param {number} num The number that is to be encoded.
 */
const writeVarInt = (encoder, num) => {
  const isNegative = isNegativeZero(num);
  if (isNegative) {
    num = -num;
  }
  //             |- whether to continue reading         |- whether is negative     |- number
  write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num));
  num = floor(num / 64); // shift >>> 6
  // We don't need to consider the case of num === 0 so we can use a different
  // pattern here than above.
  while (num > 0) {
    write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num));
    num = floor(num / 128); // shift >>> 7
  }
};

/**
 * A cache to store strings temporarily
 */
const _strBuffer = new Uint8Array(30000);
const _maxStrBSize = _strBuffer.length / 3;

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringNative = (encoder, str) => {
  if (str.length < _maxStrBSize) {
    // We can encode the string into the existing buffer
    /* c8 ignore next */
    const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
    writeVarUint(encoder, written);
    for (let i = 0; i < written; i++) {
      write(encoder, _strBuffer[i]);
    }
  } else {
    writeVarUint8Array(encoder, encodeUtf8(str));
  }
};

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
const _writeVarStringPolyfill = (encoder, str) => {
  const encodedString = unescape(encodeURIComponent(str));
  const len = encodedString.length;
  writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    write(encoder, /** @type {number} */ (encodedString.codePointAt(i)));
  }
};

/**
 * Write a variable length string.
 *
 * @function
 * @param {Encoder} encoder
 * @param {String} str The string that is to be encoded.
 */
/* c8 ignore next */
const writeVarString = (utf8TextEncoder && utf8TextEncoder.encodeInto) ? _writeVarStringNative : _writeVarStringPolyfill;

/**
 * Append fixed-length Uint8Array to the encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeUint8Array = (encoder, uint8Array) => {
  const bufferLen = encoder.cbuf.length;
  const cpos = encoder.cpos;
  const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
  const rightCopyLen = uint8Array.length - leftCopyLen;
  encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
  encoder.cpos += leftCopyLen;
  if (rightCopyLen > 0) {
    // Still something to write, write right half..
    // Append new buffer
    encoder.bufs.push(encoder.cbuf);
    // must have at least size of remaining buffer
    encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
    // copy array
    encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
    encoder.cpos = rightCopyLen;
  }
};

/**
 * Append an Uint8Array to Encoder.
 *
 * @function
 * @param {Encoder} encoder
 * @param {Uint8Array} uint8Array
 */
const writeVarUint8Array = (encoder, uint8Array) => {
  writeVarUint(encoder, uint8Array.byteLength);
  writeUint8Array(encoder, uint8Array);
};

/**
 * Create an DataView of the next `len` bytes. Use it to write data after
 * calling this function.
 *
 * ```js
 * // write float32 using DataView
 * const dv = writeOnDataView(encoder, 4)
 * dv.setFloat32(0, 1.1)
 * // read float32 using DataView
 * const dv = readFromDataView(encoder, 4)
 * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
 * ```
 *
 * @param {Encoder} encoder
 * @param {number} len
 * @return {DataView}
 */
const writeOnDataView = (encoder, len) => {
  verifyLen(encoder, len);
  const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
  encoder.cpos += len;
  return dview
};

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);

/**
 * @param {Encoder} encoder
 * @param {number} num
 */
const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);

/**
 * @param {Encoder} encoder
 * @param {bigint} num
 */
const writeBigInt64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigInt64(0, num, false);

const floatTestBed = new DataView(new ArrayBuffer(4));
/**
 * Check if a number can be encoded as a 32 bit float.
 *
 * @param {number} num
 * @return {boolean}
 */
const isFloat32 = num => {
  floatTestBed.setFloat32(0, num);
  return floatTestBed.getFloat32(0) === num
};

/**
 * Encode data with efficient binary format.
 *
 * Differences to JSON:
 * • Transforms data to a binary format (not to a string)
 * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
 * • Numbers are efficiently encoded either as a variable length integer, as a
 *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
 *
 * Encoding table:
 *
 * | Data Type           | Prefix   | Encoding Method    | Comment |
 * | ------------------- | -------- | ------------------ | ------- |
 * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
 * | null                | 126      |                    | |
 * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
 * | float32             | 124      | writeFloat32       | |
 * | float64             | 123      | writeFloat64       | |
 * | bigint              | 122      | writeBigInt64      | |
 * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
 * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
 * | string              | 119      | writeVarString     | |
 * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
 * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
 * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
 *
 * Reasons for the decreasing prefix:
 * We need the first bit for extendability (later we may want to encode the
 * prefix with writeVarUint). The remaining 7 bits are divided as follows:
 * [0-30]   the beginning of the data range is used for custom purposes
 *          (defined by the function that uses this library)
 * [31-127] the end of the data range is used for data encoding by
 *          lib0/encoding.js
 *
 * @param {Encoder} encoder
 * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
 */
const writeAny = (encoder, data) => {
  switch (typeof data) {
    case 'string':
      // TYPE 119: STRING
      write(encoder, 119);
      writeVarString(encoder, data);
      break
    case 'number':
      if (isInteger(data) && abs(data) <= BITS31) {
        // TYPE 125: INTEGER
        write(encoder, 125);
        writeVarInt(encoder, data);
      } else if (isFloat32(data)) {
        // TYPE 124: FLOAT32
        write(encoder, 124);
        writeFloat32(encoder, data);
      } else {
        // TYPE 123: FLOAT64
        write(encoder, 123);
        writeFloat64(encoder, data);
      }
      break
    case 'bigint':
      // TYPE 122: BigInt
      write(encoder, 122);
      writeBigInt64(encoder, data);
      break
    case 'object':
      if (data === null) {
        // TYPE 126: null
        write(encoder, 126);
      } else if (data instanceof Array) {
        // TYPE 117: Array
        write(encoder, 117);
        writeVarUint(encoder, data.length);
        for (let i = 0; i < data.length; i++) {
          writeAny(encoder, data[i]);
        }
      } else if (data instanceof Uint8Array) {
        // TYPE 116: ArrayBuffer
        write(encoder, 116);
        writeVarUint8Array(encoder, data);
      } else {
        // TYPE 118: Object
        write(encoder, 118);
        const keys = Object.keys(data);
        writeVarUint(encoder, keys.length);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          writeVarString(encoder, key);
          writeAny(encoder, data[key]);
        }
      }
      break
    case 'boolean':
      // TYPE 120/121: boolean (true/false)
      write(encoder, data ? 120 : 121);
      break
    default:
      // TYPE 127: undefined
      write(encoder, 127);
  }
};

/**
 * Error helpers.
 *
 * @module error
 */

/**
 * @param {string} s
 * @return {Error}
 */
/* c8 ignore next */
const create$2 = s => new Error(s);

/**
 * Efficient schema-less binary decoding with support for variable length encoding.
 *
 * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
 *
 * Encodes numbers in little-endian order (least to most significant byte order)
 * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
 * which is also used in Protocol Buffers.
 *
 * ```js
 * // encoding step
 * const encoder = new encoding.createEncoder()
 * encoding.writeVarUint(encoder, 256)
 * encoding.writeVarString(encoder, 'Hello world!')
 * const buf = encoding.toUint8Array(encoder)
 * ```
 *
 * ```js
 * // decoding step
 * const decoder = new decoding.createDecoder(buf)
 * decoding.readVarUint(decoder) // => 256
 * decoding.readVarString(decoder) // => 'Hello world!'
 * decoding.hasContent(decoder) // => false - all data is read
 * ```
 *
 * @module decoding
 */

const errorUnexpectedEndOfArray = create$2('Unexpected end of array');
const errorIntegerOutOfRange = create$2('Integer out of Range');

/**
 * A Decoder handles the decoding of an Uint8Array.
 */
class Decoder {
  /**
   * @param {Uint8Array} uint8Array Binary data to decode
   */
  constructor (uint8Array) {
    /**
     * Decoding target.
     *
     * @type {Uint8Array}
     */
    this.arr = uint8Array;
    /**
     * Current decoding position.
     *
     * @type {number}
     */
    this.pos = 0;
  }
}

/**
 * @function
 * @param {Uint8Array} uint8Array
 * @return {Decoder}
 */
const createDecoder = uint8Array => new Decoder(uint8Array);

/**
 * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 *
 * @function
 * @param {Decoder} decoder The decoder instance
 * @param {number} len The length of bytes to read
 * @return {Uint8Array}
 */
const readUint8Array = (decoder, len) => {
  const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
  decoder.pos += len;
  return view
};

/**
 * Read variable length Uint8Array.
 *
 * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
 *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
 *
 * @function
 * @param {Decoder} decoder
 * @return {Uint8Array}
 */
const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

/**
 * Read one byte as unsigned integer.
 * @function
 * @param {Decoder} decoder The decoder instance
 * @return {number} Unsigned 8-bit integer
 */
const readUint8 = decoder => decoder.arr[decoder.pos++];

/**
 * Read unsigned integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
const readVarUint = decoder => {
  let num = 0;
  let mult = 1;
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    const r = decoder.arr[decoder.pos++];
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & BITS7) * mult; // shift $r << (7*#iterations) and add it to num
    mult *= 128; // next iteration, shift 7 "more" to the left
    if (r < BIT8) {
      return num
    }
    /* c8 ignore start */
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange
    }
    /* c8 ignore stop */
  }
  throw errorUnexpectedEndOfArray
};

/**
 * Read signed integer (32bit) with variable length.
 * 1/8th of the storage is used as encoding overhead.
 *  * numbers < 2^7 is stored in one bytlength
 *  * numbers < 2^14 is stored in two bylength
 * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
 *
 * @function
 * @param {Decoder} decoder
 * @return {number} An unsigned integer.length
 */
const readVarInt = decoder => {
  let r = decoder.arr[decoder.pos++];
  let num = r & BITS6;
  let mult = 64;
  const sign = (r & BIT7) > 0 ? -1 : 1;
  if ((r & BIT8) === 0) {
    // don't continue reading
    return sign * num
  }
  const len = decoder.arr.length;
  while (decoder.pos < len) {
    r = decoder.arr[decoder.pos++];
    // num = num | ((r & binary.BITS7) << len)
    num = num + (r & BITS7) * mult;
    mult *= 128;
    if (r < BIT8) {
      return sign * num
    }
    /* c8 ignore start */
    if (num > MAX_SAFE_INTEGER) {
      throw errorIntegerOutOfRange
    }
    /* c8 ignore stop */
  }
  throw errorUnexpectedEndOfArray
};

/**
 * We don't test this function anymore as we use native decoding/encoding by default now.
 * Better not modify this anymore..
 *
 * Transforming utf8 to a string is pretty expensive. The code performs 10x better
 * when String.fromCodePoint is fed with all characters as arguments.
 * But most environments have a maximum number of arguments per functions.
 * For effiency reasons we apply a maximum of 10000 characters at once.
 *
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String.
 */
/* c8 ignore start */
const _readVarStringPolyfill = decoder => {
  let remainingLen = readVarUint(decoder);
  if (remainingLen === 0) {
    return ''
  } else {
    let encodedString = String.fromCodePoint(readUint8(decoder)); // remember to decrease remainingLen
    if (--remainingLen < 100) { // do not create a Uint8Array for small strings
      while (remainingLen--) {
        encodedString += String.fromCodePoint(readUint8(decoder));
      }
    } else {
      while (remainingLen > 0) {
        const nextLen = remainingLen < 10000 ? remainingLen : 10000;
        // this is dangerous, we create a fresh array view from the existing buffer
        const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
        decoder.pos += nextLen;
        // Starting with ES5.1 we can supply a generic array-like object as arguments
        encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
        remainingLen -= nextLen;
      }
    }
    return decodeURIComponent(escape(encodedString))
  }
};
/* c8 ignore stop */

/**
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 */
const _readVarStringNative = decoder =>
  /** @type any */ (utf8TextDecoder).decode(readVarUint8Array(decoder));

/**
 * Read string of variable length
 * * varUint is used to store the length of the string
 *
 * @function
 * @param {Decoder} decoder
 * @return {String} The read String
 *
 */
/* c8 ignore next */
const readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;

/**
 * @param {Decoder} decoder
 * @param {number} len
 * @return {DataView}
 */
const readFromDataView = (decoder, len) => {
  const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
  decoder.pos += len;
  return dv
};

/**
 * @param {Decoder} decoder
 */
const readFloat32 = decoder => readFromDataView(decoder, 4).getFloat32(0, false);

/**
 * @param {Decoder} decoder
 */
const readFloat64 = decoder => readFromDataView(decoder, 8).getFloat64(0, false);

/**
 * @param {Decoder} decoder
 */
const readBigInt64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0, false);

/**
 * @type {Array<function(Decoder):any>}
 */
const readAnyLookupTable = [
  decoder => undefined, // CASE 127: undefined
  decoder => null, // CASE 126: null
  readVarInt, // CASE 125: integer
  readFloat32, // CASE 124: float32
  readFloat64, // CASE 123: float64
  readBigInt64, // CASE 122: bigint
  decoder => false, // CASE 121: boolean (false)
  decoder => true, // CASE 120: boolean (true)
  readVarString, // CASE 119: string
  decoder => { // CASE 118: object<string,any>
    const len = readVarUint(decoder);
    /**
     * @type {Object<string,any>}
     */
    const obj = {};
    for (let i = 0; i < len; i++) {
      const key = readVarString(decoder);
      obj[key] = readAny(decoder);
    }
    return obj
  },
  decoder => { // CASE 117: array<any>
    const len = readVarUint(decoder);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(readAny(decoder));
    }
    return arr
  },
  readVarUint8Array // CASE 116: Uint8Array
];

/**
 * @param {Decoder} decoder
 */
const readAny = decoder => readAnyLookupTable[127 - readUint8(decoder)](decoder);

/**
 * Utility functions to work with buffers (Uint8Array).
 *
 * @module buffer
 */

/**
 * @param {number} len
 */
const createUint8ArrayFromLen = len => new Uint8Array(len);

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 * @param {number} byteOffset
 * @param {number} length
 */
const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

/**
 * Create Uint8Array with initial content from buffer
 *
 * @param {ArrayBuffer} buffer
 */
const createUint8ArrayFromArrayBuffer = buffer => new Uint8Array(buffer);

/* c8 ignore start */
/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Browser = bytes => {
  let s = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    s += fromCharCode(bytes[i]);
  }
  // eslint-disable-next-line no-undef
  return btoa(s)
};
/* c8 ignore stop */

/**
 * @param {Uint8Array} bytes
 * @return {string}
 */
const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');

/* c8 ignore start */
/**
 * @param {string} s
 * @return {Uint8Array}
 */
const fromBase64Browser = s => {
  // eslint-disable-next-line no-undef
  const a = atob(s);
  const bytes = createUint8ArrayFromLen(a.length);
  for (let i = 0; i < a.length; i++) {
    bytes[i] = a.charCodeAt(i);
  }
  return bytes
};
/* c8 ignore stop */

/**
 * @param {string} s
 */
const fromBase64Node = s => {
  const buf = Buffer.from(s, 'base64');
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
};

/* c8 ignore next */
const toBase64 = isBrowser ? toBase64Browser : toBase64Node;

/* c8 ignore next */
const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;

/* eslint-env browser */

/**
 * @typedef {Object} Channel
 * @property {Set<function(any, any):any>} Channel.subs
 * @property {any} Channel.bc
 */

/**
 * @type {Map<string, Channel>}
 */
const channels = new Map();

/* c8 ignore start */
class LocalStoragePolyfill {
  /**
   * @param {string} room
   */
  constructor (room) {
    this.room = room;
    /**
     * @type {null|function({data:ArrayBuffer}):void}
     */
    this.onmessage = null;
    onChange(e => e.key === room && this.onmessage !== null && this.onmessage({ data: fromBase64(e.newValue || '') }));
  }

  /**
   * @param {ArrayBuffer} buf
   */
  postMessage (buf) {
    varStorage.setItem(this.room, toBase64(createUint8ArrayFromArrayBuffer(buf)));
  }
}
/* c8 ignore stop */

// Use BroadcastChannel or Polyfill
/* c8 ignore next */
const BC = typeof BroadcastChannel === 'undefined' ? LocalStoragePolyfill : BroadcastChannel;

/**
 * @param {string} room
 * @return {Channel}
 */
const getChannel = room =>
  setIfUndefined(channels, room, () => {
    const subs = create$3();
    const bc = new BC(room);
    /**
     * @param {{data:ArrayBuffer}} e
     */
    /* c8 ignore next */
    bc.onmessage = e => subs.forEach(sub => sub(e.data, 'broadcastchannel'));
    return {
      bc, subs
    }
  });

/**
 * Subscribe to global `publish` events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
const subscribe = (room, f) => {
  getChannel(room).subs.add(f);
  return f
};

/**
 * Unsubscribe from `publish` global events.
 *
 * @function
 * @param {string} room
 * @param {function(any, any):any} f
 */
const unsubscribe = (room, f) => {
  const channel = getChannel(room);
  const unsubscribed = channel.subs.delete(f);
  if (unsubscribed && channel.subs.size === 0) {
    channel.bc.close();
    channels.delete(room);
  }
  return unsubscribed
};

/**
 * Publish data to all subscribers (including subscribers on this tab)
 *
 * @function
 * @param {string} room
 * @param {any} data
 * @param {any} [origin]
 */
const publish = (room, data, origin = null) => {
  const c = getChannel(room);
  c.bc.postMessage(data);
  c.subs.forEach(sub => sub(data, origin));
};

/**
 * Utility module to work with EcmaScript Symbols.
 *
 * @module symbol
 */

/**
 * Return fresh symbol.
 *
 * @return {Symbol}
 */
const create$1 = Symbol;

/**
 * Working with value pairs.
 *
 * @module pair
 */

/**
 * @template L,R
 */
class Pair {
  /**
   * @param {L} left
   * @param {R} right
   */
  constructor (left, right) {
    this.left = left;
    this.right = right;
  }
}

/**
 * @template L,R
 * @param {L} left
 * @param {R} right
 * @return {Pair<L,R>}
 */
const create = (left, right) => new Pair(left, right);

/* eslint-env browser */

/* c8 ignore start */
/**
 * @type {Document}
 */
const doc = /** @type {Document} */ (typeof document !== 'undefined' ? document : {});

/** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

/**
 * @param {Map<string,string>} m
 * @return {string}
 */
const mapToStyleString = m => map(m, (value, key) => `${key}:${value};`).join('');

doc.ELEMENT_NODE;
doc.TEXT_NODE;
doc.CDATA_SECTION_NODE;
doc.COMMENT_NODE;
doc.DOCUMENT_NODE;
doc.DOCUMENT_TYPE_NODE;
doc.DOCUMENT_FRAGMENT_NODE;
/* c8 ignore stop */

/**
 * Utility module to work with time.
 *
 * @module time
 */

/**
 * Return current unix time.
 *
 * @return {number}
 */
const getUnixTime = Date.now;

/**
 * Isomorphic logging module with support for colors!
 *
 * @module logging
 */

const BOLD = create$1();
const UNBOLD = create$1();
const BLUE = create$1();
const GREY = create$1();
const GREEN = create$1();
const RED = create$1();
const PURPLE = create$1();
const ORANGE = create$1();
const UNCOLOR = create$1();

/**
 * @type {Object<Symbol,pair.Pair<string,string>>}
 */
const _browserStyleMap = {
  [BOLD]: create('font-weight', 'bold'),
  [UNBOLD]: create('font-weight', 'normal'),
  [BLUE]: create('color', 'blue'),
  [GREEN]: create('color', 'green'),
  [GREY]: create('color', 'grey'),
  [RED]: create('color', 'red'),
  [PURPLE]: create('color', 'purple'),
  [ORANGE]: create('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
  [UNCOLOR]: create('color', 'black')
};

const _nodeStyleMap = {
  [BOLD]: '\u001b[1m',
  [UNBOLD]: '\u001b[2m',
  [BLUE]: '\x1b[34m',
  [GREEN]: '\x1b[32m',
  [GREY]: '\u001b[37m',
  [RED]: '\x1b[31m',
  [PURPLE]: '\x1b[35m',
  [ORANGE]: '\x1b[38;5;208m',
  [UNCOLOR]: '\x1b[0m'
};

/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
/* c8 ignore start */
const computeBrowserLoggingArgs = (args) => {
  const strBuilder = [];
  const styles = [];
  const currentStyle = create$4();
  /**
   * @type {Array<string|Object|number>}
   */
  let logArgs = [];
  // try with formatting until we find something unsupported
  let i = 0;
  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _browserStyleMap[arg];
    if (style !== undefined) {
      currentStyle.set(style.left, style.right);
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        const style = mapToStyleString(currentStyle);
        if (i > 0 || style.length > 0) {
          strBuilder.push('%c' + arg);
          styles.push(style);
        } else {
          strBuilder.push(arg);
        }
      } else {
        break
      }
    }
  }
  if (i > 0) {
    // create logArgs with what we have so far
    logArgs = styles;
    logArgs.unshift(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs
};
/* c8 ignore stop */

/* c8 ignore start */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
const computeNoColorLoggingArgs = args => {
  const strBuilder = [];
  const logArgs = [];
  // try with formatting until we find something unsupported
  let i = 0;
  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _nodeStyleMap[arg];
    if (style === undefined) {
      if (arg.constructor === String || arg.constructor === Number) {
        strBuilder.push(arg);
      } else {
        break
      }
    }
  }
  if (i > 0) {
    logArgs.push(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof Symbol)) {
      if (arg.constructor === Object) {
        logArgs.push(JSON.stringify(arg));
      } else {
        logArgs.push(arg);
      }
    }
  }
  return logArgs
};
/* c8 ignore stop */

/* c8 ignore start */
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<string|object|number>}
 */
const computeNodeLoggingArgs = (args) => {
  const strBuilder = [];
  const logArgs = [];
  // try with formatting until we find something unsupported
  let i = 0;
  for (; i < args.length; i++) {
    const arg = args[i];
    // @ts-ignore
    const style = _nodeStyleMap[arg];
    if (style !== undefined) {
      strBuilder.push(style);
    } else {
      if (arg.constructor === String || arg.constructor === Number) {
        strBuilder.push(arg);
      } else {
        break
      }
    }
  }
  if (i > 0) {
    // create logArgs with what we have so far
    strBuilder.push('\x1b[0m');
    logArgs.push(strBuilder.join(''));
  }
  // append the rest
  for (; i < args.length; i++) {
    const arg = args[i];
    if (!(arg instanceof Symbol)) {
      logArgs.push(arg);
    }
  }
  return logArgs
};
/* c8 ignore stop */

/* c8 ignore start */
const computeLoggingArgs = supportsColor
  ? (isNode ? computeNodeLoggingArgs : computeBrowserLoggingArgs)
  : computeNoColorLoggingArgs;
/* c8 ignore stop */

/**
 * @param {Array<string|Symbol|Object|number>} args
 */
const print = (...args) => {
  console.log(...computeLoggingArgs(args));
  /* c8 ignore next */
  vconsoles.forEach((vc) => vc.print(args));
};

const vconsoles = create$3();

const loggingColors = [GREEN, PURPLE, ORANGE, BLUE];
let nextColor = 0;
let lastLoggingTime = getUnixTime();

/* c8 ignore start */
/**
 * @param {string} moduleName
 * @return {function(...any):void}
 */
const createModuleLogger = (moduleName) => {
  const color = loggingColors[nextColor];
  const debugRegexVar = getVariable('log');
  const doLogging = debugRegexVar !== null &&
    (debugRegexVar === '*' || debugRegexVar === 'true' ||
      new RegExp(debugRegexVar, 'gi').test(moduleName));
  nextColor = (nextColor + 1) % loggingColors.length;
  moduleName += ': ';

  return !doLogging
    ? nop
    : (...args) => {
      const timeNow = getUnixTime();
      const timeDiff = timeNow - lastLoggingTime;
      lastLoggingTime = timeNow;
      print(
        color,
        moduleName,
        UNCOLOR,
        ...args.map((arg) =>
          (typeof arg === 'string' || typeof arg === 'symbol')
            ? arg
            : JSON.stringify(arg)
        ),
        color,
        ' +' + timeDiff + 'ms'
      );
    }
};
/* c8 ignore stop */

/**
 * Mutual exclude for JavaScript.
 *
 * @module mutex
 */

/**
 * @callback mutex
 * @param {function():void} cb Only executed when this mutex is not in the current stack
 * @param {function():void} [elseCb] Executed when this mutex is in the current stack
 */

/**
 * Creates a mutual exclude function with the following property:
 *
 * ```js
 * const mutex = createMutex()
 * mutex(() => {
 *   // This function is immediately executed
 *   mutex(() => {
 *     // This function is not executed, as the mutex is already active.
 *   })
 * })
 * ```
 *
 * @return {mutex} A mutual exclude function
 * @public
 */
const createMutex = () => {
  let token = true;
  return (f, g) => {
    if (token) {
      token = false;
      try {
        f();
      } finally {
        token = true;
      }
    } else if (g !== undefined) {
      g();
    }
  }
};

/* eslint-env browser */

const isoCrypto = typeof crypto === 'undefined' ? null : crypto;

/**
 * @type {function(number):ArrayBuffer}
 */
const cryptoRandomBuffer = isoCrypto !== null
  ? len => {
    // browser
    const buf = new ArrayBuffer(len);
    const arr = new Uint8Array(buf);
    isoCrypto.getRandomValues(arr);
    return buf
  }
  : len => {
    // polyfill
    const buf = new ArrayBuffer(len);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < len; i++) {
      arr[i] = Math.ceil((Math.random() * 0xFFFFFFFF) >>> 0);
    }
    return buf
  };

const rand = Math.random;

const uint32 = () => new Uint32Array(cryptoRandomBuffer(4))[0];

// @ts-ignore
const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
const uuidv4 = () => uuidv4Template.replace(/[018]/g, /** @param {number} c */ c =>
  (c ^ uint32() & 15 >> c / 4).toString(16)
);

/**
 * Utility helpers to work with promises.
 *
 * @module promise
 */

/**
 * @param {Error} [reason]
 * @return {Promise<never>}
 */
const reject = reason => Promise.reject(reason);

/* eslint-env browser */
const deriveKey = (secret, roomName) => {
    const secretBuffer = encodeUtf8(secret).buffer;
    const salt = encodeUtf8(roomName).buffer;
    return crypto.subtle.importKey('raw', secretBuffer, 'PBKDF2', false, ['deriveKey']).then(keyMaterial => crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
    }, keyMaterial, {
        name: 'AES-GCM',
        length: 256
    }, true, ['encrypt', 'decrypt']));
};
function encrypt(data, key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!key) {
            return Promise.resolve(data);
        }
        const iv = crypto.getRandomValues(new Uint8Array(12));
        return crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv
        }, key, data).then(cipher => {
            const encryptedDataEncoder = createEncoder();
            writeVarString(encryptedDataEncoder, 'AES-GCM');
            writeVarUint8Array(encryptedDataEncoder, iv);
            writeVarUint8Array(encryptedDataEncoder, new Uint8Array(cipher));
            return toUint8Array(encryptedDataEncoder);
        });
    });
}
const encryptJson = (data, key) => {
    const dataEncoder = createEncoder();
    writeAny(dataEncoder, data);
    return encrypt(toUint8Array(dataEncoder), key);
};
function decrypt(data, key) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!key) {
            return Promise.resolve(data);
        }
        const dataDecoder = createDecoder(data);
        const algorithm = readVarString(dataDecoder);
        if (algorithm !== 'AES-GCM') {
            reject(create$2('Unknown encryption algorithm'));
        }
        const iv = readVarUint8Array(dataDecoder);
        const cipher = readVarUint8Array(dataDecoder);
        return crypto.subtle.decrypt({
            name: 'AES-GCM',
            iv
        }, key, cipher).then(data => new Uint8Array(data));
    });
}
/**
 * @param {Uint8Array} data
 * @param {CryptoKey?} key
 * @return {PromiseLike<Object>} decrypted object
 */
const decryptJson = (data, key) => decrypt(data, key).then(decryptedValue => readAny(createDecoder(new Uint8Array(decryptedValue))));

const log = createModuleLogger('y-webrtc');
// const messageSync = 0
const messageQueryAwareness = 3;
const messageAwareness = 1;
const messageBcPeerId = 4;
const rooms = new Map();
const checkIsSynced = (room) => {
    let synced = true;
    room.webrtcConns.forEach(peer => {
        if (!peer.synced) {
            synced = false;
        }
    });
    if ((!synced && room.synced) || (synced && !room.synced)) {
        room.synced = synced;
        room.provider.emit('synced', [{ synced }]);
        log('synced ', BOLD, room.name, UNBOLD, ' with all peers');
    }
};
const readMessage = (room, buf, syncedCallback) => {
    const decoder = createDecoder(buf);
    const encoder = createEncoder();
    const messageType = readVarUint(decoder);
    if (room === undefined) {
        return null;
    }
    const awareness = room.awareness;
    // const doc = room.doc
    let sendReply = false;
    switch (messageType) {
        // case messageSync: {
        //   encoding.writeVarUint(encoder, messageSync)
        //   const syncMessageType = syncProtocol.readSyncMessage(decoder, encoder, doc, room)
        //   if (syncMessageType === syncProtocol.messageYjsSyncStep2 && !room.synced) {
        //     syncedCallback()
        //   }
        //   if (syncMessageType === syncProtocol.messageYjsSyncStep1) {
        //     sendReply = true
        //   }
        //   break
        // }
        case messageQueryAwareness:
            writeVarUint(encoder, messageAwareness);
            writeVarUint8Array(encoder, awarenessProtocol__namespace.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
            sendReply = true;
            break;
        case messageAwareness:
            awarenessProtocol__namespace.applyAwarenessUpdate(awareness, readVarUint8Array(decoder), room);
            break;
        case messageBcPeerId: {
            const add = readUint8(decoder) === 1;
            const peerName = readVarString(decoder);
            if (peerName !== room.peerId && ((room.bcConns.has(peerName) && !add) || (!room.bcConns.has(peerName) && add))) {
                const removed = [];
                const added = [];
                if (add) {
                    room.bcConns.add(peerName);
                    added.push(peerName);
                }
                else {
                    room.bcConns.delete(peerName);
                    removed.push(peerName);
                }
                room.provider.emit('peers', [{
                        added,
                        removed,
                        webrtcPeers: Array.from(room.webrtcConns.keys()),
                        bcPeers: Array.from(room.bcConns)
                    }]);
                broadcastBcPeerId(room);
            }
            break;
        }
        default:
            console.error('Unable to compute message');
            return encoder;
    }
    if (!sendReply) {
        // nothing has been written, no answer created
        return null;
    }
    return encoder;
};
const readPeerMessage = (peerConn, buf) => {
    const room = peerConn.room;
    log('received message from ', BOLD, peerConn.remotePeerId, GREY, ' (', room.name, ')', UNBOLD, UNCOLOR);
    return readMessage(room, buf);
};
const sendWebrtcConn = (webrtcConn, encoder) => {
    log('send message to ', BOLD, webrtcConn.remotePeerId, UNBOLD, GREY, ' (', webrtcConn.room.name, ')', UNCOLOR);
    try {
        webrtcConn.peer.send(toUint8Array(encoder));
    }
    catch (e) { }
};
const broadcastWebrtcConn = (room, m) => {
    log('broadcast message in ', BOLD, room.name, UNBOLD);
    room.webrtcConns.forEach(conn => {
        try {
            conn.peer.send(m);
        }
        catch (e) { }
    });
};
function getAnnouncePath(basePath, peerId) {
    return basePath + ANNOUNCE_PATH + peerId;
}
function getSignalPath(basePath, to, msgId) {
    return `${basePath}/yjs/aware/signal/${to}/sig_messages/${msgId}`;
}
/**
 * The time limit for establishing a connection to the peer.
 * If the connection is not established within this limit, the peer is deemed to
 * be offline. In that case, the announce document and signal messages will be deleted.
 */
const CONNECTION_TIMEOUT = 5000; // 5 seconds
class FirestoreWebrtcConn {
    constructor(signalingConn, initiator, remotePeerId, room) {
        /**
         * The list of id values for signal messages sent to the peer via Firestore.
         * If a connection is not established within the CONNECTION_TIMEOUT period,
         * these messages and the peer's `announce` document will be deleted from Firestore.
         */
        this.signals = [];
        this.room = room;
        this.remotePeerId = remotePeerId;
        this.closed = false;
        this.connected = false;
        this.synced = false;
        this.peer = new SimplePeer__default["default"](Object.assign({ initiator }, room.provider.peerOpts));
        this.peer.on('signal', (signal) => {
            signalingConn.publishSignal(remotePeerId, signal);
        });
        this.peer.on('connect', () => {
            log('connected to ', BOLD, remotePeerId);
            this.connected = true;
            if (this.connectionTimeoutId) {
                clearTimeout(this.connectionTimeoutId);
                delete this.connectionTimeoutId;
            }
            if (this.signals) {
                delete this.signals;
            }
            // send sync step 1
            // const provider = room.provider
            // const doc = provider.doc
            const awareness = room.awareness;
            // const encoder = encoding.createEncoder()
            // encoding.writeVarUint(encoder, messageSync)
            // syncProtocol.writeSyncStep1(encoder, doc)
            // sendWebrtcConn(this, encoder)
            const awarenessStates = awareness.getStates();
            if (awarenessStates.size > 0) {
                const encoder = createEncoder();
                writeVarUint(encoder, messageAwareness);
                writeVarUint8Array(encoder, awarenessProtocol__namespace.encodeAwarenessUpdate(awareness, Array.from(awarenessStates.keys())));
                sendWebrtcConn(this, encoder);
            }
        });
        this.peer.on('close', () => {
            this.connected = false;
            this.closed = true;
            if (room.webrtcConns.has(this.remotePeerId)) {
                room.webrtcConns.delete(this.remotePeerId);
                room.provider.emit('peers', [{
                        removed: [this.remotePeerId],
                        added: [],
                        webrtcPeers: Array.from(room.webrtcConns.keys()),
                        bcPeers: Array.from(room.bcConns)
                    }]);
            }
            checkIsSynced(room);
            this.peer.destroy();
            console.log(`closed connection to ${remotePeerId}: ${new Date().toUTCString()}`);
            log('closed connection to ', BOLD, remotePeerId);
        });
        this.peer.on('error', err => {
            console.warn(`Error in connection to ${this.room.name}, remotePeerId=${remotePeerId}`, {
                err,
                time: new Date().toUTCString()
            });
        });
        this.peer.on('data', data => {
            const answer = readPeerMessage(this, data);
            if (answer !== null) {
                sendWebrtcConn(this, answer);
            }
        });
        const self = this;
        this.connectionTimeoutId = setTimeout(() => self.abort(), CONNECTION_TIMEOUT);
    }
    abort() {
        console.log(`connection to ${this.remotePeerId} aborted`, { signals: this.signals });
        delete this.connectionTimeoutId;
        this.handleUnresponsivePeer();
    }
    handleUnresponsivePeer() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('handleUnresponsivePeer', { peerId: this.remotePeerId, signals: this.signals });
            const signalingConn = this.room.provider.signalingConn;
            if (signalingConn) {
                const basePath = signalingConn.basePath;
                const announcePath = getAnnouncePath(basePath, this.remotePeerId);
                const db = firestore$1.getFirestore(signalingConn.firebaseApp);
                const announceRef = firestore$1.doc(db, announcePath);
                const list = [
                    firestore$1.deleteDoc(announceRef)
                ];
                const signals = this.signals;
                if (signals) {
                    signals.forEach(msgId => {
                        const signalPath = getSignalPath(basePath, this.remotePeerId, msgId);
                        const signalRef = firestore$1.doc(db, signalPath);
                        list.push(firestore$1.deleteDoc(signalRef));
                    });
                }
                yield Promise.all(list);
                this.destroy();
                this.room.webrtcConns.delete(this.remotePeerId);
            }
        });
    }
    /**
     * Capture the id of a signal message added to Firestore.
     * If a connection is not established within the time window, these messages will be removed.
     *
     * @param signalId The id of the signal added to firestore
     */
    addSignal(signalId) {
        if (this.signals) {
            this.signals.push(signalId);
        }
    }
    destroy() {
        this.peer.destroy();
    }
}
const broadcastBcMessage = (room, m) => encrypt(m, room.key).then(data => room.mux(() => publish(room.name, data)));
const broadcastRoomMessage = (room, m) => {
    if (room.bcconnected) {
        broadcastBcMessage(room, m);
    }
    broadcastWebrtcConn(room, m);
};
const broadcastBcPeerId = (room) => {
    if (room.provider.filterBcConns) {
        // broadcast peerId via broadcastchannel
        const encoderPeerIdBc = createEncoder();
        writeVarUint(encoderPeerIdBc, messageBcPeerId);
        writeUint8(encoderPeerIdBc, 1);
        writeVarString(encoderPeerIdBc, room.peerId);
        broadcastBcMessage(room, toUint8Array(encoderPeerIdBc));
    }
};
class Room {
    constructor(doc, provider, name, key) {
        /**
         * Do not assume that peerId is unique. This is only meant for sending signaling messages.
         *
         * @type {string}
         */
        this.peerId = uuidv4();
        this.doc = doc;
        this.awareness = provider.awareness;
        this.provider = provider;
        this.synced = false;
        this.name = name;
        // @todo make key secret by scoping
        this.key = key;
        this.webrtcConns = new Map();
        /**
         * @type {Set<string>}
         */
        this.bcConns = new Set();
        this.mux = createMutex();
        this.bcconnected = false;
        this._bcSubscriber = (data) => decrypt(new Uint8Array(data), key).then(m => this.mux(() => {
            const reply = readMessage(this, m);
            if (reply) {
                broadcastBcMessage(this, toUint8Array(reply));
            }
        }));
        /**
         * Listens to Yjs updates and sends them to remote peers
         */
        // this._docUpdateHandler = (update: Uint8Array, origin: any) => {
        //   const encoder = encoding.createEncoder()
        //   encoding.writeVarUint(encoder, messageSync)
        //   syncProtocol.writeUpdate(encoder, update)
        //   broadcastRoomMessage(this, encoding.toUint8Array(encoder))
        // }
        /**
         * Listens to Awareness updates and sends them to remote peers
         */
        this._awarenessUpdateHandler = ({ added, updated, removed }, origin) => {
            const changedClients = added.concat(updated).concat(removed);
            const encoderAwareness = createEncoder();
            writeVarUint(encoderAwareness, messageAwareness);
            writeVarUint8Array(encoderAwareness, awarenessProtocol__namespace.encodeAwarenessUpdate(this.awareness, changedClients));
            broadcastRoomMessage(this, toUint8Array(encoderAwareness));
        };
        this._beforeUnloadHandler = () => {
            awarenessProtocol__namespace.removeAwarenessStates(this.awareness, [doc.clientID], 'window unload');
            rooms.forEach(room => {
                room.disconnect();
            });
        };
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', this._beforeUnloadHandler);
        }
        else if (typeof process !== 'undefined') {
            process.on('exit', this._beforeUnloadHandler);
        }
    }
    connect() {
        // this.doc.on('update', this._docUpdateHandler)
        this.awareness.on('update', this._awarenessUpdateHandler);
        const signalingConn = this.provider.signalingConn;
        if (signalingConn) {
            signalingConn.publishAnnounce();
        }
        // signal through all available signaling connections
        const roomName = this.name;
        subscribe(roomName, this._bcSubscriber);
        this.bcconnected = true;
        // broadcast peerId via broadcastchannel
        broadcastBcPeerId(this);
        // write sync step 1
        // const encoderSync = encoding.createEncoder()
        // encoding.writeVarUint(encoderSync, messageSync)
        // syncProtocol.writeSyncStep1(encoderSync, this.doc)
        // broadcastBcMessage(this, encoding.toUint8Array(encoderSync))
        // broadcast local state
        // const encoderState = encoding.createEncoder()
        // encoding.writeVarUint(encoderState, messageSync)
        // syncProtocol.writeSyncStep2(encoderState, this.doc)
        // broadcastBcMessage(this, encoding.toUint8Array(encoderState))
        // write queryAwareness
        const encoderAwarenessQuery = createEncoder();
        writeVarUint(encoderAwarenessQuery, messageQueryAwareness);
        broadcastBcMessage(this, toUint8Array(encoderAwarenessQuery));
        // broadcast local awareness state
        const encoderAwarenessState = createEncoder();
        writeVarUint(encoderAwarenessState, messageAwareness);
        writeVarUint8Array(encoderAwarenessState, awarenessProtocol__namespace.encodeAwarenessUpdate(this.awareness, [this.doc.clientID]));
        broadcastBcMessage(this, toUint8Array(encoderAwarenessState));
    }
    disconnect() {
        // signal through all available signaling connections
        awarenessProtocol__namespace.removeAwarenessStates(this.awareness, [this.doc.clientID], 'disconnect');
        const signalingConn = this.provider.signalingConn;
        if (signalingConn) {
            signalingConn.deleteAnnounceDoc();
        }
        // broadcast peerId removal via broadcastchannel
        const encoderPeerIdBc = createEncoder();
        writeVarUint(encoderPeerIdBc, messageBcPeerId);
        writeUint8(encoderPeerIdBc, 0); // remove peerId from other bc peers
        writeVarString(encoderPeerIdBc, this.peerId);
        broadcastBcMessage(this, toUint8Array(encoderPeerIdBc));
        unsubscribe(this.name, this._bcSubscriber);
        this.bcconnected = false;
        this.awareness.off('update', this._awarenessUpdateHandler);
        this.webrtcConns.forEach(conn => conn.destroy());
        this.webrtcConns = new Map();
    }
    destroy() {
        this.disconnect();
        if (typeof window !== 'undefined') {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        }
        else if (typeof process !== 'undefined') {
            process.off('exit', this._beforeUnloadHandler);
        }
    }
}
const openRoom = (doc, provider, name, key) => {
    // there must only be one room
    if (rooms.has(name)) {
        throw create$2(`A Yjs Doc connected to room "${name}" already exists!`);
    }
    const room = new Room(doc, provider, name, key);
    rooms.set(name, /** @type {Room} */ (room));
    return room;
};
/**
 * @typedef {Object} ProviderOptions
 * @property {Array<string>} [signaling]
 * @property {string} [password]
 * @property {awarenessProtocol.Awareness} [awareness]
 * @property {number} [maxConns]
 * @property {boolean} [filterBcConns]
 * @property {any} [peerOpts]
 */
/**
 * @extends Observable<string>
 */
class FirestoreWebrtcProvider extends Observable {
    constructor(firebaseApp, roomName, doc, { password = null, awareness = new awarenessProtocol__namespace.Awareness(doc), maxConns = 20 + floor(rand() * 15), // the random factor reduces the chance that n clients form a cluster
    filterBcConns = true, peerOpts = {} // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts
     } = {}) {
        super();
        this.handleOnline = null;
        this.roomName = roomName;
        this.doc = doc;
        this.filterBcConns = filterBcConns;
        /**
         * @type {awarenessProtocol.Awareness}
         */
        this.awareness = awareness;
        this.signalingConn = null;
        this.maxConns = maxConns;
        this.peerOpts = peerOpts;
        this.key = password ? deriveKey(password, roomName) : Promise.resolve(null);
        /**
         * @type {Room|null}
         */
        this.room = null;
        this.key.then(key => {
            this.room = openRoom(doc, this, roomName, key);
            this.signalingConn = new FirestoreSignalingConn(firebaseApp, roomName, this.room);
            this.room.connect();
        });
        this.handleOnline = () => {
            console.log("online", new Date().toUTCString());
            if (this.signalingConn) {
                this.signalingConn.publishAnnounce();
            }
        };
        window.addEventListener("online", this.handleOnline);
        this.destroy = this.destroy.bind(this);
        doc.on('destroy', this.destroy);
    }
    /**
     * @type {boolean}
     */
    get connected() {
        return this.room !== null;
    }
    destroy() {
        this.doc.off('destroy', this.destroy);
        // need to wait for key before deleting room
        this.key.then(() => {
            if (this.room) {
                this.room.destroy();
            }
            rooms.delete(this.roomName);
        });
        if (this.signalingConn) {
            this.signalingConn.destroy();
            this.signalingConn = null;
        }
        if (this.handleOnline) {
            window.removeEventListener("online", this.handleOnline);
            this.handleOnline = null;
        }
        super.destroy();
    }
}
/*-----------------------------------------------------------*/
const ANNOUNCE_PATH = "/yjs/aware/announce/";
const AWARE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const ANNOUNCE_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours
class FirestoreSignalingConn {
    constructor(firebaseApp, basePath, room) {
        this.announceCreatedAt = 0;
        this.announceIntervalToken = null;
        this.firebaseApp = firebaseApp;
        this.basePath = basePath;
        this.room = room;
        this.announceUnsubscribe = null;
        this.signalUnsubscribe = this.subscribeSignal();
    }
    destroy() {
        this.deleteAnnounceDoc();
        if (this.announceUnsubscribe) {
            this.announceUnsubscribe();
            this.announceUnsubscribe = null;
        }
        if (this.signalUnsubscribe) {
            this.signalUnsubscribe();
            this.signalUnsubscribe = null;
        }
        if (this.announceIntervalToken) {
            clearInterval(this.announceIntervalToken);
            this.announceIntervalToken = null;
        }
    }
    publishSignal(to, signal) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgId = uuidv4();
            const path = getSignalPath(this.basePath, to, msgId);
            const conn = this.room.webrtcConns.get(to);
            if (conn) {
                conn.addSignal(msgId);
            }
            const payload = {
                to,
                from: this.room.peerId,
                signal
            };
            yield this.save(path, payload);
        });
    }
    /**
     * Create a listener for the room's `announce` messages.
     * @returns The `Unsubscribe` function for the listener
     */
    subscribeAnnounce() {
        const path = this.basePath + ANNOUNCE_PATH;
        const db = firestore$1.getFirestore(this.firebaseApp);
        const ref = firestore$1.collection(db, path);
        const q = firestore$1.query(ref);
        const room = this.room;
        return firestore$1.onSnapshot(q, snapshot => {
            const queue = [];
            snapshot.docChanges().forEach((change) => __awaiter(this, void 0, void 0, function* () {
                const envelope = change.doc.data();
                const payload = envelope.payload;
                const data = yield this.decrypt(payload);
                switch (change.type) {
                    case 'modified':
                    // falls through
                    case 'added': {
                        if (data.from !== room.peerId) {
                            const webrtcConns = room.webrtcConns;
                            if (webrtcConns.size < room.provider.maxConns &&
                                !webrtcConns.has(data.from)) {
                                const remoteCreatedAt = data.createdAt;
                                if (remoteCreatedAt) {
                                    const remoteMillis = remoteCreatedAt.toMillis();
                                    const initiator = this.announceCreatedAt > remoteMillis;
                                    webrtcConns.set(data.from, new FirestoreWebrtcConn(this, initiator, data.from, room));
                                }
                            }
                        }
                        break;
                    }
                    case 'removed':
                        if (data.from === room.peerId) {
                            // Another peer must have determined that the current peer is offline.  Perhaps the
                            // current peer really was offline temporarily, but clearly it is back online so
                            // recreate the `announce` document.
                            this.publishAnnounce();
                        }
                        break;
                }
            }));
            if (!this.announceCreatedAt) {
                console.warn("Ignoring remote announce documents because the local `announceCreatedAt` time is not defined.");
            }
            else {
                const webrtcConns = room.webrtcConns;
                for (const data of queue) {
                    if (webrtcConns.size < room.provider.maxConns &&
                        !webrtcConns.has(data.from)) {
                        const remoteCreatedAt = data.createdAt;
                        const remoteMillis = remoteCreatedAt.toMillis();
                        const initiator = this.announceCreatedAt > remoteMillis;
                        webrtcConns.set(data.from, new FirestoreWebrtcConn(this, initiator, data.from, room));
                    }
                }
            }
        });
    }
    subscribeSignal() {
        const peerId = this.room.peerId;
        const path = `${this.basePath}/yjs/aware/signal/${peerId}/sig_messages/`;
        const db = firestore$1.getFirestore(this.firebaseApp);
        const ref = firestore$1.collection(db, path);
        const q = firestore$1.query(ref);
        return firestore$1.onSnapshot(q, snapshot => {
            snapshot.docChanges().forEach((change) => __awaiter(this, void 0, void 0, function* () {
                switch (change.type) {
                    case 'added':
                    case 'modified': {
                        const document = change.doc;
                        const envelope = document.data();
                        const payload = envelope.payload;
                        const data = yield this.decrypt(payload);
                        if (data) {
                            const room = this.room;
                            const webrtcConns = room.webrtcConns;
                            setIfUndefined(webrtcConns, data.from, () => new FirestoreWebrtcConn(this, false, data.from, room)).peer.signal(data.signal);
                            yield firestore$1.deleteDoc(document.ref);
                        }
                        break;
                    }
                }
            }));
        });
    }
    decrypt(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.room.key;
            return (key && (typeof payload === 'string') ?
                yield decryptJson(fromBase64(payload), key) :
                !key ? payload : null);
        });
    }
    publishAnnounce() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.announceIntervalToken) {
                clearInterval(this.announceIntervalToken);
                this.announceIntervalToken = null;
            }
            const room = this.room;
            const data = { from: room.peerId, createdAt: firestore$1.serverTimestamp() };
            const announcePath = this.getAnnouncePath();
            const announceRef = yield this.save(announcePath, data);
            if (announceRef) {
                const self = this;
                this.announceIntervalToken = setInterval(() => {
                    // Update the `expiresAt` timestamp
                    self.save(announcePath, data);
                }, ANNOUNCE_INTERVAL);
                const announceDoc = yield firestore$1.getDoc(announceRef);
                if (announceDoc.exists()) {
                    const announceData = announceDoc.data();
                    const payload = yield this.decrypt(announceData.payload);
                    try {
                        this.announceCreatedAt = payload.createdAt.toMillis();
                        this.announceUnsubscribe = this.subscribeAnnounce();
                    }
                    catch (e) {
                        console.log('Failed to get createdAt');
                        console.error(e);
                    }
                }
                else {
                    console.warn("Cannot listen to announce snapshots because local announce document not found", { announcePath });
                }
            }
        });
    }
    getAnnouncePath() {
        return getAnnouncePath(this.basePath, this.room.peerId);
    }
    deleteAnnounceDoc() {
        return __awaiter(this, void 0, void 0, function* () {
            const announcePath = this.getAnnouncePath();
            const db = firestore$1.getFirestore(this.firebaseApp);
            const ref = firestore$1.doc(db, announcePath);
            yield firestore$1.deleteDoc(ref);
        });
    }
    encodeData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = this.room.key;
            return key ?
                encryptJson(data, key).then(value => toBase64(value)) :
                data;
        });
    }
    save(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timePath = getTimePath(this.basePath);
                const now = yield currentTime(this.firebaseApp, timePath);
                const expiresAt = firestore$1.Timestamp.fromMillis(now + AWARE_TTL);
                const payload = yield this.encodeData(data);
                const envelope = {
                    expiresAt,
                    payload
                };
                const db = firestore$1.getFirestore(this.firebaseApp);
                const ref = firestore$1.doc(db, path);
                yield firestore$1.setDoc(ref, envelope);
                return ref;
            }
            catch (error) {
                console.warn("Failed to save awareness data", { path, error, data });
            }
        });
    }
}

/**
 * Utility method to convert a Y.Doc to Prosemirror compatible JSON.
 *
 * @param {Y.Doc} ydoc
 * @param {string} xmlFragment
 * @return {Record<string, any>}
 */
function yDocToProsemirrorJSON (
  ydoc,
  xmlFragment = 'prosemirror'
) {
  return yXmlFragmentToProsemirrorJSON(ydoc.getXmlFragment(xmlFragment))
}

/**
 * Utility method to convert a Y.Doc to Prosemirror compatible JSON.
 *
 * @param {Y.XmlFragment} xmlFragment The fragment, which must be part of a Y.Doc.
 * @return {Record<string, any>}
 */
function yXmlFragmentToProsemirrorJSON (xmlFragment) {
  const items = xmlFragment.toArray();

  function serialize (item) {
    /**
     * @type {Object} NodeObject
     * @property {string} NodeObject.type
     * @property {Record<string, string>=} NodeObject.attrs
     * @property {Array<NodeObject>=} NodeObject.content
     */
    let response;

    // TODO: Must be a better way to detect text nodes than this
    if (!item.nodeName) {
      const delta = item.toDelta();
      response = delta.map((d) => {
        const text = {
          type: 'text',
          text: d.insert
        };

        if (d.attributes) {
          const marks = [];
          Object.keys(d.attributes).forEach((type) => {
            const attrs = d.attributes[type];
            if (Array.isArray(attrs)) {
              // multiple marks of same type
              attrs.forEach(singleAttrs => {
                const mark = {
                  type
                };

                if (Object.keys(singleAttrs)) {
                  mark.attrs = singleAttrs;
                }

                marks.push(mark);
              });
            } else {
              const mark = {
                type
              };

              if (Object.keys(attrs)) {
                mark.attrs = attrs;
              }

              marks.push(mark);
            }
          });
          text.marks = marks;
        }
        return text
      });
    } else {
      response = {
        type: item.nodeName
      };

      const attrs = item.getAttributes();
      if (Object.keys(attrs).length) {
        response.attrs = attrs;
      }

      const children = item.toArray();
      if (children.length) {
        response.content = children.map(serialize).flat();
      }
    }

    return response
  }

  return {
    type: 'doc',
    content: items.map(serialize)
  }
}

const SHUTDOWN = "shutdown";
const YJS_HISTORY_UPDATES = "/yjs/history/updates";
const YJS_HISTORY = "/yjs/history";
function getUpdates(db, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const set = new Set();
        const ref = firestore.collection(db, path);
        const snapshot = yield firestore.getDocs(ref);
        snapshot.forEach((document) => set.add(document.id));
        return set;
    });
}
function deleteYjsData(firebaseApp, path, updateSet) {
    return __awaiter(this, void 0, void 0, function* () {
        // Save a "shutdown" message for all running providers.
        // This is accomplished by adding an empty document whose `id` is "shutdown" to the
        // "updates" collection.
        const db = firestore.getFirestore(firebaseApp);
        const basePath = path.join("/");
        const collectionPath = basePath + YJS_HISTORY_UPDATES;
        const shutdownPath = collectionPath + "/" + SHUTDOWN;
        const shutdownRef = firestore.doc(db, shutdownPath);
        yield firestore.setDoc(shutdownRef, {});
        const baselineRef = firestore.doc(db, basePath + YJS_HISTORY);
        // If the `updateSet` was not provided, get it via a query
        if (!updateSet) {
            updateSet = yield getUpdates(db, collectionPath);
        }
        const batch = firestore.writeBatch(db);
        batch.delete(baselineRef);
        // Delete all the updates in the set (except for the "shutdown" message)
        updateSet.forEach((docId) => {
            if (docId !== SHUTDOWN) {
                const docPath = collectionPath + "/" + docId;
                const docRef = firestore.doc(db, docPath);
                batch.delete(docRef);
            }
        });
        yield batch.commit();
        // Finally, delete the shutdown message
        yield firestore.deleteDoc(shutdownRef);
    });
}
/**
 * A Yjs Provider that stores document updates in a Firestore collection.
 */
class FirestoreProvider extends Observable {
    constructor(firebaseApp, ydoc, path, eventHandlers, config) {
        super();
        this.awareness = null;
        this.clock = 0;
        this.maxUpdatePause = 600;
        this.maxUpdatesPerBlob = 20;
        /**
         * The amount of time that an individual update is allowed to live in the
         * "updates" collection until it is merged into "yjs/baseline"
         */
        this.blobTimeToLive = 10000; // 10 seconds
        this.updateCount = 0;
        this.updateMap = new Map();
        this.isStopped = false;
        this.webrtcProvider = null;
        this.firebaseApp = firebaseApp;
        this.basePath = path.join("/");
        this.doc = ydoc;
        this.eventHandlers = eventHandlers;
        this.maxUpdatePause =
            (config === null || config === void 0 ? void 0 : config.maxUpdatePause) === undefined ? 600 : config.maxUpdatePause;
        this.maxUpdatesPerBlob =
            (config === null || config === void 0 ? void 0 : config.maxUpdatesPerBlob) === undefined ? 20 : config.maxUpdatesPerBlob;
        this.blobTimeToLive =
            (config === null || config === void 0 ? void 0 : config.blobTimeToLive) === undefined ? 10000 : config.blobTimeToLive;
        const enableAwareness = !Boolean(config === null || config === void 0 ? void 0 : config.disableAwareness);
        if (enableAwareness) {
            this.webrtcProvider = new FirestoreWebrtcProvider(firebaseApp, this.basePath, ydoc);
            this.awareness = this.webrtcProvider.awareness;
        }
        const db = firestore.getFirestore(firebaseApp);
        const self = this;
        const extra = Math.floor(2000 * Math.random());
        this.compressIntervalId = setInterval(() => {
            self.compress();
        }, this.blobTimeToLive + extra);
        this.updateHandler = (update, origin) => {
            if (this.isStopped) {
                return;
            }
            // Ignore updates applied by this provider
            if (origin !== self) {
                // The update was produced either locally or by another provider.
                //
                // Don't persist every single update. Instead, merge updates until there are
                // at least 20 changes or there is a pause in updates greater than 600 ms.
                // Merged updates are stored in `this.cache`
                if (self.saveTimeoutId) {
                    clearTimeout(self.saveTimeoutId);
                    delete self.saveTimeoutId;
                }
                self.cache = self.cache ? Y__namespace.mergeUpdates([self.cache, update]) : update;
                self.updateCount++;
                if (self.updateCount < self.maxUpdatesPerBlob) {
                    if (self.saveTimeoutId) {
                        clearTimeout(self.saveTimeoutId);
                    }
                    self.saveTimeoutId = setTimeout(() => {
                        delete self.saveTimeoutId;
                        self.save();
                    }, self.maxUpdatePause);
                }
                else {
                    self.save();
                }
            }
        };
        this.destroyHandler = () => this.destroy();
        this.transactionHandler = (trns, ydc) => {
            // console.log(trns);
            if (!trns.local) {
                // console.log('remote change coming in...');
                eventHandlers.onRemoteChange();
            }
            else if (trns.changed.size) {
                eventHandlers.onUpdateStart();
            }
        };
        // Subscribe to the ydoc's update and destroy events
        ydoc.on("update", this.updateHandler);
        ydoc.on("destroy", this.destroyHandler);
        ydoc.on('afterTransaction', this.transactionHandler);
        // Start a listener for document updates
        const collectionPath = path.join("/") + YJS_HISTORY_UPDATES;
        const q = firestore.query(firestore.collection(db, collectionPath));
        const baselinePath = this.basePath + YJS_HISTORY;
        const baseRef = firestore.doc(db, baselinePath);
        //* getting the history object from note.
        firestore.getDoc(baseRef)
            .then((baseDoc) => {
            //* if history exists, apply update to ydoc. this will trigger ydoc's update.
            //* updateHandler will then save the update in cache (will merge with current cache if it exists)
            if (baseDoc.exists()) {
                const bytes = baseDoc.data().update;
                const update = bytes.toUint8Array();
                //* self here helps determine if the update is coming from us, or another party.
                Y__namespace.applyUpdate(ydoc, update, self);
            }
        })
            .then(() => {
            //* here we're subscribing to updates collection within history. yjs/history/updates.
            self.unsubscribe = firestore.onSnapshot(q, (snapshot) => {
                let mustShutdown = false;
                snapshot.docChanges().forEach((change) => {
                    const document = change.doc;
                    switch (change.type) {
                        case "added":
                        case "modified":
                            if (document.id === SHUTDOWN) {
                                mustShutdown = true;
                                self.updateMap.set(SHUTDOWN, { time: 0 });
                            }
                            else {
                                const data = document.data();
                                const createdAt = data.createdAt;
                                if (!createdAt) {
                                    break;
                                }
                                const update = data.update.toUint8Array();
                                const clientID = parseClientId(document.id);
                                const time = timeSinceEpoch(createdAt);
                                self.updateMap.set(document.id, {
                                    time,
                                    update,
                                });
                                // Ignore updates that originated from the local Y.Doc
                                if (clientID !== ydoc.clientID) {
                                    Y__namespace.applyUpdate(ydoc, update, self);
                                }
                            }
                            break;
                        case "removed":
                            self.updateMap.delete(document.id);
                            break;
                    }
                });
                if (mustShutdown) {
                    this.destroy();
                }
            }, (error) => {
                console.error(`An error occurred while listening for Yjs updates at "${collectionPath}"`, error);
                this.error = error;
            });
        })
            .catch((error) => {
            console.error(`An error occurred while getting Yjs update at "${baselinePath}"`, error);
        });
    }
    destroy() {
        console.log("destory FirestoreProvider");
        this.save();
        if (this.webrtcProvider) {
            this.webrtcProvider.destroy();
            this.webrtcProvider = null;
        }
        this.shutdown();
        super.destroy();
    }
    /**
     * Destroy this provider, and permanently delete the
     * Yjs data
     */
    deleteYjsData() {
        return __awaiter(this, void 0, void 0, function* () {
            this.destroy();
            const set = new Set(this.updateMap.keys());
            const path = this.basePath.split("/");
            yield deleteYjsData(this.firebaseApp, path, set);
        });
    }
    compress() {
        return __awaiter(this, void 0, void 0, function* () {
            const map = this.updateMap;
            if (this.isStopped || map.size === 0) {
                return;
            }
            const baselinePath = this.basePath + YJS_HISTORY;
            const updatesPath = this.basePath + YJS_HISTORY_UPDATES;
            const timePath = getTimePath(this.basePath);
            const now = yield currentTime(this.firebaseApp, timePath);
            const zombies = new Set();
            let newUpdates = null;
            for (const [key, value] of map) {
                if (value) {
                    const update = value.update;
                    if (!update) {
                        // Shutting down;
                        return;
                    }
                    if (now - value.time > this.blobTimeToLive) {
                        zombies.add(key);
                        newUpdates = newUpdates
                            ? Y__namespace.mergeUpdates([newUpdates, update])
                            : update;
                    }
                }
            }
            if (!newUpdates) {
                return;
            }
            try {
                const db = firestore.getFirestore(this.firebaseApp);
                yield firestore.runTransaction(db, (txn) => __awaiter(this, void 0, void 0, function* () {
                    const baselineRef = firestore.doc(db, baselinePath);
                    const baselineDoc = yield txn.get(baselineRef);
                    let update = null;
                    if (baselineDoc.exists()) {
                        const baselineData = baselineDoc.data();
                        update = Y__namespace.mergeUpdates([
                            baselineData.update.toUint8Array(),
                            newUpdates,
                        ]);
                    }
                    else {
                        update = newUpdates;
                    }
                    txn.set(baselineRef, { update: firestore.Bytes.fromUint8Array(update) });
                    for (const key of zombies) {
                        const ref = firestore.doc(db, updatesPath, key);
                        txn.delete(ref);
                    }
                }));
            }
            catch (error) {
                console.error("Failed to compress Yjs update", {
                    error,
                    path: baselinePath,
                });
            }
            for (const key of zombies) {
                map.delete(key);
            }
        });
    }
    shutdown() {
        var _a;
        console.log("shutdown invoked");
        if (!this.isStopped) {
            this.isStopped = true;
            this.doc.off("update", this.updateHandler);
            this.doc.off("destroy", this.destroyHandler);
            if (this.compressIntervalId) {
                clearInterval(this.compressIntervalId);
                delete this.compressIntervalId;
            }
            if (this.saveTimeoutId) {
                clearTimeout(this.saveTimeoutId);
                delete this.saveTimeoutId;
            }
            if (this.unsubscribe) {
                this.unsubscribe();
                delete this.unsubscribe;
            }
            this.updateMap = new Map();
            if (this.cache) {
                delete this.cache;
            }
            this.updateCount = 0;
            const room = (_a = this.webrtcProvider) === null || _a === void 0 ? void 0 : _a.room;
            if (room) {
                room.destroy();
            }
        }
    }
    save() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.saveTimeoutId) {
                clearTimeout(this.saveTimeoutId);
                delete this.saveTimeoutId;
            }
            const update = this.cache;
            delete this.cache;
            this.updateCount = 0;
            if (update && !this.isStopped) {
                const data = {
                    createdAt: firestore.serverTimestamp(),
                    update: firestore.Bytes.fromUint8Array(update),
                };
                const clock = this.clock++;
                const time = Date.now();
                const updateId = this.doc.clientID.toString(16) +
                    "-" +
                    clock.toString(16) +
                    "-" +
                    time.toString(16);
                const db = firestore.getFirestore(this.firebaseApp);
                const batch = firestore.writeBatch(db);
                const path = this.basePath + YJS_HISTORY_UPDATES;
                const docRef = firestore.doc(db, path, updateId);
                const fullDocRef = firestore.doc(db, this.basePath);
                batch.set(docRef, data);
                const fullDoc = yDocToProsemirrorJSON(this.doc, 'default');
                // console.log('*** from provider ***');
                // console.log(fullDoc);
                batch.update(fullDocRef, {
                    content: JSON.stringify(fullDoc),
                    hasYjs: true, // flag to let editor know if content needs to be initialized with old data.
                });
                yield batch.commit();
                this.eventHandlers.onUpdateEnd();
            }
        });
    }
}
function parseClientId(updateId) {
    const dash = updateId.indexOf("-");
    const value = updateId.substring(0, dash);
    return parseInt(value, 16);
}

/**
 * List of 20 visually distinct colors.
 * Source: https://sashamaps.net/docs/resources/20-colors/
 * Replaced Maroon with Plum and Navy with Azure
 */
const colorList = [
    "#A85454",
    "#9A6324",
    "#808000",
    "#469990",
    "#0094FF",
    "#e6194B",
    "#f58231",
    "#ffe119",
    "#bfef45",
    "#3cb44b",
    "#42d4f4",
    "#4363d8",
    "#911eb4",
    "#f032e6",
    "#a9a9a9",
    "#fabed4",
    "#ffd8b1",
    "#fffac8",
    "#aaffc3",
    "#dcbeff" // Lavender
];
/*
  Maroon  A85454  Plum
  Navy    0094FF  Azure
*/
/**
 * Map a string to one of 20 visually distinct colors.
 *
 * This function is especially useful when trying to choose the cursor color
 * for a user. Simply pass the user's name (or some other identifier), and this
 * function maps the name to a color selected from a list of 20 visually distinct
 * colors.
 * @param name An arbitrary string
 * @returns One of 20 visually distinct colors in hex format.
 */
function getColor(name) {
    const index = modulo(stringHash(name), colorList.length);
    return colorList[index];
}
/**
 * Compute the a modulo value.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 * @param n The numerator
 * @param d The divisor
 * @returns the modulo value
 */
function modulo(n, d) {
    return ((n % d) + d) % d;
}
/**
 * Adapted from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */
function stringHash(value) {
    var hash = 0, i, chr;
    for (i = 0; i < value.length; i++) {
        chr = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

exports.FirestoreProvider = FirestoreProvider;
exports.deleteYjsData = deleteYjsData;
exports.getColor = getColor;
//# sourceMappingURL=index.cjs.js.map
