import * as admin from 'firebase-admin'
import * as Storage from '@google-cloud/storage'

import { GlobalOptions, setGlobalOptions } from 'firebase-functions/v2'
import { onDocumentCreated, onDocumentDeleted, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onRequest as _onRequest, onCall as _onCall } from 'firebase-functions/v2/https'
import { onSchedule as _onSchedule } from 'firebase-functions/v2/scheduler'
import { defineSecret } from 'firebase-functions/params'


export type DocumentReference = admin.firestore.DocumentReference
export const getRef = (path: string) => db.doc(path)
export const gcs = new Storage.Storage
export const gcsBucket = gcs.bucket('strive-journal.appspot.com')

export { logger } from 'firebase-functions/v2'

if (admin.apps.length === 0) {
	admin.initializeApp()
}
export const db = admin.firestore()
export const auth = admin.auth()

export const serverTimestamp = admin.firestore.FieldValue.serverTimestamp
export const increment = admin.firestore.FieldValue.increment
export const arrayUnion = admin.firestore.FieldValue.arrayUnion

export { admin, Storage }

const secrets = [
	defineSecret('URLMETA_APIKEY'),
	defineSecret('URLMETA_USERNAME'),
	defineSecret('ALGOLIA_APIKEY'),
	defineSecret('ALGOLIA_APPID'),
	defineSecret('SENDGRID_APIKEY'),
	defineSecret('SENTRY_DSN'),
	defineSecret('SENTRY_USE_ENVIRONMENT'),
	defineSecret('OPENAI_APIKEY'),
	defineSecret('STRAVA_CLIENT_ID'),
	defineSecret('STRAVA_CLIENT_SECRET')
]

const defaultOptions: GlobalOptions = {
	secrets,
	region: 'us-central1',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FunctionType = (...args: any[]) => any
type FirestoreOnCreateHandler = Parameters<typeof onDocumentCreated>[1]
type FirestoreOnUpdateHandler = Parameters<typeof onDocumentUpdated>[1]
type FirestoreOnDeleteHandler = Parameters<typeof onDocumentDeleted>[1]

export function onRequest(fn: FunctionType, options?: GlobalOptions) {
	setGlobalOptions({ ...defaultOptions, ...options });
	return _onRequest({ secrets, cors: true }, wrap(fn))
}

export function onCall(fn: FunctionType, options?: GlobalOptions) {
	setGlobalOptions({
		...defaultOptions,
		region: 'us-central1', // eu west will give CORS error
		...options });
	return _onCall({ secrets, cors: true }, wrap(fn))
}

export function onSchedule(schedule: string, fn: FunctionType, options?: GlobalOptions) {
	setGlobalOptions({ ...defaultOptions, ...options });
	return _onSchedule(schedule, wrap(fn))
}

export function onDocumentCreate(docPath: string, fn: FirestoreOnCreateHandler, options?: GlobalOptions) {
	setGlobalOptions({ ...defaultOptions, ...options });
	return onDocumentCreated(docPath, wrap<FirestoreOnCreateHandler>(fn))
}

export function onDocumentUpdate(docPath: string, fn: FirestoreOnUpdateHandler, options?: GlobalOptions) {
	setGlobalOptions({ ...defaultOptions, ...options });
	return onDocumentUpdated(docPath, wrap<FirestoreOnUpdateHandler>(fn))
}

export function onDocumentDelete(docPath: string, fn: FirestoreOnDeleteHandler, options?: GlobalOptions) {
	setGlobalOptions({ ...defaultOptions, ...options });
	return onDocumentDeleted(docPath, wrap<FirestoreOnDeleteHandler>(fn))
}

function wrap<T extends FunctionType>(fn: T): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const {captureException, flush, init} = await import('@sentry/node')

    init({
      dsn: process.env['SENTRY_DSN']
    })

    return Promise.resolve(fn(...args))
      .catch(err => {
        captureException(err, {tags: {handled: false}})
        throw err
      })
      .finally(() => {
        flush(2000);
      })
  }) as T
}