import * as _firebase_firestore from '@firebase/firestore';
import * as i0 from '@angular/core';
import { NgZone, InjectionToken } from '@angular/core';
import { DocumentReference, CollectionReference, Query, DocumentData, DocumentSnapshot, QuerySnapshot, QueryConstraint, Transaction, QueryDocumentSnapshot, WriteBatch, Firestore, SnapshotListenOptions } from 'firebase/firestore';
import { DeepKeys, WriteOptions, FireEntity, Params, UpdateCallback } from 'ngfire/core';
import { Observable } from 'rxjs';

type Reference<E> = CollectionReference<E> | DocumentReference<E>;
type Snapshot<E = DocumentData> = DocumentSnapshot<E> | QuerySnapshot<E>;
declare class FirestoreService {
    private memoryRef;
    private injector;
    private plateformId;
    /** Transfer state between server and  */
    private transferState;
    /** Cache based state for document */
    private state;
    get db(): _firebase_firestore.Firestore;
    /** @internal Should only be used by FireCollection services */
    setState<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>, snap: Snapshot<E>): void;
    getState<E>(ref: DocumentReference<E>, delay?: number): DocumentSnapshot<E>;
    getState<E>(ref: CollectionReference<E>, delay?: number): QuerySnapshot<E>;
    getState<E>(ref: Query<E>, delay?: number): QuerySnapshot<E>;
    getState<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>): Snapshot<E> | undefined;
    /** @internal Should only be used by FireCollection services */
    fromMemory<E>(ref: DocumentReference<E>, delay?: number): Observable<DocumentSnapshot<E>>;
    fromMemory<E>(ref: CollectionReference<E>, delay?: number): Observable<QuerySnapshot<E>>;
    fromMemory<E>(ref: Query<E>, delay?: number): Observable<QuerySnapshot<E>>;
    fromMemory<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>, delay?: number): Observable<Snapshot<E>>;
    /**
     * @internal Should only be used by FireCollection services
     * Get the transfer state for a specific ref and put it in the memory state
     * Remove the reference to transfer state after first call
     */
    getTransfer<E>(ref: DocumentReference<E>): E | undefined;
    getTransfer<E>(ref: CollectionReference<E> | Query<E>): E[] | undefined;
    getTransfer<E>(ref: DocumentReference<E> | CollectionReference<E> | Query<E>): E[] | E | undefined;
    /** @internal Should only be used by FireCollection services */
    setTransfer<E>(ref: DocumentReference<E>, value?: E): void;
    setTransfer<E>(ref: DocumentReference<E>[] | CollectionReference<E> | Query<E>, value?: E[]): void;
    setTransfer<E>(ref: DocumentReference<E> | DocumentReference<E>[] | CollectionReference<E> | Query<E>, value?: E | E[]): void;
    clearCache(paths: string | string[] | Query): void;
    /** Get the reference of the document, collection or query */
    getRef<E>(path: string): Reference<E>;
    getRef<E>(paths: string[]): DocumentReference<E>[];
    getRef<E>(path: string, constraints: QueryConstraint[]): Query<E>;
    batch(): _firebase_firestore.WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<FirestoreService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FirestoreService>;
}

