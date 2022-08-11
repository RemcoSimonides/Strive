import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterModule } from '@angular/router';

// Ionic
import { IonicModule } from '@ionic/angular';

// firebase
import { initializeApp, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

// Environments
import { environment } from 'environments/environment';

// App
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages
import { TabsComponent } from './pages/tabs/tabs.component';
import { ProfileOptionsBrowserPageModule } from './pages/profile/popovers/profile-options-browser/profile-options-browser.module';
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module';

import { ImageModule } from '@strive/media/directives/image.module'

import * as Sentry from '@sentry/capacitor';
import * as SentryAngular from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';
import { ServiceWorkerModule } from '@angular/service-worker';

Sentry.init(
  {
    dsn: 'https://4f1406746eae4c7aa069055270c617d9@o1354459.ingest.sentry.io/6638131',
    release: 'strivejournal@1',
    dist: '1',
    tracesSampleRate: 1.0,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', 'strivejournal.com'],
      }),
    ]
  },
  SentryAngular.init
);

@NgModule({
  declarations: [
    AppComponent,
    TabsComponent
  ],
  imports: [
    provideAuth(() => getAuth()),
    //enable offline persistance
    // AngularFirestoreModule.enablePersistence(),
    AppRoutingModule,
    RouterModule,
    BrowserModule,
    FlexLayoutModule,
    IonicModule.forRoot(),
    // Strive
    ImageModule,
    AuthModalModule,
    ProfileOptionsBrowserPageModule,
    ServiceWorkerModule.register('sw-master.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'journal' },
    { provide: ErrorHandler, useValue: SentryAngular.createErrorHandler() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    initializeApp(environment.firebase)
    initializeFirestore(getApp(), {})
  }
}
