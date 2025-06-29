import * as i0 from '@angular/core';
import { InjectionToken, inject, Injector, Injectable } from '@angular/core';
import { onValue, getDatabase, QueryConstraint, ref, query, set, update, remove, serverTimestamp, get, push } from 'firebase/database';
import { pathWithParams, assertPath, isIdList, exist } from 'ngfire/core';
import { Observable, combineLatest, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { FIREBASE_APP } from 'ngfire/app';
import { getConfig, DB_URL } from 'ngfire/tokens';

/**
 * Create an observable from a Database Reference or Database Query.
 * @param query Database Reference
 */
function fromQuery(query) {
    return new Observable((subscriber) => {
        const unsubscribe = onValue(query, (snapshot) => subscriber.next(snapshot), subscriber.error.bind(subscriber));
        return { unsubscribe };
    }).pipe(
    // Ensures subscribe on observable is async. This handles
    // a quirk in the SDK where on/once callbacks can happen
    // synchronously.
    delay(0));
}

const DATABASE = new InjectionToken('Database instance', {
    providedIn: 'root',
    factory: () => {
        const config = getConfig();
        const app = inject(FIREBASE_APP);
        const url = inject(DB_URL, { optional: true });
        if (config.database) {
            return config.database(app, url ?? undefined);
        }
        else {
            return getDatabase(app, url ?? undefined);
        }
    },
});

function isContraintList(idsOrQuery) {
    return idsOrQuery.every(query => query instanceof QueryConstraint);
}
class FireDatabase {
    injector = inject(Injector);
    memory = new Map();
    get db() {
        return this.injector.get(DATABASE);
    }
    getRef(paths, paramsOrConstraints, params) {
        if (!arguments.length || !paths)
            return undefined;
        const hasContraints = Array.isArray(paramsOrConstraints);
        if (Array.isArray(paths)) {
            return paths.map((path) => this.getRef(path, paramsOrConstraints, params));
        }
        if (hasContraints) {
            const path = pathWithParams(paths, params);
            assertPath(path);
            const ref$1 = ref(this.db, path);
            return query(ref$1, ...paramsOrConstraints);
        }
        else {
            const path = pathWithParams(paths, paramsOrConstraints);
            assertPath(path);
            return ref(this.db, path);
        }
    }
    fromQuery(query) {
        let existing = null;
        for (const [key, value] of this.memory.entries()) {
            if (query.isEqual(key)) {
                existing = value;
                break;
            }
        }
        if (existing)
            return existing;
        this.memory.set(query, fromQuery(query));
        return this.memory.get(query);
    }
    create(path, content) {
        return set(this.getRef(path), content);
    }
    update(path, value) {
        const ref = this.getRef(path);
        return update(ref, value);
    }
    remove(path) {
        const ref = this.getRef(path);
        return remove(ref);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireDatabase, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireDatabase, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.0.5", ngImport: i0, type: FireDatabase, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });

/** Recursively all Date into Timestamp */
function fromDate(target) {
    if (typeof target !== 'object')
        return target;
    for (const key in target) {
        const value = target[key];
        if (!value || typeof value !== 'object')
            continue;
        if (value instanceof Date) {
            target[key] = value.getTime();
            continue;
        }
        fromDate(value);
    }
    return target;
}
/** Recursively all Date into Timestamp */
function toDate(target, dateKeys, path = '') {
    if (typeof target !== 'object')
        return target;
    for (const key in target) {
        const value = target[key];
        const deepKey = `${path}.${key}`;
        if (dateKeys.includes(deepKey)) {
            if (typeof value !== 'number')
                throw new Error(`Date key "${deepKey}" is not a number. Got ${value}`);
            target[key] = new Date(value);
            continue;
        }
        if (!value || typeof value !== 'object')
            continue;
        toDate(value, dateKeys, deepKey);
    }
    return target;
}

function isListQuery(query) {
    if (typeof query === 'string')
        return false;
    if (Array.isArray(query) && isIdList(query))
        return false;
    return true;
}
function toKey(value) {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number')
        return value.toString();
    throw new Error('Key of list should either be a string or a number');
}
function addMeta(doc, actionType) {
    const _meta = doc['_meta'] ?? {};
    if (actionType === 'add')
        _meta.createdAt = serverTimestamp();
    if (actionType === 'update')
        _meta.modifiedAt = serverTimestamp();
    doc._meta = _meta;
}
class FireList {
    fireDB = inject(FireDatabase);
    idKey;
    pathKey;
    fromDatabase(snap) {
        if (!snap.exists())
            return null;
        const value = snap.val();
        const dateKeys = [...this.dateKeys, '_meta.createdAt', '_meta.modifiedAt'];
        if (!value || typeof value !== 'object')
            return toDate(value, dateKeys);
        if (this.idKey)
            value[this.idKey] = snap.key;
        if (this.pathKey)
            value[this.pathKey] = snap.ref.toString();
        return toDate(value, dateKeys);
    }
    toDatabase(doc, actionType) {
        return fromDate(doc);
    }
    toData(snaps, options) {
        if (!snaps)
            return null;
        if (Array.isArray(snaps))
            return snaps.map(snap => this.toData(snap, { isList: false })).filter(exist);
        if (!options.isList)
            return this.fromDatabase(snaps);
        const docs = [];
        // forEach cancels when return value is "true". So I return "false"
        snaps.forEach(snap => !docs.push(this.fromDatabase(snap)));
        return docs.filter(exist);
    }
    getPath(key, params) {
        if (typeof key === 'string')
            return pathWithParams(`${this.path}/${key}`, params);
        return pathWithParams(this.path, key);
    }
    getRef(query, params) {
        // String or Params (getPath return base path is query is Params)
        if (!Array.isArray(query))
            return this.fireDB.getRef(this.getPath(query), params);
        return isIdList(query)
            // key list
            ? this.fireDB.getRef(query.map(key => this.getPath(key)), params)
            // query constraints
            : this.fireDB.getRef(this.getPath(), query, params);
    }
    fromQuery(query, params) {
        const refs = this.getRef(query, params);
        if (!Array.isArray(refs))
            return this.fireDB.fromQuery(refs);
        const obs = refs.map(ref => this.fireDB.fromQuery(ref));
        return combineLatest(obs);
    }
    getQuery(query, params) {
        const refs = this.getRef(query, params);
        if (!Array.isArray(refs))
            return get(refs);
        const promises = refs.map(ref => get(ref));
        return Promise.all(promises);
    }
    valueChanges(query, params) {
        if (arguments.length && !query)
            return of(null);
        return this.fromQuery(query, params).pipe(map(snap => this.toData(snap, { isList: isListQuery(query) })));
    }
    async getValue(query, params) {
        if (arguments.length && !query)
            return Promise.resolve(null);
        const snap = await this.getQuery(query, params);
        return this.toData(snap, { isList: isListQuery(query) });
    }
    add(value, params) {
        const doc = this.toDatabase(value, 'add');
        if (this.idKey && doc[this.idKey]) {
            const key = toKey(doc[this.idKey]);
            const ref = this.getRef(key, params);
            return set(ref, doc);
        }
        const listRef = params ? this.getRef(params) : this.getRef();
        return push(listRef, doc);
    }
    update(key, value, params) {
        const doc = this.toDatabase(value, 'update');
        const path = this.getRef(key, params);
        return update(path, doc);
    }
    remove(key, params) {
        const ref = this.getRef(key, params);
        return remove(ref);
    }
    /** We use a separated method to avoid mistakes */
    removeAll(params) {
        const ref = params ? this.getRef(params) : this.getRef();
        return remove(ref);
    }
}

/**
 * Generated bundle index. Do not edit.
 */

export { DATABASE, FireDatabase, FireList, addMeta, isContraintList };
//# sourceMappingURL=ngfire-database.mjs.map
