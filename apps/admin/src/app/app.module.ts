import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

// Ionic
import { IonicModule } from '@ionic/angular'

// Environments
import { environment } from 'environments/environment'

// Angularfire / firebase
import { initializeFirestore } from 'firebase/firestore'
import { getApp, initializeApp } from 'firebase/app'
import { provideAuth, getAuth } from '@angular/fire/auth'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideAuth(() => getAuth()),
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'admin' }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    initializeApp(environment.firebase)
    initializeFirestore(getApp(), {})
  }
}
