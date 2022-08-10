import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout'
import { RouterModule } from '@angular/router';

// Ionic
import { IonicModule } from '@ionic/angular';

// Angularfire / firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

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

// FontAwesome
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import * as Sentry from '@sentry/capacitor';
import * as SentryAngular from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init(
  {
    dsn: 'https://4f1406746eae4c7aa069055270c617d9@o1354459.ingest.sentry.io/6638131',
    release: 'strivejournal@1',
    dist: '1',
    tracesSampleRate: 1.0,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost'],
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
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
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
    FontAwesomeModule
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'journal' },
    { provide: ErrorHandler, useValue: SentryAngular.createErrorHandler() },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas)
  }
}