declare abstract class FireDocument<E extends DocumentData> {
    protected platformId: Object;
    protected zone: NgZone;
    protected firestore: FirestoreService;
    protected abstract readonly path: string;
    protected idKey: DeepKeys<E>;
    /** If true, will store the document id (IdKey) onto the document */
    protected storeId: boolean;
    /**
     * Cache the snapshot into a global store
     */
    protected memorize: boolean;
    /**
     * Delay before unsubscribing to a query (used only with memorized is true)
     * Use Infinty for application long subscription
     */
    protected delayToUnsubscribe: number;
    protected onCreate?(entity: E, options: WriteOptions): unknown;
    protected onUpdate?(entity: FireEntity<E>, options: WriteOptions): unknown;
    protected onDelete?(path: string, options: WriteOptions): unknown;
    protected get db(): _firebase_firestore.Firestore;
    protected useCache<T extends E>(ref: DocumentReference<T>): Observable<T | undefined>;
    protected clearCache<T extends E>(ref: DocumentReference<T>): void;
    /** Function triggered when adding/updating data to firestore */
    protected toFirestore<T extends E = E>(entity: FireEntity<T>, actionType: 'create' | 'update'): any | Promise<any>;
    /** Function triggered when getting data from firestore */
    protected fromFirestore<T extends E = E>(snapshot: DocumentSnapshot<T> | QueryDocumentSnapshot<T>): Promise<T> | T | undefined;
    batch(): WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(params?: Params): string;
    /** Get the content of the snapshot */
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>): T | Promise<T>;
    /** Get the content of reference(s) */
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>): Promise<T | undefined>;
    /** Observable the content of reference(s)  */
    protected fromRef<T extends E = E>(ref: DocumentReference<T>): Observable<T | undefined>;
    /** Get the reference of the document, collection or query */
    getRef<T extends E>(parameters?: Params): DocumentReference<T>;
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(parameters?: Params): Promise<T | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request) */
    load<T extends E>(parameters?: Params): Promise<T | undefined>;
    /** Return the current value of the document from Firestore */
    getValue<T extends E = E>(parameters?: Params): Promise<T | undefined>;
    /** Listen to the changes of values of the document from Firestore */
    valueChanges<T extends E = E>(parameters?: Params): Observable<T | undefined>;
    /**
     * Create or update the document
     * @param document The document to upsert
     * @param options options to write the document on firestore
     */
    upsert<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<string>;
    /**
     * Create the document at the specified path
     * @param document The document to create
     * @param options options to write the document on firestore
     */
    create<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<string>;
    /**
     * Delete the document from firestore
     * @param options options to write the document on firestore
     */
    delete<T extends E>(options?: WriteOptions): Promise<void>;
    /** Update document in Firestore */
    update<T extends E>(document: FireEntity<T>, options?: WriteOptions): Promise<void>;
    update<T extends E>(documentChanges: UpdateCallback<T>, options?: WriteOptions): Promise<void>;
}

