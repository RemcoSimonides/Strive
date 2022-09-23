import * as functions from 'firebase-functions';

// __non_webpack_require__ ensure webpack uses *require* at runtime
declare const __non_webpack_require__: any;
const expressApp = __non_webpack_require__(`${__dirname}/dist/apps/journal/server/main`).app();

export const ssr = functions
  .region('us-central1') // ssr only work with us-central1 (https://firebase.google.com/docs/hosting/functions)
  .runWith({"timeoutSeconds":60,"memory":"1GB"})
  .https
  .onRequest(expressApp)