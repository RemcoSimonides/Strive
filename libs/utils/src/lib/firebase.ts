import { docData as rxDocData, collectionData as rxCollectionData } from 'rxfire/firestore'
import { DocumentData, DocumentReference, FirestoreDataConverter, Query, QueryDocumentSnapshot, serverTimestamp, SnapshotOptions, Timestamp } from 'firebase/firestore'
import { Observable, OperatorFunction, from, of, tap, startWith, combineLatest, map, switchMap, debounceTime } from 'rxjs'

/**
 * Subscribe outside Angular's zone so Firebase's internal async operations
 * (gRPC connections, timers) don't block SSR stability checks.
 */
declare const Zone: { root: { run: <T>(fn: () => T) => T } } | undefined
function outsideZone<T>(source: Observable<T>): Observable<T> {
  const rootZone = typeof Zone !== 'undefined' ? Zone : undefined
  return new Observable<T>(subscriber => {
    const subscribe = () => source.subscribe(subscriber)
    return rootZone ? rootZone.root.run(subscribe) : subscribe()
  })
}

export function docData<T>(ref: DocumentReference<T>): Observable<T | undefined> {
  return outsideZone(rxDocData(ref) as Observable<T | undefined>)
}

export function collectionData<T>(ref: Query<T>, options?: { idField?: string }): Observable<NonNullable<T>[]> {
  return outsideZone(rxCollectionData(ref, options as any) as Observable<NonNullable<T>[]>)
}

export const createConverter = <T extends Record<string, any>>(
  factory: (data: DocumentData) => T,
  idField: keyof T = 'id'
): FirestoreDataConverter<T | undefined> => {
  return {
    toFirestore: (payload: T): DocumentData => {
      const isUpdate = !!payload[idField];
      const timestamp = serverTimestamp();
      const data = { ...payload } as DocumentData;

      if (!isUpdate) {
        data['createdAt'] = timestamp;
      }
      data['updatedAt'] = timestamp;

      delete data[idField as string];
      return data;
    },

    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): T | undefined => {
      if (snapshot.exists()) {
        const data = snapshot.data(options);

        const dataWithId = {
          ...data,
          [idField]: snapshot.id,
        };

        return factory(toDate(dataWithId));
      } else {
        return undefined
      }
    },
  };
}

export function toDate<D>(target: D): D {
  if (typeof target !== 'object') return target;
  for (const key in target) {
    const value = target[key];
    if (!value || typeof value !== 'object') continue;
    if (value instanceof Timestamp) {
      target[key] = value.toDate() as any;
      continue;
    }
    toDate(value)
  }
  return target;
}


type QueryMap<T> = Record<string, (data: Entity<T>) => any>
type Entity<T> = T extends Array<infer I> ? I : T;
type GetSnapshot<F extends (...data: any) => any> =
  F extends (...data: any) => Observable<infer I> ? I
  : F extends (...data: any) => Promise<infer J> ? J
  : ReturnType<F>;
type Join<T, Query extends QueryMap<T>> = T & { [key in keyof Query]?: GetSnapshot<Query[key]> };
type Jointure<T, Query extends QueryMap<any>> = T extends Array<infer I>
  ? Join<I, Query>[]
  : Join<T, Query>;

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
export function joinWith<T, Query extends QueryMap<T>>(queries: Query, options: JoinWithOptions = {}): OperatorFunction<T, Jointure<T, Query>> {
  const shouldAwait = options.shouldAwait ?? true;
  const debounce = options.debounceTime ?? 100;
  const runQuery = (entity: Entity<T>) => {
    const obs = [];
    for (const key in queries) {
      // Transform return value into an observable
      let result: any = queries[key](entity);
      if (!(result instanceof Observable)) {
        if (result instanceof Promise) {
          result = from(result);
        } else {
          result = of(result);
        }
      }
      // Hydrate the entity with the data
      let observe: Observable<any>;
      if (shouldAwait) {
        observe = result.pipe(
          tap(result => (entity as any)[key] = result),
        );
      } else {
        observe = result.pipe(
          startWith(undefined),
          tap(result => (entity as any)[key] = result),
        );
      }
      obs.push(observe);
    }
    if (!obs.length) return of(entity);
    return combineLatest(obs).pipe(
      map(() => {
        if (!entity) return entity;
        return JSON.parse(JSON.stringify(entity), jsonDateReviver) as any;
      }),
    );
  }

  return switchMap((data: T) => {
    if (Array.isArray(data)) {
      if (!data.length) return of([]);
      return combineLatest(data.map(runQuery)).pipe(debounceTime(debounce));
    }
    return runQuery(data as Entity<T>);
  });
}

function jsonDateReviver(_: unknown, value: any) {
  if (!value) return value;

  const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,}|)Z$/;
  if (typeof value === 'string' && dateFormat.test(value)) return new Date(value);
  if (
    typeof value === 'object' &&
    Object.keys(value).length === 2 &&
    ['nanoseconds', 'seconds'].every((k) => k in value)
  )
    return new Date(((value.nanoseconds * 1) ^ -6) + value.seconds * 1000);

  return value;
}