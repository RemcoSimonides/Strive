import * as rxjs from 'rxjs';
import { OperatorFunction, Observable, SchedulerLike, SchedulerAction, Subscription } from 'rxjs';
import { Transaction, WriteBatch, FieldValue, CollectionReference, DocumentReference, Query } from 'firebase/firestore';
import { NgZone } from '@angular/core';

declare function shareWithDelay<T>(delay?: number): rxjs.MonoTypeOperatorFunction<T>;
type QueryMap<T> = Record<string, (data: Entity<T>) => any>;
type Entity<T> = T extends Array<infer I> ? I : T;
type GetSnapshot<F extends (...data: any) => any> = F extends (...data: any) => Observable<infer I> ? I : F extends (...data: any) => Promise<infer J> ? J : ReturnType<F>;
type Join$1<T, Query extends QueryMap<T>> = T & {
    [key in keyof Query]?: GetSnapshot<Query[key]>;
};
type Jointure<T, Query extends QueryMap<any>> = T extends Array<infer I> ? Join$1<I, Query>[] : Join$1<T, Query>;
interface JoinWithOptions {
    /** If set to false, the subqueries will be filled with undefined and hydrated as they come through */
    shouldAwait?: boolean;
    /** Used to not trigger change detection too often */
    debounceTime?: number;
}
/**
 * Operator that join the source with sub queries.
 * There are two stategies :
 * 1. `shouldAwait: true`: Await all subqueries to emit once before emitting a next value
 * 2. `shouldAwait: false`: Emit the source and hydrate it with the subqueries along the way
 * @example
 * ```typescript
 * of({ docUrl: '...' }).valueChanges().pipe(
 *   joinWith({
 *     doc: source => fetch(docUrl).then(res => res.json()),
 *   }, { shouldAwait: true })
 * ).subscribe(res => console.log(res.subQuery))
 * ```
 * @param queries A map of subqueries to apply. Each query can return a static value, Promise or Observable
 * @param options Strategy to apply on the joinWith
 */
declare function joinWith<T, Query extends QueryMap<T>>(queries: Query, options?: JoinWithOptions): OperatorFunction<T, Jointure<T, Query>>;

type AtomicWrite = Transaction | WriteBatch;
interface WriteOptions {
    write?: AtomicWrite;
    ctx?: any;
    params?: Params;
}
type UpdateCallback<E> = (entity: Readonly<E>, tx?: Transaction) => Partial<E> | Promise<Partial<E>>;
interface MetaDocument {
    createdAt: Date;
    modifiedAt: Date;
}
type Params = Record<string, string>;
type Join<K extends string, P extends string> = '' extends P ? K : `${K}.${P}`;
type GetKey<T, K extends Extract<keyof T, string>> = T[K] extends Function ? never : K | Join<K, DeepKeys<T[K]>>;
type DeepKeys<T> = T extends Date ? '' : T extends Array<any> ? '' : T extends Record<string, any> ? {
    [K in Extract<keyof T, string>]: GetKey<T, K>;
}[Extract<keyof T, string>] : '';
type ExtractKey<T, V, K extends Extract<keyof T, string>> = T[K] extends Function ? never : T[K] extends (V | undefined) ? K : T[K] extends Date ? never : T[K] extends Array<any> ? never : T[K] extends Record<string, any> ? Join<K, ExtractDeepKeys<T[K], V>> : never;
type ExtractDeepKeys<T, V> = T extends Date ? '' : T extends Array<any> ? '' : T extends Record<string, any> ? {
    [K in Extract<keyof T, string>]: ExtractKey<T, V, K>;
}[Extract<keyof T, string>] : '';
type DeepValue<T, K> = K extends `${infer I}.${infer J}` ? (I extends keyof T ? DeepValue<T[I], J> : never) : K extends keyof T ? T[K] : never;
type DeepEntity<T> = Partial<{
    [key in DeepKeys<T>]: DeepValue<T, key> | FieldValue;
}>;
type FireEntity<T> = DeepEntity<T>;

declare function exist<D>(doc: D | undefined | null): doc is D;
declare function isNotUndefined<D>(doc: D | undefined): doc is D;
declare function isDocPath(path: string): boolean;
declare function isPathRef(path?: any): path is string;
declare function isIdList(idsOrQuery: any[]): idsOrQuery is string[];
/** Get the params from a path */
declare function getPathParams(path: string): string[];
declare function assertPath(path: string): void;
declare function assertCollection(path: string): void;
/**
 * Transform a path based on the params
 * @param path The path with params starting with "/:"
 * @param params A map of id params
 * @example pathWithParams('movies/:movieId/stakeholder/:shId', { movieId, shId })
 */
declare function pathWithParams(path: string, params?: Params): string;
declare function isQuery<E>(ref: CollectionReference<E> | DocumentReference<E> | Query<E>): ref is Query<E>;
declare function isCollectionRef<E>(ref: CollectionReference<E> | DocumentReference<E> | Query<E>): ref is CollectionReference<E>;

declare class ɵZoneScheduler implements SchedulerLike {
    private zone;
    private delegate;
    constructor(zone: any, delegate?: SchedulerLike);
    now(): number;
    schedule(work: (this: SchedulerAction<any>, state?: any) => void, delay?: number, state?: any): Subscription;
}
declare function keepUnstableUntilFirst(ngZone: NgZone): <T>(obs$: Observable<T>) => Observable<T>;

export { assertCollection, assertPath, exist, getPathParams, isCollectionRef, isDocPath, isIdList, isNotUndefined, isPathRef, isQuery, joinWith, keepUnstableUntilFirst, pathWithParams, shareWithDelay, ɵZoneScheduler };
export type { AtomicWrite, DeepEntity, DeepKeys, ExtractDeepKeys, FireEntity, MetaDocument, Params, UpdateCallback, WriteOptions };
