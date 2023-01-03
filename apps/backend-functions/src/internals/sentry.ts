/**
 * Temporary wrapper for firebase functions until @sentry/serverless support is implemented
 * It currently supports wrapping https, pubsub and firestore handlers.
 * usage: https.onRequest(wrap((req, res) => {...}))
 */
import type { https } from 'firebase-functions'
import type { onRequest, onCall } from 'firebase-functions/lib/v1/providers/https'
import type { ScheduleBuilder } from 'firebase-functions/lib/v1/providers/pubsub'
import type { DocumentBuilder } from 'firebase-functions/lib/v1/providers/firestore'
import { addRequestDataToEvent } from '@sentry/serverless'
 
type httpsOnRequestHandler = Parameters<typeof onRequest>[0]
type httpsOnCallHandler = Parameters<typeof onCall>[0]
type pubsubOnRunHandler = Parameters<ScheduleBuilder['onRun']>[0]
type firestoreOnWriteHandler = Parameters<DocumentBuilder<''>['onWrite']>[0]
type firestoreOnUpdateHandler = Parameters<DocumentBuilder<''>['onUpdate']>[0]
type firestoreOnCreateHandler = Parameters<DocumentBuilder<''>['onCreate']>[0]
type firestoreOnDeleteHandler = Parameters<DocumentBuilder<''>['onDelete']>[0]

type FunctionType = 'http' | 'callable' | 'document' | 'schedule'

export function getLocationHeaders(req: https.Request): {country?: string; ip?: string} {
   /**
    * Checking order:
    * Cloudflare: in case user is proxying functions through it
    * Fastly: in case user is service functions through firebase hosting (Fastly is the default Firebase CDN)
    * App Engine: in case user is serving functions directly through cloudfunctions.net
    */
   const ip =
     req.header('Cf-Connecting-Ip') ||
     req.header('Fastly-Client-Ip') ||
     req.header('X-Appengine-User-Ip') ||
     req.header('X-Forwarded-For')?.split(',')[0] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress
 
   const country =
     req.header('Cf-Ipcountry') ||
     req.header('X-Country-Code') ||
     req.header('X-Appengine-Country');
   return {ip: ip?.toString(), country: country?.toString()}
}
 
function wrap<A, C>(type: FunctionType, name: string, fn: (a: A) => C | Promise<C>): typeof fn;
function wrap<A, B, C>(
  type: FunctionType,
  name: string,
  fn: (a: A, b: B) => C | Promise<C>
): typeof fn;
function wrap<A, B, C>(
  type: FunctionType,
  name: string,
  fn: (a: A, b: B) => C | Promise<C>
): typeof fn {
  return async (a: A, b: B): Promise<C> => {
    const {startTransaction, configureScope, Handlers, captureException, flush} = await import(
      '@sentry/node'
    );
    const {extractTraceparentData} = await import('@sentry/tracing');

    let req: https.Request | undefined;
    let ctx: Record<string, unknown> | undefined;
    if (type === 'http') {
      req = (a as unknown) as https.Request;
    }
    if (type === 'callable') {
      const ctxLocal = (b as unknown) as https.CallableContext;
      req = ctxLocal.rawRequest;
    }
    if (type === 'document') {
      ctx = (b as unknown) as Record<string, unknown>;
    }
    if (type === 'schedule') {
      ctx = (a as unknown) as Record<string, unknown>;
    }

    const traceparentData = extractTraceparentData(req?.header('sentry-trace') || '');
    const transaction = startTransaction({
      name,
      op: 'transaction',
      ...traceparentData,
    });

    configureScope(scope => {
      scope.addEventProcessor(event => {
        let ev = event;

        if (req) {
          ev = addRequestDataToEvent(event, req);
          const loc = getLocationHeaders(req);
          loc.ip && Object.assign(ev.user, {ip_address: loc.ip});
          loc.country && Object.assign(ev.user, {country: loc.country});
        }
        if (ctx) {
          ev = Handlers.parseRequest(event, ctx);
          ev.extra = ctx;
          delete ev.request;
        }

        ev.transaction = transaction.name;

        // force catpuring uncaughtError as not handled
        const mechanism = ev.exception?.values?.[0].mechanism;
        if (mechanism && ev.tags?.handled === false) {
          mechanism.handled = false;
        }
        return ev;
      });
      scope.setSpan(transaction);
    });

    return Promise.resolve(fn(a, b))
      .catch(err => {
        captureException(err, {tags: {handled: false}});
        throw err;
      })
      .finally(() => {
        transaction.finish();
        return flush(2000);
      });
  };
}

export function wrapHttpsOnRequestHandler(name: string, fn: httpsOnRequestHandler): typeof fn {
  return wrap('http', name, fn);
}

export function wrapHttpsOnCallHandler(name: string, fn: httpsOnCallHandler): typeof fn {
  return wrap('callable', name, fn);
}

export function wrapPubsubOnRunHandler(name: string, fn: pubsubOnRunHandler): typeof fn {
  return wrap('schedule', name, fn);
}

export function wrapFirestoreOnWriteHandler(name: string, fn: firestoreOnWriteHandler): typeof fn {
  return wrap('document', name, fn);
}

export function wrapFirestoreOnUpdateHandler(
  name: string,
  fn: firestoreOnUpdateHandler
): typeof fn {
  return wrap('document', name, fn);
}

export function wrapFirestoreOnCreateHandler(
  name: string,
  fn: firestoreOnCreateHandler
): typeof fn {
  return wrap('document', name, fn);
}

export function wrapFirestoreOnDeleteHandler(
  name: string,
  fn: firestoreOnDeleteHandler
): typeof fn {
  return wrap('document', name, fn);
}