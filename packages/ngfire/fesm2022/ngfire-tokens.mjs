import { InjectionToken, inject } from '@angular/core';

const FIREBASE_APP_SETTINGS = new InjectionToken('FirebaseApp Configuration');
const FIREBASE_CONFIG = new InjectionToken('Firebase Config');
const REGION_OR_DOMAIN = new InjectionToken('Firebase cloud functions region or domain');
const FIRESTORE_SETTINGS = new InjectionToken('Firestore settings');
const ANALYTICS_SETTINGS = new InjectionToken('Analytics settings');
const STORAGE_BUCKET = new InjectionToken('The gs:// url to your Firebase Storage Bucket.');
const DB_URL = new InjectionToken('The URL of the Realtime Database instance to connect to');
const AUTH_DEPS = new InjectionToken('The dependencies that can be used to initialize an Auth instance.');
function getConfig() {
    try {
        return inject(FIREBASE_CONFIG);
    }
    catch (err) {
        const message = `You should add FIREBASE_CONFIG token to you root module providers (probably AppModule).
Example:
  
@NgModule({
  declarations: [...],
  imports: [...],
  providers: [{ provide: FIREBASE_CONFIG, useValue: environment.firebase }] <--- Add this
  ...
})

Original message: ${err.message}`;
        throw new Error(message);
    }
}

/**
 * Generated bundle index. Do not edit.
 */

export { ANALYTICS_SETTINGS, AUTH_DEPS, DB_URL, FIREBASE_APP_SETTINGS, FIREBASE_CONFIG, FIRESTORE_SETTINGS, REGION_OR_DOMAIN, STORAGE_BUCKET, getConfig };
//# sourceMappingURL=ngfire-tokens.mjs.map
