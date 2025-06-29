import * as _firebase_database from '@firebase/database';
import * as i0 from '@angular/core';
import { Injector, InjectionToken } from '@angular/core';
import { QueryConstraint, Query, DataSnapshot, DatabaseReference, Database } from 'firebase/database';
import { Observable } from 'rxjs';
import { Params, ExtractDeepKeys } from 'ngfire/core';

declare function isContraintList(idsOrQuery: any[]): idsOrQuery is QueryConstraint[];
declare class FireDatabase {
    protected injector: Injector;
    protected memory: Map<Query, Observable<DataSnapshot>>;
    get db(): _firebase_database.Database;
    /** Get the reference of the document, collection or query */
    getRef(path: string, params?: Params): DatabaseReference;
    getRef(paths: string[], params?: Params): DatabaseReference[];
    getRef(path: string, constraints: QueryConstraint[], params?: Params): Query;
    getRef(paths: string[], constraints: QueryConstraint[], params?: Params): Query;
    getRef(paths: string, constraints?: Params | QueryConstraint[], params?: Params): Query | DatabaseReference;
    fromQuery(query: Query): Observable<DataSnapshot>;
    create<T>(path: string, content: T): Promise<void>;
    update<T>(path: string, value: Partial<T>): Promise<void>;
    remove(path: string): Promise<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<FireDatabase, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FireDatabase>;
}

declare function addMeta(doc: DocumentMeta, actionType: 'add' | 'update'): void;
interface DocumentMeta {
    _meta: {
        createdAt?: Date;
        modifiedAt?: Date;
    };
}
declare abstract class FireList<E> {
    protected fireDB: FireDatabase;
    protected abstract readonly path: string;
    protected abstract dateKeys: ExtractDeepKeys<E, Date>[];
    protected idKey?: keyof E;
    protected pathKey?: keyof E;
    protected fromDatabase(snap: DataSnapshot): E | null;
    protected toDatabase(doc: Partial<E>, actionType: 'add' | 'update'): Partial<E>;
    private toData;
    getPath(key?: string | Params, params?: Params): string;
    getRef(): DatabaseReference;
    getRef(params: Params): DatabaseReference;
    getRef(key: string, params?: Params): DatabaseReference;
    getRef(keys: string[], params?: Params): DatabaseReference[];
    getRef(constraints: QueryConstraint[], params?: Params): Query;
    getRef(query?: string | string[] | QueryConstraint[] | Params, params?: Params): DatabaseReference | DatabaseReference[] | Query;
    private fromQuery;
    private getQuery;
    valueChanges<T extends E = E>(): Observable<T[]>;
    valueChanges<T extends E = E>(params: Params): Observable<T[]>;
    valueChanges<T extends E = E>(key: string, params?: Params): Observable<T | null>;
    valueChanges<T extends E = E>(keys: string[], params?: Params): Observable<T[]>;
    valueChanges<T extends E = E>(constraints: QueryConstraint[], params?: Params): Observable<T[]>;
    getValue<T extends E = E>(): Promise<T[]>;
    getValue<T extends E = E>(params: Params): Promise<T[]>;
    getValue<T extends E = E>(key: string, params?: Params): Promise<T | null>;
    getValue<T extends E = E>(keys: string[], params?: Params): Promise<T[]>;
    getValue<T extends E = E>(constraints: QueryConstraint[], params?: Params): Promise<T[]>;
    add<T extends E>(value: Partial<T>, params?: Params): Promise<void> | _firebase_database.ThenableReference;
    update<T extends E>(key: string, value: Partial<T>, params?: Params): Promise<void>;
    remove(key: string, params?: Params): Promise<void>;
    /** We use a separated method to avoid mistakes */
    removeAll(params?: Params): Promise<void>;
}

declare const DATABASE: InjectionToken<Database>;

export { DATABASE, FireDatabase, FireList, addMeta, isContraintList };
export type { DocumentMeta };
