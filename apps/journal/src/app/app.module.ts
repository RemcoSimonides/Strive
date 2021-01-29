import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { CommonModule } from '@angular/common';

// Ionic
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Angularfire / firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFirePerformanceModule } from '@angular/fire/performance';

// Environments
import { environment } from 'environments/environment';

// App
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages
import { TabsPage } from './pages/tabs/tabs';
import { ProfileOptionsBrowserPage } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page';
import { AuthModalModule } from './pages/auth/auth-modal.module';

// FontAwesome
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Text editor
import { ShareButtonsConfig, ShareModule } from 'ngx-sharebuttons';

const customConfig: ShareButtonsConfig = {
  autoSetMeta: true,
  twitterAccount: 'strivejournal'
};

@NgModule({
  declarations: [
    AppComponent,
    TabsPage,
    ProfileOptionsBrowserPage,
  ],
  entryComponents: [
    TabsPage,
    ProfileOptionsBrowserPage,
  ],
  imports: [
    // Angular
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AngularFireMessagingModule,
    //enable offline persistance
    // AngularFirestoreModule.enablePersistence(),
    AngularFirePerformanceModule,
    AppRoutingModule,
    BrowserModule,
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,

    // Libraries
    FontAwesomeModule,
    ShareModule.withConfig(customConfig),

    // Strive
    AuthModalModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far, fab)
  }
}
