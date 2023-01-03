import type { RuntimeOptions } from 'firebase-functions'
import { functions } from '../internals/firebase'
import { wrapHttpsOnRequestHandler } from '../internals/sentry'

// __non_webpack_require__ ensure webpack uses *require* at runtime
declare const __non_webpack_require__: any
const expressApp = __non_webpack_require__(`${__dirname}/dist/apps/journal/server/main`).app()

const config: RuntimeOptions = {
  timeoutSeconds: 60,
  memory: '1GB',
  minInstances: 1
}

export const ssr = functions(config)
  .region('us-central1') // ssr only work with us-central1 (https://firebase.google.com/docs/hosting/functions)
  .https
  .onRequest(wrapHttpsOnRequestHandler('ssr', expressApp))