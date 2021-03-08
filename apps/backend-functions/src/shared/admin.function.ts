// import * as admin from 'firebase-admin';
// import { QueryFn, Snapshot } from '@model';

// let app: AdminApp;

// export function getApp(): AdminApp {
//   if (!app) {
//     app = new AdminApp();
//   }
//   return app;
// }

// export class AdminApp {
//   private collections: Record<string, Collection<any>> = {};
//   app: admin.app.App;
//   constructor(options?: admin.AppOptions | undefined, name?: string | undefined) {
//     this.app = admin.initializeApp(options, name);
//   }

//   get db() {
//     return this.app.firestore();
//   }

//   get auth() {
//     return this.app.auth();
//   }

//   // FIRESTORE
//   collection<T>(path: string): Collection<T> {
//     if (!this.collections[path]) {
//       this.collections[path] = new Collection(path, this.db);
//     }
//     return this.collections[path];
//   }
// }

// export class Collection<T> {
//   ref = this.db.collection(this.path).withConverter<T>({
//     toFirestore(model: T): T {
//       return model;
//     },
//     fromFirestore(snap: admin.firestore.QueryDocumentSnapshot<T>): T {
//       return { ...snap.data(), id: snap.id }
//     }
//   }) as FirebaseFirestore.CollectionReference<T>;

//   constructor(readonly path: string, private db: admin.firestore.Firestore) { }

//   createId() {
//     return this.ref.doc().id;
//   }

//   get(id: string): Promise<T | undefined>
//   get(ids: string[]): Promise<T[]>
//   get(ids: string | string[]): Promise<T[] | T | undefined> {
//     const get = (id: string) => this.db.doc(`${this.path}/${id}`).get().then(snap => snap.data() as T);
//     return Array.isArray(ids) ? Promise.all(ids.map(get)) : get(ids);
//   }

//   getRef(id: string): FirebaseFirestore.DocumentReference<T> {
//     return this.db.doc(`${this.path}/${id}`) as FirebaseFirestore.DocumentReference<T>;
//   }

//   async query(queryFn: QueryFn<T>) {
//     const snap = await queryFn(this.ref).get();
//     return snap.docs.filter(doc => doc.exists).map(doc => doc.data());
//   }

//   add(data: Omit<T, 'id'>): Promise<FirebaseFirestore.DocumentReference<T>>
//   add(data: Omit<T, 'id'>[]): Promise<FirebaseFirestore.DocumentReference<T>[]>
//   add(data: Omit<T, 'id'> | Omit<T, 'id'>[]) {
//     return Array.isArray(data)
//       ? Promise.all(data.map(d => this.ref.add(d as T)))
//       : this.ref.add(data as T);
//   }

//   set(id: string, data: Omit<T, 'id'>) {
//     return this.ref.doc(id).set(data as T);
//   }

//   upsert(id: string, data: Partial<T>) {
//     return this.ref.doc(id).set(data, { merge: true });
//   }

//   tx(id: string | string[], update: (data: Snapshot<T>, tx: FirebaseFirestore.Transaction) => Promise<Partial<T>> | Partial<T>) {
//     return this.db.runTransaction(async tx => {
//       const ids = Array.isArray(id) ? id : [id];
//       const refs = ids.map(id => this.ref.doc(id));
//       const snaps = await Promise.all(refs.map(ref => tx.get(ref)));
//       const data = await Promise.all(snaps.map(snap => update(snap, tx)));
//       // Works only because promise.all keep order
//       return refs.map((ref, i) => tx.update(ref, data[i]));
//     });
//   }

// }
