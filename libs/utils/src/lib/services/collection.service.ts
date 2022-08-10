import { 
  Firestore,
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  WriteBatch,
  writeBatch,
  Transaction,
  runTransaction,
  FieldValue,
  serverTimestamp,
  doc,
  collection,
  collectionGroup,
  query,
  getDoc,
  getDocs,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { collection as collectionSnapshots, doc as docSnapshots } from 'rxfire/firestore'
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

////////////
// TYEPES //
////////////
export type {
  Firestore,
  DocumentReference,
  WriteBatch,
  Transaction,
  Timestamp,
  FieldValue
} from 'firebase/firestore'
export type AtomicWrite = WriteBatch | Transaction;
export type Params = Record<string, string>;
export interface WriteOptions {
  params?: Params;
  write?: AtomicWrite;
  ctx?: any;
}

export type UpdateCallback<E> = (entity: Readonly<E>, tx?: Transaction) => Partial<E> | Promise<Partial<E>>;
export type ArrayOutput<I, O> = I extends (infer A)[] ? O[] : O;
export type GetRefs<I> =
  I extends (infer A)[] ? DocumentReference[]
  : I extends string ? DocumentReference
  : CollectionReference;

/////////////
// HELPERS //
/////////////

/** Get the params from a path */
export function getPathParams(path: string) {
  return path.split('/')
    .filter(segment => segment.charAt(0) === ':')
    .map(segment => segment.substr(1));
}

/** Return the full path of the doc */
export function getDocPath(path: string, id: string) {
  // If path is smaller than id, id is the full path from ref
  return (path.split('/').length < id.split('/').length)
    ? id
    : `${path}/${id}`;
}

/**
 * Transform a path based on the params
 * @param path The path with params starting with "/:"
 * @param params A map of id params
 * @example pathWithParams('movies/:movieId/stakeholder/:shId', { movieId, shId })
 */
export function pathWithParams(path: string, params: Params): string {
  return path.split('/').map(segment => {
    if (segment.charAt(0) === ':') {
      const key = segment.substr(1);
      return params[key] || segment;
    } else {
      return segment;
    }
  }).join('/');
}

export function assertPath(path: string) {
  for (const segment of path.split('/')) {
    if (segment.charAt(0) === ':') {
      const key = segment.substr(1);
      throw new Error(`Required parameter ${key} from ${path} has not been provided`);
    }
  }
}

/** check is an Atomic write is a transaction */
export function isTransaction(write?: AtomicWrite): write is Transaction {
  return (typeof write === 'object') && ('get' in write);
}

function isNotUndefined<D>(doc: D | undefined): doc is D {
  return doc !== undefined;
}
function isNotNull<D>(doc: D | null): doc is D {
  return doc !== null;
}
function isQueryConstraint(object: QueryConstraint | unknown): object is QueryConstraint {
  return !!(object as QueryConstraint).type;
}
function isQueryConstraintArray(array: Array<QueryConstraint | unknown>): array is QueryConstraint[] {
  return !!array.length && isQueryConstraint(array[0])
}




/////////////
// SERVICE //
/////////////


export abstract class FireCollection<E extends DocumentData> {
  // private memoPath: Record<string, Observable<E | undefined>> = {};
  // private memoQuery: Map<Query, Observable<DocumentReference<E>[]>> = new Map();
  protected readonly abstract path: string;
  protected idKey = 'id';
  protected memorize = false;

  protected onCreate?(entity: E, options: WriteOptions): any;
  protected onUpdate?(entity: Partial<E>, options: WriteOptions): any;
  protected onDelete?(id: string, options: WriteOptions): any;

  constructor(protected db: Firestore) {}

  get timestamp(): FieldValue {
    return serverTimestamp();
  }

  typedDocument<T>(firestore: Firestore, path: string): DocumentReference<T> {
    return doc(firestore, path) as DocumentReference<T>
  }
  typedCollection<T>(firestore: Firestore, path: string): CollectionReference<T> {
    return collection(firestore, path) as CollectionReference<T>
  }
  typedCollectionGroup<T>(firestore: Firestore, path: string): Query<T> {
    return collectionGroup(firestore, path) as Query<T>
  }
  createId() {
    return doc(collection(this.db, 'creatingId')).id;
  }

  // private fromMemo(key: string | Query<any>, cb: () => Observable<any>): Observable<any> {
  //   if (!this.memorize) return cb();
  //   if (typeof key === 'string') {
  //     if (!this.memoPath[key]) {
  //       this.memoPath[key] = cb().pipe(shareWithDelay());
  //     }
  //     return this.memoPath[key];
  //   }
  //   for (const query of this.memoQuery.keys()) {
  //     if (typeof query !== 'string' && query.isEqual(key)) {
  //       return this.memoQuery.get(query)!;
  //     }
  //   }
  //   this.memoQuery.set(key, cb().pipe(shareWithDelay()));
  //   return this.memoQuery.get(key)!;
  // }

  /** Generate a path for the document or collection based on params */
  protected getPath(params?: Params) {
    return params
      ? pathWithParams(this.path, params)
      : this.path;
  }
  
  /** Function triggered when adding/updating data to firestore */
  protected toFirestore(entity: Partial<E>): any {
    return entity;
  }

  /** Function triggered when getting data from firestore */
  protected fromFirestore(snapshot: DocumentSnapshot<E> | QueryDocumentSnapshot<E>): E | undefined {
    return snapshot.exists()
      ? { ...snapshot.data() as any, [this.idKey]: snapshot.id }
      : undefined;
  }


  batch() {
    return writeBatch(this.db);
  }


  /** The Angular Fire collection */
  getCollection(params?: Params): CollectionReference<E> | Query<E>
  getCollection(queryConstraints?: QueryConstraint[]): CollectionReference<E> | Query<E>
  getCollection(paramsOrQueryContraints?: Params | QueryConstraint[], queryConstraints?: QueryConstraint[]): CollectionReference<E> | Query<E> {
    if (!paramsOrQueryContraints) {
      return this.typedCollection<E>(this.db, this.path);
    } else if (!Array.isArray(paramsOrQueryContraints)) {
      // Params
      const constraints = queryConstraints ? queryConstraints : [];
      const path = this.getPath(paramsOrQueryContraints);
      assertPath(path);
      return query(this.typedCollection<E>(this.db, path), ...constraints);
    } else {
      const constraints = queryConstraints ? queryConstraints : [];
      return query(this.typedCollection<E>(this.db, this.path), ...constraints);
    }
  }

  /** The angular fire collection group (based on the last collectionId in the path) */
  getCollectionGroup<E>(queryConstraints: QueryConstraint[] = []): Query<E> {
    const collectionId = this.path.split('/').pop();
    if (!collectionId) throw new Error(`collection id is missing in path: ${this.path}`)
    return query(this.typedCollectionGroup<E>(this.db, collectionId), ...queryConstraints);
  }


  ///////////////
  // SNAPSHOTS //
  ///////////////

  /** Return the reference of the document(s) or collection */
  public getRef(params?: Params): CollectionReference;
  public getRef(ids?: string[], params?: Params): DocumentReference[];
  public getRef(id?: string, params?: Params): DocumentReference;
  public getRef(
    idOrParams?: string | string[] | Params,
    params: Params = {}
  ): GetRefs<typeof idOrParams> {
    const path = this.getPath(params);
    // If path targets a collection ( odd number of segments after the split )
    if (typeof idOrParams === 'string') {
      return doc(this.db, getDocPath(path, idOrParams));
    }
    if (Array.isArray(idOrParams)) {
      return idOrParams.map(id => doc(this.db, getDocPath(path, id)));
    } else if (typeof idOrParams === 'object') {
      const subpath = this.getPath(idOrParams);
      assertPath(subpath);
      return collection(this.db, subpath);
    } else {
      assertPath(path);
      return collection(this.db, path);
    }
  }


  /** Return the current value of the path from Firestore */
  public async getValue(params?: Params): Promise<E[]>;
  public async getValue(ids?: string[], params?: Params): Promise<E[]>;
  // eslint-disable-next-line: unified-signatures
  public async getValue(queryConstraints?: QueryConstraint[], params?: Params): Promise<E[]>;
  public async getValue(id: string, params?: Params): Promise<E | undefined>;
  public async getValue(
    idOrQuery?: string | string[] | QueryConstraint[] | Params,
    params: Params = {}
  ): Promise<E | E[] | undefined> {
    if (typeof idOrQuery === 'object' && !Array.isArray(idOrQuery)) {
      params = idOrQuery;
    }
    const path = this.getPath(params);
    // If path targets a collection ( odd number of segments after the split )
    if (typeof idOrQuery === 'string') {
      const snapshot = await getDoc(this.typedDocument<E>(this.db, getDocPath(path, idOrQuery)));
      return this.fromFirestore(snapshot);
    }
    let docs: QueryDocumentSnapshot<E>[] | DocumentSnapshot<E> [];
    if (Array.isArray(idOrQuery)) {
      if (isQueryConstraintArray(idOrQuery)) {
        assertPath(path);
        const snaphot = await getDocs(query(this.typedCollection<E>(this.db, path), ...idOrQuery));
        docs = snaphot.docs;
      } else {
        const promises = idOrQuery.map(id => getDoc(this.typedDocument<E>(this.db, getDocPath(path, id))));
        docs = await Promise.all(promises);
      }
    } else if (typeof idOrQuery === 'object') {
      const subpath = this.getPath(idOrQuery);
      assertPath(subpath);
      const snapshot = await getDocs(this.typedCollection<E>(this.db, subpath));
      docs = snapshot.docs;
    } else {
      assertPath(path);
      const snapshot = await getDocs(collection(this.db, path));
      docs = snapshot.docs as QueryDocumentSnapshot<E>[];
    }
    return docs
      .map(doc => this.fromFirestore(doc))
      .filter(isNotUndefined);
  }


  /** Listen to the change of values of the path from Firestore */
  public valueChanges(params?: Params): Observable<E[]>;
  public valueChanges(ids?: string[], params?: Params): Observable<E[]>;
  // eslint-disable-next-line: unified-signatures
  public valueChanges(query?: QueryConstraint[], params?: Params): Observable<E[]>;
  public valueChanges(id?: string | null, params?: Params): Observable<E | undefined>;
  public valueChanges(
    idOrQuery?: string | string[] | QueryConstraint[] | Params | null,
    params: Params = {}
  ): Observable<E | E[] | undefined> {
    if (idOrQuery === null) {
      return of(undefined);
    }
    if (typeof idOrQuery === 'object' && !Array.isArray(idOrQuery)) {
      params = idOrQuery;
    }
    const path = this.getPath(params);
    // If one ID
    if (typeof idOrQuery === 'string') {
      // if (this.memorize) {
      //   return this.fromMemo(path, idOrQuery);
      // }
      return docSnapshots(this.typedDocument<E>(this.db, getDocPath(path, idOrQuery))).pipe(
        map(data => this.fromFirestore(data))
      )
    }

    let actions$: Observable<QueryDocumentSnapshot<E>[]>;

    if (Array.isArray(idOrQuery)) {
      if (isQueryConstraintArray(idOrQuery)) {
        assertPath(path);
        actions$ = collectionSnapshots(query(this.typedCollection<E>(this.db, path), ...idOrQuery))
      } else {
        // If list of IDs
        if (!idOrQuery.length) return of([]);
        // if (this.memorize) {
        //   return combineLatest(idOrQuery.map(id => this.fromMemo(path, id))).pipe(
        //     map(docs => docs.filter(isNotUndefined))
        //   );
        // }
        const changes = idOrQuery.map(id => docSnapshots(this.typedDocument<E>(this.db, getDocPath(path, id))));
        return combineLatest(changes).pipe(
          map(snapshots => snapshots.map(snapshot => this.fromFirestore(snapshot))),
          map(docs => docs.filter(isNotUndefined))
        );
      }
    } else if (typeof idOrQuery === 'object' && !Array.isArray(idOrQuery)) {
      const subpath = this.getPath(idOrQuery);
      assertPath(subpath);
      actions$ = collectionSnapshots(this.typedCollection<E>(this.db, subpath));
    } else {
      assertPath(path);
      actions$ = collectionSnapshots(this.typedCollection<E>(this.db, path));
    }
    return actions$.pipe(
      map(snapshots => snapshots.map(snapshot => this.fromFirestore(snapshot))),
      map(docs => docs.filter(isNotUndefined))
    );
  }


  ///////////
  // GROUP //
  ///////////
  public async getGroup(queryConstraints: QueryConstraint[] = []) {
    const collection = await getDocs(this.getCollectionGroup<E>(queryConstraints));
    const docs = collection.docs;
    return docs
      .map(doc => this.fromFirestore(doc))
      .filter(isNotUndefined);
  }

  public groupChanges(queryConstraints: QueryConstraint[] = []) {
    const collectionGroupQuery = this.getCollectionGroup<E>(queryConstraints);
    return collectionSnapshots(collectionGroupQuery).pipe(
      map(snapshots => snapshots.map(snapshot => this.fromFirestore(snapshot))),
      map(docs => docs.filter(isNotUndefined)),
    );
  }

  ///////////
  // WRITE //
  ///////////
  /**
   * Create or update documents
   * @param documents One or many documents
   * @param options options to write the document on firestore
   */
  upsert(documents: Partial<E>, options?: WriteOptions): Promise<string>
  upsert(documents: Partial<E>[], options?: WriteOptions): Promise<string[]>
  async upsert(
    documents: Partial<E> | Partial<E>[],
    options: WriteOptions = {}
  ): Promise<string | string[]> {
    const doesExist = async (doc: Partial<E>) => {
      const id: string | undefined = doc[this.idKey];
      if (!id) return false;
      const ref = this.getRef(id, options.params);
      const exists = await (isTransaction(options?.write) ? options?.write.get(ref) : getDoc(ref)).then((snap => snap.exists()));
      return exists;
    };
    if (!Array.isArray(documents)) {
      const exists = await doesExist(documents)
      return (await doesExist(documents))
        ? this.update(documents, options).then(_ => documents[this.idKey] as string)
        : this.add(documents, options);
    }

    const toAdd: Partial<E>[] = [];
    const toUpdate: Partial<E>[] = [];
    for (const doc of documents) {
      (await doesExist(doc))
        ? toUpdate.push(doc)
        : toAdd.push(doc);
    }
    return Promise.all([
      this.add(toAdd, options),
      this.update(toUpdate, options).then(_ => toUpdate.map(doc => doc[this.idKey] as string))
    ]).then(([added, updated]) => added.concat(updated) as any);
  }

  /**
   * Add a document or a list of document to Firestore
   * @param docs A document or a list of document
   * @param options options to write the document on firestore
   */
  add(documents: Partial<E>, options?: WriteOptions): Promise<string>
  add(documents: Partial<E>[], options?: WriteOptions): Promise<string[]>
  async add(
    documents: Partial<E> | Partial<E>[],
    options: WriteOptions = {}
  ): Promise<string | string[]> {
    const docs = Array.isArray(documents) ? documents : [documents];
    const { write = this.batch(), ctx, params } = options;
    const path = this.getPath(options.params);
    const operations = docs.map(async docData => {
      const id = docData[this.idKey] || this.createId();
      const data = await this.toFirestore({ ...docData, [this.idKey]: id, createdAt: this.timestamp, updatedAt: this.timestamp });
      const ref = doc(this.db, getDocPath(path, id));
      
      (write as WriteBatch).set(ref, (data));
      if (this.onCreate) {
        await this.onCreate(data, { write, ctx, params });
      }
      return id;
    });
    const ids: string[] = await Promise.all(operations);
    // If there is no atomic write provided
    if (!options.write) {
      await (write as WriteBatch).commit();
    }
    return Array.isArray(documents) ? ids : ids[0];
  }

  /**
   * Remove one or several document from Firestore
   * @param id A unique or list of id representing the document
   * @param options options to write the document on firestore
   */
  async remove(id: string | string[], options: WriteOptions = {}) {
    const { write = this.batch(), ctx } = options;
    const path = this.getPath(options.params);
    const ids: string[] = Array.isArray(id) ? id : [id];

    const operations = ids.map(async docId => {
      const ref = doc(this.db, getDocPath(path, docId));
      write.delete(ref);
      if (this.onDelete) {
        await this.onDelete(docId, { write, ctx });
      }
    });
    await Promise.all(operations);
    // If there is no atomic write provided
    if (!options.write) {
      return (write as WriteBatch).commit();
    }
  }

  /** Remove all document of the collection */
  async removeAll(options: WriteOptions = {}) {
    const path = this.getPath(options.params);
    assertPath(path);
    const snapshot = await getDocs(collection(this.db, path));
    const ids = snapshot.docs.map(doc => doc.id);
    return this.remove(ids, options);
  }

  /**
   * Update one or several document in Firestore
   */
  update(entity: Partial<E> | Partial<E>[], options?: WriteOptions): Promise<void>;
  update(id: string | string[], entityChanges: Partial<E>, options?: WriteOptions): Promise<void>;
  update(ids: string | string[], stateFunction: UpdateCallback<E>, options?: WriteOptions): Promise<Transaction[]>;
  async update(
    idsOrEntity: Partial<E> | Partial<E>[] | string | string[],
    stateFnOrWrite?: UpdateCallback<E> | Partial<E> | WriteOptions,
    options: WriteOptions = {}
  ): Promise<void | Transaction[]> {

    let ids: string[] = [];
    let stateFunction: UpdateCallback<E> | undefined;
    let getData: (docId: string) => Partial<E> | undefined;

    const isEntity = (value: DocumentData | string): value is Partial<E> => {
      return typeof value === 'object' && value[this.idKey];
    };
    const isEntityArray = (values: DocumentData | string[] | string): values is Partial<E>[] => {
      return Array.isArray(values) && values.every(value => isEntity(value));
    };

    if (isEntity(idsOrEntity)) {
      ids = [idsOrEntity[this.idKey] as string];
      getData = () => idsOrEntity;
      options = stateFnOrWrite as WriteOptions || {};
    } else if (isEntityArray(idsOrEntity)) {
      const entityMap = new Map(idsOrEntity.map(entity => [entity[this.idKey] as string, entity]));
      ids = Array.from(entityMap.keys());
      getData = docId => entityMap.get(docId);
      options = stateFnOrWrite as WriteOptions || {};
    } else if (typeof stateFnOrWrite === 'function') {
      ids = Array.isArray(idsOrEntity) ? idsOrEntity : [idsOrEntity];
      stateFunction = stateFnOrWrite as UpdateCallback<E>;
    } else if (typeof stateFnOrWrite === 'object') {
      ids = Array.isArray(idsOrEntity) ? idsOrEntity : [idsOrEntity];
      getData = () => stateFnOrWrite as Partial<E>;
    } else {
      throw new Error('Passed parameters match none of the function signatures.');
    }

    const { ctx } = options;
    const path = this.getPath(options.params);

    if (!Array.isArray(ids) || !ids.length) {
      return;
    }

    // If update depends on the entity, use transaction
    if (stateFunction) {
      return runTransaction(this.db, async tx => {
        const operations = ids.map(async id => {
          const ref = doc(this.db, getDocPath(path, id));
          const snapshot = (await tx.get(ref)) as QueryDocumentSnapshot<E>;
          const docData = this.fromFirestore(snapshot);
          if (docData && stateFunction) {
            const data = await stateFunction(Object.freeze(docData), tx);
            tx.update(ref, await this.toFirestore({ ...data, updatedAt: this.timestamp }));
            if (this.onUpdate) {
              await this.onUpdate(data, { write: tx, ctx });
            }
          }
          return tx;
        });
        return Promise.all(operations);
      });
    } else {
      const { write = this.batch() } = options;
      const operations = ids.map(async docId => {
        const docData = Object.freeze(getData(docId));
        if (!docId) {
          throw new Error(`Document should have an unique id to be updated, but none was found in ${docData}`);
        }
        if (!docData) {
          throw new Error(`No data was provided to update the document`)
        }
        const ref = this.typedDocument<E>(this.db, getDocPath(path, docId));
        (write as WriteBatch).update(ref, await this.toFirestore({ ...docData, updatedAt: this.timestamp }))
        if (this.onUpdate) {
          await this.onUpdate(docData, { write, ctx });
        }
      });
      await Promise.all(operations);
      // If there is no atomic write provided
      if (!options.write) {
        return (write as WriteBatch).commit();
      }
      return;
    }
  }

}
