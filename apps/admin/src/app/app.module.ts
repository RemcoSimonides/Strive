import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

// Ionic
import { IonicModule } from '@ionic/angular'

// Environments
import { environment } from 'environments/environment'

import { FIREBASE_CONFIG } from 'ngfire'

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
    { provide: FIREBASE_CONFIG, useValue: environment.firebase }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
