import { InjectionToken, NgZone, Provider } from '@angular/core'
import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'

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
      useFactory: (app: FirebaseApp, zone: NgZone) => zone.runOutsideAngular(() => getFirestore(app)),
      deps: [FIREBASE_APP, NgZone],
    },
    {
      provide: AUTH,
      useFactory: (app: FirebaseApp, zone: NgZone) => zone.runOutsideAngular(() => getAuth(app)),
      deps: [FIREBASE_APP, NgZone],
    },
  ]
}
