import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// Ionic
import { Platform, MenuController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
import { FcmService } from '@strive/utils/services/fcm.service';
import { ScreensizeService } from '@strive/utils/services/screensize.service';
// Pages
import { TabsPage } from './pages/tabs/tabs'
import { ProfileOptionsBrowserPage } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'
import { AuthModalPage, enumAuthSegment } from './pages/auth/auth-modal.page';
import { AlgoliaService  } from '@strive/utils/services/algolia.service';
import { Subscription } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { AngularFireMessaging } from '@angular/fire/messaging';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  rootPage: any = TabsPage;

  enumAuthSegment = enumAuthSegment

  private profileSubscription: Subscription
  private screenSizeSubscription: Subscription
  private fcmSubscription: Subscription

  constructor(
    public screensize: ScreensizeService,
    public user: UserService,
    private fcm: FcmService,
    private algolia: AlgoliaService,
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private messaging: AngularFireMessaging
  ) {
    this.initializeApp();
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe()
    this.screenSizeSubscription.unsubscribe()
    this.fcmSubscription.unsubscribe()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.initializeMenu();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.screensize.onResize(this.platform.width());

      if ((this.platform.is('android') || this.platform.is('ios')) && !this.platform.is('mobileweb')) {
        this.fcm.addListenersCapacitor()
      }

      if (this.platform.is('mobileweb')) {
        this.fcmSubscription = this.fcm.showMessages().subscribe()
      }

      this.openAuthModalOnStartup()
    });
  }

  initializeMenu() {
    this.screenSizeSubscription = this.screensize.isDesktop$.subscribe(isDesktop => {
      this.menuCtrl.enable(isDesktop && (this.platform.is('ios') || this.platform.is('android')))
    })
  }

  async openAuthModalOnStartup() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), first()).subscribe(async (event: NavigationEnd) => {
      const isLoggedIn = await this.user.isLoggedIn$.pipe(first()).toPromise()
      if (isLoggedIn) return

      const doNotShowAuthPages = ['/terms', '/privacy-policy']
      const doShowSignUpModalPages = ['/explore']

      if (doNotShowAuthPages.some(page => page === event.url)) return
      if (doShowSignUpModalPages.some(page => page === event.url)) {
        this.openAuthModal(enumAuthSegment.register)
      } else {
        this.openAuthModal(enumAuthSegment.login)
      }
    })
  }

  async search(event): Promise<void> {
    const query = event.target.value

    // only search when page is explore page
    if (this.router.url === '/explore') {
      if (query !== undefined) {
        this.algolia.search(query)
      }
    }

  }

  goToSearchResults(event) {
    const query = event.target.value

    // check if current website is explore page already
    if (this.router.url !== '/explore') {

      this.navCtrl.navigateRoot('/explore')
      if (query !== undefined) {
        this.algolia.search(query)
      }
    }

  }

  async openProfilePopover(ev: UIEvent): Promise<void> {
    this.popoverCtrl.create({
      component: ProfileOptionsBrowserPage,
      event: ev,
      showBackdrop: false
    }).then(popover => popover.present())
  }

  openAuthModal(segment: enumAuthSegment) {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: segment
      }
    }).then(modal => modal.present())
  }

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.screensize.onResize(event.target.innerWidth);
  }
}
