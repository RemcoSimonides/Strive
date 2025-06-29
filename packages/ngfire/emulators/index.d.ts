import * as _firebase_auth from '@firebase/auth';
import { FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, Dependencies } from 'firebase/auth';
import * as _firebase_database from '@firebase/database';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import * as _firebase_firestore from '@firebase/firestore';
import { connectFirestoreEmulator, initializeFirestore } from 'firebase/firestore';
import * as _firebase_functions from '@firebase/functions';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import * as _firebase_storage from '@firebase/storage';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

/** Used to get all the arguments of the initilizers except first one */
type FirebaseParams<T extends (...args: any) => any> = T extends (arg0: any, ...args: infer P) => any ? P : never;

declare const authEmulator: (...emulatorParams: FirebaseParams<typeof connectAuthEmulator>) => (app: FirebaseApp, deps?: Dependencies) => _firebase_auth.Auth;

declare const databaseEmulator: (...emulatorParams: FirebaseParams<typeof connectDatabaseEmulator>) => (...params: Parameters<typeof getDatabase>) => _firebase_database.Database;

declare const firestoreEmulator: (...emulatorParams: FirebaseParams<typeof connectFirestoreEmulator>) => (...params: Parameters<typeof initializeFirestore>) => _firebase_firestore.Firestore;

declare const functionsEmulator: (...emulatorParams: FirebaseParams<typeof connectFunctionsEmulator>) => (...params: Parameters<typeof getFunctions>) => _firebase_functions.Functions;

declare const storageEmulator: (...emulatorParams: FirebaseParams<typeof connectStorageEmulator>) => (...params: Parameters<typeof getStorage>) => _firebase_storage.FirebaseStorage;

export { authEmulator, databaseEmulator, firestoreEmulator, functionsEmulator, storageEmulator };
export type { FirebaseParams };
