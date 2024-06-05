import { createMutex } from 'lib0/mutex';
import { Observable } from 'lib0/observable';
import * as Y from 'yjs';
import SimplePeer from 'simple-peer/simplepeer.min.js';
import * as awarenessProtocol from 'y-protocols/awareness';
import { FirebaseApp } from 'firebase/app';
import { Unsubscribe } from 'firebase/firestore';
export declare class FirestoreWebrtcConn implements IWebrtcConn {
    peer: SimplePeer.Instance;
    connected: boolean;
    remotePeerId: string;
    room: Room;
    closed: boolean;
    synced: boolean;
    /**
     * The list of id values for signal messages sent to the peer via Firestore.
     * If a connection is not established within the CONNECTION_TIMEOUT period,
     * these messages and the peer's `announce` document will be deleted from Firestore.
     */
    private signals;
    private connectionTimeoutId;
    constructor(signalingConn: FirestoreSignalingConn, initiator: boolean, remotePeerId: string, room: Room, fromAnnounce: boolean);
    abort(): void;
    handleUnresponsivePeer(): Promise<void>;
    /**
     * Capture the id of a signal message added to Firestore.
     * If a connection is not established within the time window, these messages will be removed.
     *
     * @param signalId The id of the signal added to firestore
     */
    addSignal(signalId: string): void;
    destroy(): void;
}
interface IWebrtcConn {
    peer: SimplePeer.Instance;
    connected: boolean;
    remotePeerId: string;
    room: Room;
    closed: boolean;
    synced: boolean;
    destroy: () => void;
}
export interface AwarenessChanges {
    added: Array<any>;
    updated: Array<any>;
    removed: Array<any>;
}
export declare class Room {
    name: string;
    key: CryptoKey | null;
    provider: FirestoreWebrtcProvider;
    peerId: string;
    doc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    synced: boolean;
    webrtcConns: Map<string, FirestoreWebrtcConn>;
    /** The set of ids for peers connected via the broadcast channel  */
    bcConns: Set<string>;
    mux: ReturnType<typeof createMutex>;
    bcconnected: boolean;
    _bcSubscriber: (data: ArrayBuffer) => any;
    _awarenessUpdateHandler: (changes: AwarenessChanges, transactionOrigin?: any) => void;
    _beforeUnloadHandler: () => void;
    constructor(doc: Y.Doc, provider: FirestoreWebrtcProvider, name: string, key: CryptoKey | null);
    connect(): void;
    disconnect(): void;
    destroy(): void;
}
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
export declare class FirestoreWebrtcProvider extends Observable<any> {
    doc: Y.Doc;
    roomName: string;
    room: Room | null;
    filterBcConns: boolean;
    awareness: awarenessProtocol.Awareness;
    signalingConn: FirestoreSignalingConn | null;
    maxConns: number;
    peerOpts: any;
    key: Promise<CryptoKey | null>;
    private handleOnline;
    constructor(firebaseApp: FirebaseApp, roomName: string, doc: Y.Doc, { password, awareness, maxConns, // the random factor reduces the chance that n clients form a cluster
    filterBcConns, peerOpts }?: {
        password?: null | undefined;
        awareness?: awarenessProtocol.Awareness | undefined;
        maxConns?: number | undefined;
        filterBcConns?: boolean | undefined;
        peerOpts?: {} | undefined;
    });
    /**
     * @type {boolean}
     */
    get connected(): boolean;
    destroy(): void;
}
export declare class FirestoreSignalingConn {
    readonly basePath: string;
    readonly firebaseApp: FirebaseApp;
    private announceCreatedAt;
    private announceUnsubscribe;
    private signalUnsubscribe;
    private announceIntervalToken;
    private room;
    constructor(firebaseApp: FirebaseApp, basePath: string, room: Room);
    destroy(): void;
    publishSignal(to: string, signal: any): Promise<void>;
    /**
     * Create a listener for the room's `announce` messages.
     * @returns The `Unsubscribe` function for the listener
     */
    private subscribeAnnounce;
    subscribeSignal(): Unsubscribe;
    private decrypt;
    publishAnnounce(fromRemove?: boolean): Promise<void>;
    getAnnouncePath(): string;
    deleteAnnounceDoc(): Promise<void>;
    private encodeData;
    private save;
}
export {};
