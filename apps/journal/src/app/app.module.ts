import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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
import { CreateGoalPage } from './pages/goal/modals/create-goal/create-goal.page';
import { CreatePostModalPage } from './pages/goal/posts/create-post-modal/create-post-modal.page';
import { DiscussionPage } from './pages/discussion/discussion.page';
import { CreateTemplateModalPage } from './pages/template/modals/create-template-modal/create-template-modal.page';
import { TermsPage } from './pages/terms/terms.page';
import { PrivacyPolicyPage } from './pages/terms/privacy-policy/privacy-policy.page';
// import { HomePage } from './pages/home/home.page';
import { TabsPage } from './pages/tabs/tabs';
import { ProfileOptionsBrowserPage } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page';
import { AuthModalPage } from './pages/auth/auth-modal.page';

// Components
import { ComponentsModule } from './components/components.module';

// Directives
import { Autosize } from './directives/auto-resize-textarea/auto-resize-textarea.directive';

// FontAwesome
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

// Text editor
import { QuillModule } from 'ngx-quill';
// import { ShareButtonsModule } from '@ngx-share/buttons';
import { ShareButtonsConfig, ShareModule } from '@ngx-share/core';

const customConfig: ShareButtonsConfig = {
  autoSetMeta: true,
  twitterAccount: 'ankitsharma_007'
};

@NgModule({
  declarations: [
    AppComponent,
    Autosize,
    CreateGoalPage,
    CreatePostModalPage,
    DiscussionPage,
    CreateTemplateModalPage,
    PrivacyPolicyPage,
    TermsPage,
    // HomePage,
    TabsPage,
    ProfileOptionsBrowserPage,
    AuthModalPage
  ],
  entryComponents: [
    CreateGoalPage,
    CreatePostModalPage,
    DiscussionPage,
    CreateTemplateModalPage,
    PrivacyPolicyPage,
    TermsPage,
    // HomePage,
    TabsPage,
    ProfileOptionsBrowserPage,
    AuthModalPage
  ],
  imports: [    
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    AngularFireMessagingModule,
    //enable offline persistance
    // AngularFirestoreModule.enablePersistence(),
    AngularFirePerformanceModule,
    BrowserModule,
    CommonModule,
    FontAwesomeModule,
    HttpClientModule,
    IonicModule.forRoot(), 
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    ComponentsModule,
    // ShareButtonsModule,
    ShareModule.withConfig(customConfig),
    QuillModule.forRoot(),
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
