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
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { AlgoliaService  } from '@strive/utils/services/algolia.service';
import { Observable, of, Subscription } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Unsubscribe } from '@firebase/util';
import { limit, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  rootPage: typeof TabsPage = TabsPage;

  enumAuthSegment = enumAuthSegment

  unreadNotifications$: Observable<boolean>

  private profileSubscription: Subscription
  // private screenSizeSubscription: Subscription
  private fcmUnsubscribe: Unsubscribe

  constructor(
    public screensize: ScreensizeService,
    public user: UserService,
    private fcm: FcmService,
    private algolia: AlgoliaService,
    // private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    public platform: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private notification: NotificationService
  ) {
    this.initializeApp();
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe()
    // this.screenSizeSubscription.unsubscribe()
    this.fcmUnsubscribe()
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
        this.fcmUnsubscribe = this.fcm.showMessages()
      }

      this.openAuthModalOnStartup()

      this.unreadNotifications$ = this.user.profile$.pipe(
        switchMap(profile => {
          return profile
          ? this.notification.valueChanges([where('type', '==', 'notification'), where('isRead', '==', false), limit(1)], { uid: profile.uid }).pipe(map(notifications => !!notifications.length))
          : of(false)
        })
      )
      
    });
  }

  initializeMenu() {
    // this.screenSizeSubscription = this.screensize.isTablet$.subscribe(isTablet => {
    //   this.menuCtrl.enable(isTablet)
    // })
  }

  async openAuthModalOnStartup() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), first()).subscribe(async (event: NavigationEnd) => {
      const isLoggedIn = await this.user.isLoggedIn$.pipe(first()).toPromise()
      if (isLoggedIn) return

      const doNotShowAuthPages = ['/terms', '/privacy-policy', '/feed']
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
