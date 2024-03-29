/**
 * Temporary wrapper for firebase functions until @sentry/node support is implemented
 * It currently supports wrapping https, pubsub and firestore handlers.
 * usage: https.onRequest(wrap((req, res) => {...}))
 */
import { type https } from 'firebase-functions'
import type { onRequest, onCall } from 'firebase-functions/lib/v1/providers/https'
import type { ScheduleBuilder } from 'firebase-functions/lib/v1/providers/pubsub'
import type { DocumentBuilder } from 'firebase-functions/lib/v1/providers/firestore'
import { addRequestDataToEvent } from '@sentry/node'

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
    const {startTransaction, configureScope, Handlers, captureException, flush, init} = await import('@sentry/node')

    // set process.env['SENTRY_USE_ENVIRONMENT'] to false to avoid TypeError: core.getCurrentHub(...).getScope(...).setPropagationContext is not a function at updateScopeFromEnvVariables at node_modules/@sentry/node/cjs/sdk.js:256:37
    init({
      dsn: process.env['SENTRY_DSN']
    })

    let req: https.Request | undefined
    let ctx: Record<string, unknown> | undefined
    if (type === 'http') {
      req = (a as unknown) as https.Request
    }
    if (type === 'callable') {
      const ctxLocal = (b as unknown) as https.CallableContext
      req = ctxLocal.rawRequest
    }
    if (type === 'document') {
      ctx = (b as unknown) as Record<string, unknown>
    }
    if (type === 'schedule') {
      ctx = (a as unknown) as Record<string, unknown>
    }

    const transaction = startTransaction({
      name,
      op: 'transaction'
    });

    configureScope(scope => {
      scope.addEventProcessor(event => {
        let ev = event

        if (req) {
          ev = addRequestDataToEvent(event, req)
        }
        if (ctx) {
          ev = Handlers.parseRequest(event, ctx)
          ev.extra = ctx
          delete ev.request
        }

        ev.transaction = transaction.name

        // force catpuring uncaughtError as not handled
        const mechanism = ev.exception?.values?.[0].mechanism
        if (mechanism && ev.tags?.['handled'] === false) {
          mechanism.handled = false
        }
        return ev
      });
      scope.setSpan(transaction)
    })

    return Promise.resolve(fn(a, b))
      .catch(err => {
        captureException(err, {tags: {handled: false}})
        throw err
      })
      .finally(() => {
        transaction.finish()
        return flush(2000)
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