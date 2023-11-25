import { ErrorHandler, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RouterModule } from '@angular/router'
import { ServiceWorkerModule } from '@angular/service-worker'

// Ionic
import { IonicModule } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'

//  Firebase
import { AUTH_DEPS, FIREBASE_CONFIG } from 'ngfire'
import { indexedDBLocalPersistence } from 'firebase/auth'

// Environments
import { environment } from 'environments/environment'

// App
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'

// Pages
import { TabsModule } from './pages/tabs/tabs.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'

import { ImageModule } from '@strive/media/directives/image.module'
import { PWAService } from '@strive/utils/services/pwa.service'

import * as Sentry from '@sentry/capacitor'
import * as SentryAngular from '@sentry/angular'

Sentry.init(
  {
    dsn: 'https://4f1406746eae4c7aa069055270c617d9@o1354459.ingest.sentry.io/6638131',
    release: 'strivejournal@1',
    dist: '1',
    tracesSampleRate: 1.0,
    enableNative: false
  },
  SentryAngular.init
)

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    //enable offline persistance
    // AngularFirestoreModule.enablePersistence(),
    AppRoutingModule,
    RouterModule,
    BrowserModule.withServerTransition({ appId: 'journal' }),
    IonicModule.forRoot({
      mode: 'md',
      swipeBackEnabled: true
    }),
    ServiceWorkerModule.register('sw-master.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),

    // Strive
    ImageModule,
    AuthModalModule,
    TabsModule
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'journal' },
    { provide: FIREBASE_CONFIG, useValue: environment.firebase },
    { provide: AUTH_DEPS, useValue: Capacitor.getPlatform() === 'ios' ? { persistence: indexedDBLocalPersistence } : undefined},
    { provide: ErrorHandler, useValue: SentryAngular.createErrorHandler() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(pwa: PWAService) {
    pwa.addEventListeners()
  }
}
