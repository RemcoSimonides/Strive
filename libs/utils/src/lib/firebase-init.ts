import { InjectionToken, NgZone, Provider } from '@angular/core'
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, getAuth, indexedDBLocalPersistence, initializeAuth } from 'firebase/auth'
import { Firestore, getFirestore, initializeFirestore } from 'firebase/firestore'
import { Capacitor } from '@capacitor/core'

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP')
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE')
export const AUTH = new InjectionToken<Auth>('AUTH')

export function provideFirebase(config: FirebaseOptions): Provider[] {
  return [
    {
      provide: FIREBASE_APP,
      useFactory: (zone: NgZone) => zone.runOutsideAngular(() => initializeApp(config)),
      deps: [NgZone],
    },
    {
      provide: FIRESTORE,
      // Firestore's default WebChannel transport fails silently in the native
      // WKWebView (capacitor://) — every read/write stays pending forever, which
      // left the app hanging on the splash and profile/feed data never loading.
      // Force long-polling on native so requests complete. Web keeps WebChannel.
      useFactory: (app: FirebaseApp, zone: NgZone) =>
        zone.runOutsideAngular(() =>
          Capacitor.isNativePlatform()
            ? initializeFirestore(app, { experimentalForceLongPolling: true })
            : getFirestore(app)
        ),
      deps: [FIREBASE_APP, NgZone],
    },
    {
      provide: AUTH,
      // getAuth's defaults (persistence fallback chain + browserPopupRedirectResolver)
      // stall in the native WKWebView (capacitor://) — auth state never resolves and
      // the app hangs on the splash screen. Native sign-in goes through the
      // @capacitor-firebase/authentication plugin, so the popup resolver isn't needed.
      useFactory: (app: FirebaseApp, zone: NgZone) =>
        zone.runOutsideAngular(() =>
          Capacitor.isNativePlatform()
            ? initializeAuth(app, { persistence: indexedDBLocalPersistence })
            : getAuth(app)
        ),
      deps: [FIREBASE_APP, NgZone],
    },
  ]
}
