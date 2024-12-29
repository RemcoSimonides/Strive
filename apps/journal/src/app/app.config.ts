import { ApplicationConfig, ErrorHandler, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker'

import { provideIonicAngular } from '@ionic/angular/standalone';
import { Capacitor } from '@capacitor/core';

// Firebase
import { AUTH_DEPS, FIREBASE_CONFIG } from 'ngfire';
import { indexedDBLocalPersistence } from 'firebase/auth';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { environment } from '@env';

// Sentry
import * as Sentry from '@sentry/capacitor'
import { init, createErrorHandler } from '@sentry/angular'

Sentry.init(
  {
    dsn: 'https://4f1406746eae4c7aa069055270c617d9@o1354459.ingest.sentry.io/6638131',
    release: 'strivejournal@1',
    dist: '1',
    tracesSampleRate: 1.0,
    enableNative: false
  },
  init
)

// Swiper
import { register } from 'swiper/element/bundle'
register();

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideIonicAngular({ mode: 'md' }),
    provideServiceWorker('sw-master.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    { provide: 'APP_NAME', useValue: 'journal' },
    { provide: FIREBASE_CONFIG, useValue: environment.firebase },
    { provide: AUTH_DEPS, useValue: Capacitor.getPlatform() === 'ios' ? { persistence: indexedDBLocalPersistence } : undefined},
    { provide: ErrorHandler, useValue: createErrorHandler() },
  ]
};
