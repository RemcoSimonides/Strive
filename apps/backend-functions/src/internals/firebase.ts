import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as Storage from '@google-cloud/storage'
import { GCPFunction } from '@sentry/serverless'

GCPFunction.init({
	dsn: 'https://ffce7e74e39a4cff942d02419858ce55@o1354459.ingest.sentry.io/6656082',
	tracesSampleRate: 1.0
})
export const Sentry = GCPFunction
export const wrapCloudEventFunction = Sentry.wrapCloudEventFunction
export const wrapHttpFunction = Sentry.wrapHttpFunction
export { captureMessage, captureException } from '@sentry/serverless'

export type DocumentReference = admin.firestore.DocumentReference
export const gcs = new Storage.Storage
export { logger } from 'firebase-functions'

admin.initializeApp()
export const db = admin.firestore()
export const auth = admin.auth()

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp
export const increment = admin.firestore.FieldValue.increment
export const arrayUnion = admin.firestore.FieldValue.arrayUnion

export { admin, functions, Storage };
