/**
 * Temporary wrapper for firebase functions until @sentry/node support is implemented
 * It currently supports wrapping https, pubsub and firestore handlers.
 * usage: https.onRequest(wrap((req, res) => {...}))
 */
import type { onRequest, onCall } from 'firebase-functions/lib/v1/providers/https'
import type { ScheduleBuilder } from 'firebase-functions/lib/v1/providers/pubsub'
import type { DocumentBuilder } from 'firebase-functions/lib/v1/providers/firestore'

type httpsOnRequestHandler = Parameters<typeof onRequest>[0]
type httpsOnCallHandler = Parameters<typeof onCall>[0]
type pubsubOnRunHandler = Parameters<ScheduleBuilder['onRun']>[0]
type firestoreOnWriteHandler = Parameters<DocumentBuilder<''>['onWrite']>[0]
type firestoreOnUpdateHandler = Parameters<DocumentBuilder<''>['onUpdate']>[0]
type firestoreOnCreateHandler = Parameters<DocumentBuilder<''>['onCreate']>[0]
type firestoreOnDeleteHandler = Parameters<DocumentBuilder<''>['onDelete']>[0]

type FunctionType = 'http' | 'callable' | 'document' | 'schedule'

function wrap<A, C>(type: FunctionType, name: string, fn: (a: A) => C | Promise<C>): typeof fn;
function wrap<A, B, C>(type: FunctionType, name: string, fn: (a: A, b: B) => C | Promise<C>): typeof fn;
function wrap<A, B, C>(type: FunctionType, name: string, fn: (a: A, b: B) => C | Promise<C>): typeof fn {
  return async (a: A, b: B): Promise<C> => {
    const {captureException, flush, init} = await import('@sentry/node')

    init({
      dsn: process.env['SENTRY_DSN']
    })

    return Promise.resolve(fn(a, b))
      .catch(err => {
        captureException(err, {tags: {handled: false}})
        throw err
      })
      .finally(() => {
        flush(2000);
      })
  }
}

export function wrapHttpsOnRequestHandler(name: string, fn: httpsOnRequestHandler): typeof fn {
  return wrap('http', name, fn)
}

export function wrapHttpsOnCallHandler(name: string, fn: httpsOnCallHandler): typeof fn {
  return wrap('callable', name, fn)
}

export function wrapPubsubOnRunHandler(name: string, fn: pubsubOnRunHandler): typeof fn {
  return wrap('schedule', name, fn)
}

export function wrapFirestoreOnWriteHandler(name: string, fn: firestoreOnWriteHandler): typeof fn {
  return wrap('document', name, fn)
}

export function wrapFirestoreOnUpdateHandler(name: string, fn: firestoreOnUpdateHandler): typeof fn {
  return wrap('document', name, fn)
}

export function wrapFirestoreOnCreateHandler(name: string, fn: firestoreOnCreateHandler): typeof fn {
  return wrap('document', name, fn)
}

export function wrapFirestoreOnDeleteHandler(name: string, fn: firestoreOnDeleteHandler): typeof fn {
  return wrap('document', name, fn)
}