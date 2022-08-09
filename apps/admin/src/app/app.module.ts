import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// Ionic
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// Environments
import { environment } from 'environments/environment';

// Angularfire / firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'admin' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
