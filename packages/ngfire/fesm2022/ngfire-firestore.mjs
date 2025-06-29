import * as i0 from '@angular/core';
import { InjectionToken, inject, Injector, PLATFORM_ID, TransferState, makeStateKey, Injectable, NgZone } from '@angular/core';
import { onSnapshot, initializeFirestore, collection, query, doc, writeBatch, runTransaction, Timestamp, getDoc, Transaction, setDoc, updateDoc, DocumentSnapshot, getDocs, collectionGroup } from 'firebase/firestore';
import { Observable, firstValueFrom, of, combineLatest, from } from 'rxjs';
import { exist, isCollectionRef, isQuery, shareWithDelay, assertPath, assertCollection, isDocPath, keepUnstableUntilFirst, pathWithParams, isNotUndefined, isPathRef, isIdList } from 'ngfire/core';
import { switchMap, tap, startWith, map } from 'rxjs/operators';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { getConfig, FIRESTORE_SETTINGS } from 'ngfire/tokens';
import { FIREBASE_APP } from 'ngfire/app';

const DEFAULT_OPTIONS = { includeMetadataChanges: false };
function fromRef(ref, options = DEFAULT_OPTIONS) {
    /* eslint-enable @typescript-eslint/no-explicit-any */
    return new Observable(subscriber => {
        const unsubscribe = onSnapshot(ref, options, {
            next: subscriber.next.bind(subscriber),
            error: subscriber.error.bind(subscriber),
            complete: subscriber.complete.bind(subscriber),
        });
        return { unsubscribe };
    });
}

const FIRESTORE = new InjectionToken('Firestore instance', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const settings = inject(FIRESTORE_SETTINGS, { optional: true });
        const app = inject(FIREBASE_APP);
        if (config.firestore) {
            return config.firestore(app, settings ?? {});
        }
        else {
            return initializeFirestore(app, settings ?? {});
        }
    },
});

// Simplfied version of
// https://github.com/firebase/firebase-js-sdk/blob/master/packages/firestore/src/core/query.ts#L442
function stringifyQuery(query) {
    if ('_query' in query) {
        const target = query['_query'];
        return `${stringifyTarget(target)}|lt:${target.limitType})`;
    }
    return '';
}
function stringifyTarget(target) {
    if (!target.orderBy)
        target.orderBy = [];
    let str = target.path.canonicalString();
    if (target.collectionGroup !== null) {
        str += '|cg:' + target.collectionGroup;
    }
    if (target.filters.length > 0) {
        const fields = target.filters
            .map((f) => stringifyFilter(f))
            .join(', ');
        str += `|f:[${fields}]`;
    }
    if (exist(target.limit)) {
        str += '|l:' + target.limit;
    }
    if (target.orderBy.length > 0) {
        const order = target.orderBy
            .map((o) => stringifyOrderBy(o))
            .join(', ');
        str += `|ob:[${order}]`;
    }
    if (target.startAt) {
        str += '|lb:';
        str += target.startAt.inclusive ? 'b:' : 'a:';
        str += target.startAt.position.map((p) => canonifyValue(p)).join(',');
    }
    if (target.endAt) {
        str += '|ub:';
        str += target.endAt.inclusive ? 'a:' : 'b:';
        str += target.endAt.position.map((p) => canonifyValue(p)).join(',');
    }
    return str;
}
/** Returns a debug description for `filter`. */
function stringifyFilter(filter) {
    return `${filter.field.canonicalString()} ${filter.op} ${canonifyValue(filter.value)}`;
}
function stringifyOrderBy(orderBy) {
    return `${orderBy.field.canonicalString()} (${orderBy.dir})`;
}
/* eslint-disable */
function canonifyValue(value) {
    if ('nullValue' in value) {
        return 'null';
    }
    else if ('booleanValue' in value) {
        return '' + value.booleanValue;
    }
    else if ('integerValue' in value) {
        return '' + value.integerValue;
    }
    else if ('doubleValue' in value) {
        return '' + value.doubleValue;
    }
    else if ('timestampValue' in value) {
        return canonifyTimestamp(value.timestampValue);
    }
    else if ('stringValue' in value) {
        return value.stringValue;
    }
    else if ('bytesValue' in value) {
        return canonifyByteString(value.bytesValue);
    }
    else if ('referenceValue' in value) {
        return value.referenceValue;
    }
    else if ('geoPointValue' in value) {
        return canonifyGeoPoint(value.geoPointValue);
    }
    else if ('arrayValue' in value) {
        return canonifyArray(value.arrayValue);
    }
    else if ('mapValue' in value) {
        return canonifyMap(value.mapValue);
    }
    else {
        throw new Error('Invalid value type: ' + JSON.stringify(value));
    }
}
/* eslint-enable */
function canonifyByteString(byteString) {
    if (typeof byteString === 'string')
        return byteString;
    return byteString.toString();
}
function canonifyTimestamp(timestamp) {
    return `time(${timestamp.toString()})`;
}
function canonifyGeoPoint(geoPoint) {
    return `geo(${geoPoint.latitude},${geoPoint.longitude})`;
}
function canonifyMap(mapValue) {
    // Iteration order in JavaScript is not guaranteed. To ensure that we generate
    // matching canonical IDs for identical maps, we need to sort the keys.
    const sortedKeys = Object.keys(mapValue.fields || {}).sort();
    // eslint-disable-next-line
    const content = sortedKeys.map(key => `${key}:${canonifyValue(mapValue.fields[key])}`).join(',');
    return `{${content}}`;
}
function canonifyArray(arrayValue) {
    const values = arrayValue.values || [];
    return `[${values.map(canonifyValue).join(',')}]`;
}

