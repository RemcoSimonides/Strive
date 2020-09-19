import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Storage from '@google-cloud/storage'

export type DocumentReference = admin.firestore.DocumentReference;
export const gcs = new Storage.Storage;

admin.initializeApp();
export const db = admin.firestore();
export const auth = admin.auth();

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
export const increment = admin.firestore.FieldValue.increment

export { admin, functions, Storage };
