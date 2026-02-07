import { ApplicationConfig, provideZoneChangeDetection, isDevMode, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker'
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { environment } from '@env';

import { provideIonicAngular } from '@ionic/angular/standalone'

import { provideFirebaseApp, initializeApp, FirebaseOptions } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'
import { provideAuth, getAuth } from '@angular/fire/auth'

// import { AUTH_DEPS, FIREBASE_CONFIG } from 'ngfire'
// import { indexedDBLocalPersistence } from 'firebase/auth'

// Sentry
import { init, createErrorHandler } from '@sentry/angular'

init({
  dsn: 'https://4f1406746eae4c7aa069055270c617d9@o1354459.ingest.sentry.io/6638131',
  release: 'strivejournal@1',
  dist: '1',
  tracesSampleRate: 1.0,
})

// Swiper
import { register } from 'swiper/element/bundle'
register()

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideIonicAngular({ mode: 'md' }),
    provideFirebaseApp(() => {
      const config: FirebaseOptions = environment.firebase.options
      return initializeApp(config)
    }),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideServiceWorker('sw-master.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    { provide: 'APP_NAME', useValue: 'journal' },
    { provide: ErrorHandler, useValue: createErrorHandler() },
    // { provide: FIREBASE_CONFIG, useValue: environment.firebase },
    // {
    //   provide: AUTH_DEPS,
    //   useValue:
    //     Capacitor.getPlatform() === 'ios'
    //       ? { persistence: indexedDBLocalPersistence }
    //       : undefined,
    // },
  ],
};