declare abstract class FireCollection<E extends DocumentData> {
    protected platformId: Object;
    protected zone: NgZone;
    protected firestore: FirestoreService;
    protected abstract readonly path: string;
    protected idKey: DeepKeys<E>;
    /** If true, will store the document id (IdKey) onto the document */
    protected storeId: boolean;
    /**
     * Cache the snapshot into a global store
     */
    protected memorize: boolean;
    /**
     * Delay before unsubscribing to a query (used only with memorized is true)
     * Use Infinty for application long subscription
     */
    protected delayToUnsubscribe: number;
    protected onCreate?(entity: E, options: WriteOptions): unknown;
    protected onUpdate?(entity: FireEntity<E>, options: WriteOptions): unknown;
    protected onDelete?(id: string, options: WriteOptions): unknown;
    protected get db(): _firebase_firestore.Firestore;
    protected useCache<T extends E>(ref: DocumentReference<T>): Observable<T>;
    protected useCache<T extends E>(ref: Query<T>): Observable<T[]>;
    protected useCache<T extends E>(ref: DocumentReference<T> | Query<T>): Observable<T | T[]>;
    protected clearCache<T extends E>(refs: CollectionReference<T> | DocumentReference<T> | Query<T> | DocumentReference<T>[]): void;
    /** Function triggered when adding/updating data to firestore */
    protected toFirestore(entity: FireEntity<E>, actionType: 'add' | 'update'): any | Promise<any>;
    /** Function triggered when getting data from firestore */
    protected fromFirestore(snapshot: DocumentSnapshot<E> | QueryDocumentSnapshot<E>): E | undefined;
    batch(): WriteBatch;
    runTransaction<T>(cb: (transaction: Transaction) => Promise<T>): Promise<T>;
    createId(): string;
    /** Get the content of the snapshot */
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>): T;
    protected snapToData<T extends E = E>(snap: DocumentSnapshot<T>[]): T[];
    protected snapToData<T extends E = E>(snap: QuerySnapshot<T>): T[];
    protected snapToData<T extends E = E>(snap: QuerySnapshot<T> | DocumentSnapshot<T> | DocumentSnapshot<T>[]): T | T[];
    /** Get the content of reference(s) */
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>): Promise<T | undefined>;
    protected getFromRef<T extends E = E>(ref: DocumentReference<T>[]): Promise<T[]>;
    protected getFromRef<T extends E = E>(ref: CollectionReference<T> | Query<T>): Promise<T[]>;
    protected getFromRef<T extends E = E>(ref: DocumentReference<T> | DocumentReference<T>[] | CollectionReference<T> | Query<T>): Promise<undefined | T | T[]>;
    /** Observable the content of reference(s)  */
    protected fromRef<T extends E = E>(ref: DocumentReference<T>): Observable<T | undefined>;
    protected fromRef<T extends E = E>(ref: DocumentReference<T>[]): Observable<T[]>;
    protected fromRef<T extends E = E>(ref: CollectionReference<T> | Query<T>): Observable<T[]>;
    protected fromRef<T extends E = E>(ref: DocumentReference<T> | DocumentReference<T>[] | CollectionReference<T> | Query<T>): Observable<undefined | T | T[]>;
    /** Get the reference of the document, collection or query */
    getRef<T extends E = E>(): CollectionReference<T>;
    getRef<T extends E = E>(ids: string[], params?: Params): DocumentReference<T>[];
    getRef<T extends E = E>(constraints: QueryConstraint[], params: Params): Query<T>;
    getRef<T extends E = E>(id: string, params?: Params): DocumentReference<T>;
    getRef<T extends E = E>(path: string, params?: Params): DocumentReference<T> | CollectionReference<T>;
    getRef<T extends E = E>(params: Params): CollectionReference<T>;
    getRef<T extends E = E>(ids?: string | string[] | Params | QueryConstraint[], params?: Params): undefined | Query<T> | CollectionReference<T> | DocumentReference<T> | DocumentReference<T>[];
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(ids?: string[]): Promise<T[]>;
    reload<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    reload<T extends E = E>(id?: string | null): Promise<T | undefined>;
    reload<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Promise<T | T[] | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request) */
    load<T extends E = E>(ids?: string[]): Promise<T[]>;
    load<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    load<T extends E = E>(id?: string | null): Promise<T | undefined>;
    load<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Promise<T | T[] | undefined>;
    /** Return the current value of the path from Firestore */
    getValue<T extends E = E>(ids?: string[]): Promise<T[]>;
    getValue<T extends E = E>(query?: QueryConstraint[]): Promise<T[]>;
    getValue<T extends E = E>(id?: string | null): Promise<T | undefined>;
    getValue<T extends E = E>(idOrQuery?: null | string | string[] | QueryConstraint[]): Promise<T | T[] | undefined>;
    /** Listen to the changes of values of the path from Firestore */
    valueChanges<T extends E = E>(ids?: string[]): Observable<T[]>;
    valueChanges<T extends E = E>(query?: QueryConstraint[]): Observable<T[]>;
    valueChanges<T extends E = E>(id?: string | null): Observable<T | undefined>;
    valueChanges<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | null): Observable<T | T[] | undefined>;
    /**
     * Create or update documents
     * @param documents One or many documents
     * @param options options to write the document on firestore
     */
    upsert<T extends E>(documents: FireEntity<T>, options?: WriteOptions): Promise<string>;
    upsert<T extends E>(documents: FireEntity<T>[], options?: WriteOptions): Promise<string[]>;
    /**
     * Add a document or a list of document to Firestore
     * @param docs A document or a list of document
     * @param options options to write the document on firestore
     */
    add<T extends E>(documents: FireEntity<T>, options?: WriteOptions): Promise<string>;
    add<T extends E>(documents: FireEntity<T>[], options?: WriteOptions): Promise<string[]>;
    /**
     * Remove one or several document from Firestore
     * @param id A unique or list of id representing the document
     * @param options options to write the document on firestore
     */
    remove<T extends E>(id: string | string[], options?: WriteOptions): Promise<void>;
    /** Remove all document of the collection */
    removeAll(options?: WriteOptions): Promise<void>;
    /**
     * Update one or several document in Firestore
     */
    update<T extends E>(entity: FireEntity<T> | FireEntity<T>[], options?: WriteOptions): Promise<void>;
    update<T extends E>(id: string | string[], entityChanges: FireEntity<T>, options?: WriteOptions): Promise<void>;
    update<T extends E>(ids: string | string[], stateFunction: UpdateCallback<T>, options?: WriteOptions): Promise<Transaction[]>;
}

