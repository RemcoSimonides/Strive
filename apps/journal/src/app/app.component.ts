import { Component, HostListener, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// Ionic
import { Platform, MenuController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
import { FcmService } from './services/fcm/fcm.service';
import { ScreensizeService } from './services/screensize/screensize.service';
// Pages
import { TabsPage } from './pages/tabs/tabs'
import { ProfileOptionsBrowserPage } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'
import { AuthModalPage, enumAuthSegment } from './pages/auth/auth-modal.page';
import { InstantSearchService } from './services/instant-search/instant-search.service';
import { Observable, Subscription } from 'rxjs';
import { filter, first, take } from 'rxjs/operators';

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
    private _fcm: FcmService,
    private _instantSearchService: InstantSearchService,
    private menuCtrl: MenuController,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    public _platform: Platform,
    private _popoverCtrl: PopoverController,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe()
    this.screenSizeSubscription.unsubscribe()
    this.fcmSubscription.unsubscribe();
  }

  initializeApp() {
    this._platform.ready().then(() => {
      this.initializeMenu();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.screensize.onResize(this._platform.width());

      if ((this._platform.is('android') ||  this._platform.is('ios')) && !this._platform.is('mobileweb')) {
        this._fcm.addListenersCapacitor()
      }

      if (this._platform.is('mobileweb')) {
        this.fcmSubscription = this._fcm.showMessages().subscribe()
      }

      this.openAuthModalOnStartup()
    });
  }

  initializeMenu() {
    this.screenSizeSubscription = this.screensize.isDesktop$.subscribe(isDesktop => this.menuCtrl.enable(!isDesktop))
  }

  async openAuthModalOnStartup(): Promise<void> {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), first()).subscribe(async (event: NavigationEnd) => {
      const isLoggedIn = await this.user.isLoggedIn$.pipe(first()).toPromise();
      if (isLoggedIn) return

      const doNotShowAuthPages = ['/download', '/terms']
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
        this._instantSearchService.search(query)
      }
    }

  }

  goToSearchResults(event) {
    const query = event.target.value

    // check if current website is explore page already
    if (this.router.url !== '/explore') {

      this._navCtrl.navigateRoot('/explore')
      if (query !== undefined) {
        this._instantSearchService.search(query)
      }
    }

  }

  async openProfilePopover(ev: UIEvent): Promise<void> {
    const popover = await this._popoverCtrl.create({
      component: ProfileOptionsBrowserPage,
      event: ev,
      showBackdrop: false
    })
    await popover.present()
  }

  async openAuthModal(segment: enumAuthSegment): Promise<void> {
    const modal = await this._modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: segment
      }
    })
    await modal.present()
  }

  @HostListener('window:resize', ['$event'])
  private onResize(event) {
    this.screensize.onResize(event.target.innerWidth);
  }
}