class FirestoreService {
    memoryRef = {};
    injector = inject(Injector);
    plateformId = inject(PLATFORM_ID);
    /** Transfer state between server and  */
    transferState = inject(TransferState, { optional: true });
    /** Cache based state for document */
    state = new Map();
    get db() {
        return this.injector.get(FIRESTORE);
    }
    /** @internal Should only be used by FireCollection services */
    setState(ref, snap) {
        if (isCollectionRef(ref)) {
            snap.forEach(doc => this.state.set(doc.ref.path, doc));
            this.state.set(ref.path, snap);
        }
        else if (isQuery(ref)) {
            snap.forEach(doc => this.state.set(doc.ref.path, doc));
            const key = stringifyQuery(ref);
            this.state.set(key, snap);
        }
        else {
            this.state.set(ref.path, snap);
        }
    }
    getState(ref) {
        if (isQuery(ref)) {
            const key = stringifyQuery(ref);
            return this.state.get(key);
        }
        else {
            return this.state.get(ref.path);
        }
    }
    fromMemory(ref, delay) {
        const key = isQuery(ref) ? stringifyQuery(ref) : ref.path;
        if (!this.memoryRef[key]) {
            this.memoryRef[key] = fromRef(ref).pipe(shareWithDelay(delay));
        }
        return this.memoryRef[key];
    }
    getTransfer(ref) {
        if (!this.transferState || !isPlatformBrowser(this.plateformId))
            return;
        const key = isQuery(ref) ? stringifyQuery(ref) : ref.path;
        const stateKey = makeStateKey(key);
        if (!this.transferState.hasKey(stateKey))
            return;
        const value = this.transferState.get(stateKey, undefined);
        this.transferState.remove(stateKey);
        return value;
    }
    setTransfer(ref, value) {
        if (!value)
            return;
        if (!this.transferState || !isPlatformServer(this.plateformId))
            return;
        if (Array.isArray(ref) && Array.isArray(value)) {
            ref.forEach((reference, i) => this.setTransfer(reference, value[i]));
        }
        else if (!Array.isArray(ref)) {
            const key = isQuery(ref) ? stringifyQuery(ref) : ref.path;
            this.transferState.set(makeStateKey(key), value);
        }
    }
    clearCache(paths) {
        if (!paths)
            return;
        if (Array.isArray(paths)) {
            for (const path of paths) {
                delete this.memoryRef[path];
                this.state.delete(path);
            }
        }
        else if (typeof paths === 'string') {
            delete this.memoryRef[paths];
            this.state.delete(paths);
        }
        else {
            const key = stringifyQuery(paths);
            delete this.memoryRef[key];
            this.state.delete(key);
        }
    }
    // overload used internally when looping over paths array
    getRef(paths, constraints) {
        if (!arguments.length || !paths)
            return undefined;
        // Array of docs
        if (Array.isArray(paths)) {
            return paths.map((path) => this.getRef(path));
        }
        const hasContraints = Array.isArray(constraints);
        if (hasContraints) {
            assertPath(paths);
            assertCollection(paths);
            const ref = collection(this.db, paths);
            return query(ref, ...constraints);
        }
        else {
            assertPath(paths);
            if (isDocPath(paths))
                return doc(this.db, paths);
            return collection(this.db, paths);
        }
    }
    batch() {
        return writeBatch(this.db);
    }
    runTransaction(cb) {
        return runTransaction(this.db, (tx) => cb(tx));
    }
    createId() {
        return doc(collection(this.db, '__')).id;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FirestoreService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FirestoreService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FirestoreService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Return the full path of the doc */
function getDocPath(path, id) {
    // If path is smaller than id, id is the full path from ref
    return path.split('/').length < id.split('/').length ? id : `${path}/${id}`;
}
/** Recursively all Timestamp into Date */
function toDate(target) {
    if (typeof target !== 'object')
        return target;
    for (const key in target) {
        const value = target[key];
        if (!value || typeof value !== 'object')
            continue;
        if (value instanceof Timestamp) {
            target[key] = value.toDate();
            continue;
        }
        toDate(value);
    }
    return target;
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/////////////
// SERVICE //
/////////////
class FireDocument {
    platformId = inject(PLATFORM_ID);
    zone = inject(NgZone);
    firestore = inject(FirestoreService);
    idKey = 'id';
    /** If true, will store the document id (IdKey) onto the document */
    storeId = false;
    /**
     * Cache the snapshot into a global store
     */
    memorize = false;
    /**
     * Delay before unsubscribing to a query (used only with memorized is true)
     * Use Infinty for application long subscription
     */
    delayToUnsubscribe = 0;
    get db() {
        return this.firestore.db;
    }
    useCache(ref) {
        if (isPlatformServer(this.platformId)) {
            return this.zone.runOutsideAngular(() => fromRef(ref)).pipe(switchMap(async (snap) => this.snapToData(snap)), tap(value => this.firestore.setTransfer(ref, value)), keepUnstableUntilFirst(this.zone));
        }
        if (!this.memorize) {
            return this.zone.runOutsideAngular(() => fromRef(ref)).pipe(switchMap(async (snap) => this.snapToData(snap)), keepUnstableUntilFirst(this.zone));
        }
        const transfer = this.firestore.getTransfer(ref);
        const initial = this.firestore.getState(ref);
        const snap$ = this.zone.runOutsideAngular(() => this.firestore.fromMemory(ref, this.delayToUnsubscribe)).pipe(tap(snap => this.firestore.setState(ref, snap)), keepUnstableUntilFirst(this.zone));
        if (transfer)
            return snap$.pipe(switchMap(async (snap) => this.snapToData(snap)), startWith(transfer));
        if (initial)
            return snap$.pipe(startWith(initial), switchMap(async (snap) => this.snapToData(snap)));
        return snap$.pipe(switchMap(async (snap) => this.snapToData(snap)));
    }
    clearCache(ref) {
        return this.firestore.clearCache(ref.path);
    }
    /** Function triggered when adding/updating data to firestore */
    toFirestore(entity, actionType) {
        if (actionType === 'create') {
            const _meta = { createdAt: new Date(), modifiedAt: new Date() };
            return { _meta, ...entity };
        }
        else {
            return { ...entity, '_meta.modifiedAt': new Date() };
        }
    }
    /** Function triggered when getting data from firestore */
    fromFirestore(snapshot) {
        if (snapshot.exists()) {
            return { ...toDate(snapshot.data()), [this.idKey]: snapshot.id };
        }
        else {
            return undefined;
        }
    }
    batch() {
        return writeBatch(this.db);
    }
    runTransaction(cb) {
        return runTransaction(this.db, (tx) => cb(tx));
    }
    createId(params) {
        return this.getRef(params)?.id;
    }
    /** Get the content of the snapshot */
    snapToData(snap) {
        return this.fromFirestore(snap);
    }
    /** Get the content of reference(s) */
    async getFromRef(ref) {
        const snap = await getDoc(ref);
        return this.snapToData(snap);
    }
    /** Observable the content of reference(s)  */
    fromRef(ref) {
        return this.useCache(ref);
    }
    ///////////////
    // SNAPSHOTS //
    ///////////////
    /** Get the reference of the document, collection or query */
    getRef(parameters) {
        const path = parameters ? pathWithParams(this.path, parameters) : this.path;
        const ref = this.firestore.getRef(path);
        if (!ref)
            throw new Error(`Could not create a reference out of path "${path}"`);
        return ref;
    }
    /** Clear cache and get the latest value into the cache */
    async reload(parameters) {
        if (!this.memorize)
            return;
        const ref = this.getRef(parameters);
        this.clearCache(ref);
        return this.load(parameters);
    }
    /** Get the last content from the app (if value has been cached, it won't do a server request) */
    async load(parameters) {
        return firstValueFrom(this.valueChanges(parameters));
    }
    /** Return the current value of the document from Firestore */
    async getValue(parameters) {
        const ref = this.getRef(parameters);
        return this.getFromRef(ref);
    }
    /** Listen to the changes of values of the document from Firestore */
    valueChanges(parameters) {
        const ref = this.getRef(parameters);
        return this.fromRef(ref);
    }
    ///////////
    // WRITE //
    ///////////
    /**
     * Create or update the document
     * @param document The document to upsert
     * @param options options to write the document on firestore
     */
    async upsert(document, options = {}) {
        const id = document[this.idKey];
        if (typeof id !== 'string')
            return this.create(document, options);
        const ref = this.getRef(options.params);
        const snap = (options?.write instanceof Transaction)
            ? await options.write?.get(ref)
            : await getDoc(ref);
        if (snap.exists())
            return this.create(document, options);
        await this.update(document, options);
        return id;
    }
    /**
     * Create the document at the specified path
     * @param document The document to create
     * @param options options to write the document on firestore
     */
    async create(document, options = {}) {
        const baseId = document[this.idKey];
        const id = typeof baseId === 'string' ? baseId : this.createId();
        const data = await this.toFirestore(document, 'create');
        if (this.storeId)
            data[this.idKey] = id;
        const ref = this.getRef(options.params);
        if (options.write) {
            options.write.set(ref, data);
        }
        else {
            await setDoc(ref, data);
        }
        if (this.onCreate) {
            await this.onCreate(data, { write: options.write, ctx: options.ctx });
        }
        return id;
    }
    /**
     * Delete the document from firestore
     * @param options options to write the document on firestore
     */
    async delete(options = {}) {
        const { write = this.batch(), ctx, params } = options;
        const ref = this.getRef(params);
        write.delete(ref);
        if (this.onDelete) {
            await this.onDelete(ref.path, { write, ctx });
        }
        // If there is no atomic write provided
        if (!options.write) {
            await write.commit();
            if (this.memorize)
                this.clearCache(ref);
        }
    }
    async update(changes, options = {}) {
        const ref = this.getRef(options.params);
        if (typeof changes === 'function') {
            await runTransaction(this.db, async (tx) => {
                const snapshot = await tx.get(ref);
                const doc = await this.fromFirestore(snapshot);
                if (doc && changes) {
                    const data = await changes(doc, tx);
                    const result = await this.toFirestore(data, 'update');
                    tx.update(ref, result);
                    if (this.onUpdate) {
                        await this.onUpdate(data, { write: tx, ctx: options.ctx });
                    }
                }
            });
        }
        else {
            const doc = await this.toFirestore(changes, 'update');
            if (options.write) {
                options.write.update(ref, doc);
            }
            else {
                await updateDoc(ref, doc);
            }
            if (this.onUpdate) {
                await this.onUpdate(doc, { write: options.write, ctx: options.ctx });
            }
        }
        if (this.memorize)
            this.clearCache(ref);
    }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/////////////
// SERVICE //
/////////////
class FireCollection {
    platformId = inject(PLATFORM_ID);
    zone = inject(NgZone);
    firestore = inject(FirestoreService);
    idKey = 'id';
    /** If true, will store the document id (IdKey) onto the document */
    storeId = false;
    /**
     * Cache the snapshot into a global store
     */
    memorize = false;
    /**
     * Delay before unsubscribing to a query (used only with memorized is true)
     * Use Infinty for application long subscription
     */
    delayToUnsubscribe = 0;
    get db() {
        return this.firestore.db;
    }
    useCache(ref) {
        if (isPlatformServer(this.platformId)) {
            return this.zone.runOutsideAngular(() => fromRef(ref)).pipe(map(snap => this.snapToData(snap)), tap(value => this.firestore.setTransfer(ref, value)), keepUnstableUntilFirst(this.zone));
        }
        if (!this.memorize) {
            return this.zone.runOutsideAngular(() => fromRef(ref)).pipe(map(snap => this.snapToData(snap)), keepUnstableUntilFirst(this.zone));
        }
        const transfer = this.firestore.getTransfer(ref);
        const initial = this.firestore.getState(ref);
        const snap$ = this.zone.runOutsideAngular(() => this.firestore.fromMemory(ref, this.delayToUnsubscribe)).pipe(tap(snap => this.firestore.setState(ref, snap)), keepUnstableUntilFirst(this.zone));
        if (transfer)
            return snap$.pipe(map(snap => this.snapToData(snap)), startWith(transfer));
        if (initial)
            return snap$.pipe(startWith(initial), map(snap => this.snapToData(snap)));
        return snap$.pipe(map(snap => this.snapToData(snap)));
    }
    clearCache(refs) {
        if (Array.isArray(refs))
            return this.firestore.clearCache(refs.map(ref => ref.path));
        if (isQuery(refs))
            return this.firestore.clearCache(refs);
        return this.firestore.clearCache(refs?.path);
    }
    /** Function triggered when adding/updating data to firestore */
    toFirestore(entity, actionType) {
        if (actionType === 'add') {
            const _meta = { createdAt: new Date(), modifiedAt: new Date() };
            return { _meta, ...entity };
        }
        else {
            return { ...entity, '_meta.modifiedAt': new Date() };
        }
    }
    /** Function triggered when getting data from firestore */
    fromFirestore(snapshot) {
        if (snapshot.exists()) {
            return { ...toDate(snapshot.data()), [this.idKey]: snapshot.id };
        }
        else {
            return undefined;
        }
    }
    batch() {
        return writeBatch(this.db);
    }
    runTransaction(cb) {
        return runTransaction(this.db, (tx) => cb(tx));
    }
    createId() {
        return doc(collection(this.db, '__')).id;
    }
    snapToData(snap) {
        if (snap instanceof DocumentSnapshot)
            return this.fromFirestore(snap);
        const snaps = Array.isArray(snap) ? snap : snap.docs;
        return snaps.map(s => this.snapToData(s)).filter(isNotUndefined);
    }
    async getFromRef(ref) {
        if (Array.isArray(ref))
            return Promise.all(ref.map(getDoc)).then(snaps => this.snapToData(snaps));
        const snap = (ref.type === 'document') ? await getDoc(ref) : await getDocs(ref);
        return this.snapToData(snap);
    }
    fromRef(ref) {
        if (Array.isArray(ref)) {
            if (!ref.length)
                return of([]);
            const queries = ref.map(r => this.useCache(r));
            return combineLatest(queries);
        }
        else {
            return this.useCache(ref);
        }
    }
    getRef(ids, parameters) {
        // Collection
        if (!arguments.length)
            return this.firestore.getRef(this.path);
        // Id is undefined or null
        if (!ids)
            return undefined;
        if (Array.isArray(ids)) {
            // List of ref
            if (ids.every(isPathRef))
                return this.firestore.getRef(ids);
            const path = pathWithParams(this.path, parameters);
            // List of ids
            if (isIdList(ids))
                return this.firestore.getRef(ids.map((id) => getDocPath(path, id)));
            // List of constraints
            return this.firestore.getRef(path, ids);
        }
        if (typeof ids === 'string') {
            // Ref
            if (isPathRef(ids))
                return this.firestore.getRef(ids);
            // Id
            const path = pathWithParams(this.path, parameters);
            return this.firestore.getRef(getDocPath(path, ids));
        }
        // Subcollection
        return this.firestore.getRef(pathWithParams(this.path, ids));
    }
    async reload() {
        if (!this.memorize)
            return;
        const ref = this.getRef(...arguments);
        if (!ref)
            return;
        this.clearCache(ref);
        return this.load(...arguments);
    }
    async load() {
        return firstValueFrom(this.valueChanges(...arguments));
    }
    async getValue() {
        const ref = this.getRef(...arguments);
        if (!ref)
            return;
        return this.getFromRef(ref);
    }
    valueChanges(idOrQuery) {
        if (Array.isArray(idOrQuery) && !idOrQuery.length)
            return of([]);
        const ref = this.getRef(...arguments);
        if (!ref)
            return of(undefined);
        return this.fromRef(ref);
    }
    async upsert(documents, options = {}) {
        const doesExist = async (doc) => {
            const id = doc[this.idKey];
            if (typeof id !== 'string')
                return false;
            const ref = this.getRef(id, options.params);
            const snap = (options.write instanceof Transaction)
                ? await options.write?.get(ref)
                : await getDoc(ref);
            return snap.exists();
        };
        const upsert = async (doc) => {
            const exists = await doesExist(doc);
            if (!exists)
                return this.add(doc, options);
            await this.update(doc, options);
            return doc[this.idKey];
        };
        return Array.isArray(documents)
            ? Promise.all(documents.map(upsert))
            : upsert(documents);
    }
    async add(documents, options = {}) {
        const docs = Array.isArray(documents) ? documents : [documents];
        const { write = this.batch(), ctx } = options;
        const operations = docs.map(async (value) => {
            const id = value[this.idKey] || this.createId();
            const data = await this.toFirestore(value, 'add');
            if (this.storeId)
                data[this.idKey] = id;
            const ref = this.getRef(id, options.params);
            write.set(ref, data);
            if (this.onCreate) {
                await this.onCreate(data, { write, ctx });
            }
            return id;
        });
        const ids = await Promise.all(operations);
        // If there is no atomic write provided
        if (!options.write) {
            await write.commit();
        }
        return Array.isArray(documents) ? ids : ids[0];
    }
    /**
     * Remove one or several document from Firestore
     * @param id A unique or list of id representing the document
     * @param options options to write the document on firestore
     */
    async remove(id, options = {}) {
        const { write = this.batch(), ctx } = options;
        const ids = Array.isArray(id) ? id : [id];
        const refs = [];
        const operations = ids.map(async (docId) => {
            const ref = this.getRef(docId, options.params);
            write.delete(ref);
            if (this.onDelete) {
                await this.onDelete(docId, { write, ctx });
            }
            refs.push(ref);
        });
        await Promise.all(operations);
        // If there is no atomic write provided
        if (!options.write) {
            await write.commit();
            if (this.memorize)
                this.clearCache(refs);
        }
    }
    /** Remove all document of the collection */
    async removeAll(options = {}) {
        const ref = options.params ? this.getRef(options.params) : this.getRef();
        const snapshot = await getDocs(ref);
        const ids = snapshot.docs.map((doc) => doc.id);
        await this.remove(ids, options);
        if (this.memorize)
            this.clearCache(ref);
    }
    async update(idsOrEntity, stateFnOrWrite, options = {}) {
        let ids = [];
        let stateFunction;
        let getData;
        const isEntity = (value) => {
            return typeof value === 'object' && value[this.idKey];
        };
        const isEntityArray = (values) => {
            return Array.isArray(values) && values.every((value) => isEntity(value));
        };
        if (isEntity(idsOrEntity)) {
            ids = [idsOrEntity[this.idKey]];
            getData = () => idsOrEntity;
            options = stateFnOrWrite || {};
        }
        else if (isEntityArray(idsOrEntity)) {
            const entityMap = new Map(idsOrEntity.map((entity) => [entity[this.idKey], entity]));
            ids = Array.from(entityMap.keys());
            getData = (docId) => entityMap.get(docId);
            options = stateFnOrWrite || {};
        }
        else if (typeof stateFnOrWrite === 'function') {
            ids = Array.isArray(idsOrEntity) ? idsOrEntity : [idsOrEntity];
            stateFunction = stateFnOrWrite;
        }
        else if (typeof stateFnOrWrite === 'object') {
            ids = Array.isArray(idsOrEntity) ? idsOrEntity : [idsOrEntity];
            getData = () => stateFnOrWrite;
        }
        else {
            throw new Error('Passed parameters match none of the function signatures.');
        }
        const { ctx } = options;
        if (!Array.isArray(ids) || !ids.length) {
            return;
        }
        // If update depends on the entity, use transaction
        if (stateFunction) {
            let refs = [];
            await runTransaction(this.db, async (tx) => {
                refs = [];
                const operations = ids.map(async (id) => {
                    const ref = this.getRef(id, options.params);
                    refs.push(ref);
                    const snapshot = await tx.get(ref);
                    const doc = this.fromFirestore(snapshot);
                    if (doc && stateFunction) {
                        const data = await stateFunction(doc, tx);
                        const result = await this.toFirestore(data, 'update');
                        tx.update(ref, result);
                        if (this.onUpdate) {
                            await this.onUpdate(data, { write: tx, ctx });
                        }
                    }
                    return tx;
                });
                return Promise.all(operations);
            });
            if (this.memorize)
                this.clearCache(refs);
        }
        else {
            const { write = this.batch() } = options;
            const refs = [];
            const operations = ids.map(async (docId) => {
                const doc = getData(docId);
                if (!docId) {
                    throw new Error(`Document should have an unique id to be updated, but none was found in ${doc}`);
                }
                const ref = this.getRef(docId, options.params);
                refs.push(ref);
                const data = await this.toFirestore(doc, 'update');
                write.update(ref, data);
                if (this.onUpdate) {
                    await this.onUpdate(doc, { write, ctx });
                }
            });
            await Promise.all(operations);
            // If there is no atomic write provided
            if (!options.write) {
                await write.commit();
                if (this.memorize)
                    this.clearCache(refs);
            }
        }
    }
}

class FireSubCollection extends FireCollection {
    pathKey = 'path';
    get groupId() {
        return this.path.split('/').pop();
    }
    /** Function triggered when getting data from firestore */
    fromFirestore(snapshot) {
        if (snapshot.exists()) {
            return {
                ...toDate(snapshot.data()),
                [this.idKey]: snapshot.id,
                [this.pathKey]: snapshot.ref.path
            };
        }
        else {
            return undefined;
        }
    }
    getGroupRef(constraints) {
        const group = collectionGroup(this.db, this.groupId);
        if (!arguments.length)
            return group;
        if (!constraints)
            return;
        return query(group, ...constraints);
    }
    /** Observable the content of group reference(s)  */
    fromGroupRef(ref) {
        if (isPlatformServer(this.platformId)) {
            return this.zone.runOutsideAngular(() => from(this.getFromRef(ref))).pipe(keepUnstableUntilFirst(this.zone));
        }
        return this.useCache(ref);
    }
    async getValue(idOrQuery, params) {
        // If array is empty
        if (Array.isArray(idOrQuery) && !idOrQuery.length)
            return [];
        // Group query
        const isEmpty = arguments.length === 0;
        const isGroupQuery = arguments.length === 1 && Array.isArray(idOrQuery) && !isIdList(idOrQuery);
        // Collection Query
        const ref = (isEmpty || isGroupQuery)
            ? this.getGroupRef(...arguments)
            : this.getRef(...arguments);
        if (!ref)
            return;
        return this.getFromRef(ref);
    }
    async reload(idOrQuery, params) {
        const isEmpty = arguments.length === 0;
        const isGroupQuery = arguments.length === 1 && Array.isArray(idOrQuery) && !isIdList(idOrQuery);
        const ref = (isEmpty || isGroupQuery)
            ? this.getGroupRef(...arguments)
            : this.getRef(...arguments);
        if (!ref)
            return;
        if (this.memorize) {
            Array.isArray(ref)
                ? ref.forEach(r => this.clearCache(r))
                : this.clearCache(ref);
        }
        return this.load(...arguments);
    }
    load() {
        return firstValueFrom(this.valueChanges(...arguments));
    }
    valueChanges(idOrQuery, params) {
        // If array is empty
        if (Array.isArray(idOrQuery) && !idOrQuery.length)
            return of([]);
        // Check if group query
        const isEmpty = arguments.length === 0;
        const isGroupQuery = arguments.length === 1 && Array.isArray(idOrQuery) && !isIdList(idOrQuery);
        // Group or Collection Query
        const ref = (isEmpty || isGroupQuery)
            ? this.getGroupRef(...arguments)
            : this.getRef(...arguments);
        if (!ref)
            return of(undefined);
        return this.fromRef(ref);
    }
}

/**
 * Generated bundle index. Do not edit.
 */

export { FIRESTORE, FireCollection, FireDocument, FireSubCollection, FirestoreService, fromRef, getDocPath, stringifyFilter, stringifyOrderBy, stringifyQuery, toDate };
//# sourceMappingURL=ngfire-firestore.mjs.map