declare abstract class FireSubCollection<E> extends FireCollection<E> {
    abstract path: string;
    protected pathKey: string;
    get groupId(): string;
    /** Function triggered when getting data from firestore */
    protected fromFirestore(snapshot: DocumentSnapshot<E> | QueryDocumentSnapshot<E>): E | undefined;
    getGroupRef<T extends E = E>(constraints?: QueryConstraint[]): Query<T> | undefined;
    /** Observable the content of group reference(s)  */
    protected fromGroupRef<T extends E = E>(ref: Query<T>): Observable<T[]>;
    /** Return the current value of the path from Firestore */
    getValue<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(params: Params): Promise<T[]>;
    getValue<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(id?: string | null, params?: Params): Promise<T | undefined>;
    /** Clear cache and get the latest value into the cache */
    reload<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    reload<T extends E = E>(params: Params): Promise<T[]>;
    reload<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    reload<T extends E = E>(id?: string | null, params?: Params): Promise<T | undefined>;
    /** Get the last content from the app (if value has been cached, it won't do a server request)  */
    load<T extends E = E>(ids?: string[], params?: Params): Promise<T[]>;
    load<T extends E = E>(params: Params): Promise<T[]>;
    load<T extends E = E>(query?: QueryConstraint[], params?: Params): Promise<T[]>;
    load<T extends E = E>(id?: string, params?: Params): Promise<T | undefined>;
    load<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | Params, params?: Params): Promise<T | T[] | undefined>;
    /** Return the current value of the path from Firestore */
    valueChanges<T extends E = E>(ids?: string[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(params: Params): Observable<T[]>;
    valueChanges<T extends E = E>(query?: QueryConstraint[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(id?: string, params?: Params): Observable<T | undefined>;
    valueChanges<T extends E = E>(idOrQuery?: string | string[] | QueryConstraint[] | Params, params?: Params): Observable<T | T[] | undefined>;
}

declare const FIRESTORE: InjectionToken<Firestore>;

declare function stringifyQuery(query: Query): string;
/** Returns a debug description for `filter`. */
declare function stringifyFilter(filter: any): string;
declare function stringifyOrderBy(orderBy: any): string;

/** Return the full path of the doc */
declare function getDocPath(path: string, id: string): string;
/** Recursively all Timestamp into Date */
declare function toDate<D>(target: D): D;

declare function fromRef<T = DocumentData>(ref: DocumentReference<T>, options?: SnapshotListenOptions): Observable<DocumentSnapshot<T>>;
declare function fromRef<T = DocumentData>(ref: Query<T>, options?: SnapshotListenOptions): Observable<QuerySnapshot<T>>;
declare function fromRef<T = DocumentData>(ref: DocumentReference<T> | Query<T>, options: SnapshotListenOptions): Observable<DocumentSnapshot<T>> | Observable<QuerySnapshot<T>>;

export { FIRESTORE, FireCollection, FireDocument, FireSubCollection, FirestoreService, fromRef, getDocPath, stringifyFilter, stringifyOrderBy, stringifyQuery, toDate };
