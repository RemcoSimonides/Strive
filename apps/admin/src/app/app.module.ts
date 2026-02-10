import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

// Ionic
import { IonicModule } from '@ionic/angular'

// Environments
import { environment } from 'environments/environment'

import { provideFirebase } from '@strive/utils/firebase-init'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule
  ],
  providers: [
    { provide: 'APP_NAME', useValue: 'admin' },
    ...provideFirebase(environment.firebase.options)
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
