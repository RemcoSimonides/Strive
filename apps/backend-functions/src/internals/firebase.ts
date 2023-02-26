import { RuntimeOptions, runWith } from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as Storage from '@google-cloud/storage'
import { GCPFunction } from '@sentry/serverless'
import { environment } from '@env'
import { wrapFirestoreOnCreateHandler, wrapFirestoreOnDeleteHandler, wrapFirestoreOnUpdateHandler } from './sentry'

GCPFunction.init({
	dsn: process.env.SENTRY_DSN,
	tracesSampleRate: 1.0
})

export type DocumentReference = admin.firestore.DocumentReference
export const gcs = new Storage.Storage
export const gcsBucket = gcs.bucket(environment.firebase.options.storageBucket)
export { logger } from 'firebase-functions'

admin.initializeApp()
export const db = admin.firestore()
export const auth = admin.auth()

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp
export const increment = admin.firestore.FieldValue.increment
export const arrayUnion = admin.firestore.FieldValue.arrayUnion

export { admin, Storage }
export const functions = (config = defaultConfig) => runWith({ ...config, ...defaultConfig} )

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any

export function onDocumentCreate(docPath: string, name: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
	return functions(config)
		.firestore
		.document(docPath)
		.onCreate(wrapFirestoreOnCreateHandler(name, fn))
}

export function onDocumentUpdate(docPath: string, name: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
	return functions(config)
		.firestore
		.document(docPath)
		.onUpdate(wrapFirestoreOnUpdateHandler(name, fn))
}

export function onDocumentDelete(docPath: string, name: string, fn: FunctionType, config: RuntimeOptions = defaultConfig) {
	return functions(config)
		.firestore
		.document(docPath)
		.onDelete(wrapFirestoreOnDeleteHandler(name, fn))
}

const secrets = [
	'URLMETA_APIKEY',
	'URLMETA_USERNAME',
	'ALGOLIA_APIKEY',
	'ALGOLIA_APPID',
	'SENDGRID_APIKEY',
	'SENTRY_DSN',
	'OPENAI_APIKEY'
]

export const defaultConfig: RuntimeOptions = {
	secrets
}
