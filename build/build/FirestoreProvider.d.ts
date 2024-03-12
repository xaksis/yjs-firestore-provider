import { FirebaseApp } from "@firebase/app";
import { Observable } from "lib0/observable";
import * as awarenessProtocol from "y-protocols/awareness";
import * as Y from "yjs";
export declare function deleteYjsData(firebaseApp: FirebaseApp, path: string[], updateSet?: Set<string>): Promise<void>;
/**
 * Optional configuration settings for FirestoreProvider
 */
export interface FirestoreProviderConfig {
    /**
     * The maximum number of update events allowed in a blob, set to 20 by default.
     * You can decrease latency by setting this parameter to a lower value. Setting it to 1 will
     * cause the FirestoreProvider to emit every single update event immediately, at the penalty of
     * increased cost due to more frequent writes.
     */
    maxUpdatesPerBlob?: number;
    /**
     * The maximum amount of time in milliseconds that the user may pause in making
     * changes before a blob is emitted, set to 600 ms by default.  Setting this parameter to a smaller
     * value will reduce latency, but again, at the penalty of increased cost due to more frequent writes.
     * Setting it to a higher value will increase latency and reduce cost.
     */
    maxUpdatePause?: number;
    /**
     * The maximum amount of time in milliseconds that a blob of updates can live in Firestore
     * before it is removed and merged into the consolidated history. By default, this parameter is set to
     * 10000 (i.e. 10 seconds).  As a best practice, applications should stick with this default.
     */
    blobTimeToLive?: number;
    /**
     * A flag that determines whether awareness should be disabled. The default value is `false`.
     */
    disableAwareness?: boolean;
}
/**
 * A Yjs Provider that stores document updates in a Firestore collection.
 */
export declare class FirestoreProvider extends Observable<any> {
    readonly doc: Y.Doc;
    error?: Error;
    awareness: awarenessProtocol.Awareness | null;
    private firebaseApp;
    private unsubscribe?;
    private clock;
    private basePath;
    private cache?;
    private maxUpdatePause;
    private maxUpdatesPerBlob;
    /**
     * The amount of time that an individual update is allowed to live in the
     * "updates" collection until it is merged into "yjs/baseline"
     */
    private blobTimeToLive;
    private updateCount;
    /**
     * The id for a timer that will save pending updates after an elapsed time
     */
    private saveTimeoutId?;
    private compressIntervalId?;
    private updateHandler;
    private destroyHandler;
    private eventHandlers;
    private transactionHandler;
    private updateMap;
    private isStopped;
    private webrtcProvider;
    constructor(firebaseApp: FirebaseApp, ydoc: Y.Doc, path: string[], eventHandlers: {
        onRemoteChange: () => {};
        onUpdateStart: () => {};
        onUpdateEnd: () => {};
    }, config?: FirestoreProviderConfig);
    destroy(): void;
    /**
     * Destroy this provider, and permanently delete the
     * Yjs data
     */
    deleteYjsData(): Promise<void>;
    private compress;
    private shutdown;
    private save;
}
