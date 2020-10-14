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
  rootPage:any = TabsPage;
  _isDesktop: boolean;
  // _isLoggedIn: boolean;

  pages: Array<{ title: string, url: string, icon: string }> = []

  // _uid: string

  private _inAppNotificationsObservable: Observable<any>

  enumAuthSegment = enumAuthSegment

  private profileSubscription: Subscription
  private screenSizeSubscription: Subscription

  constructor(
    public user: UserService,
    private _fcm: FcmService,
    private _instantSearchService: InstantSearchService,
    private menuCtrl: MenuController,
    private _modalCtrl: ModalController,
    private _navCtrl: NavController,
    public _platform: Platform,
    private _popoverCtrl: PopoverController,
    private router: Router,
    private _screensizeService: ScreensizeService,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe()
    this.screenSizeSubscription.unsubscribe()
  }

  initializeApp() {
    this._platform.ready().then(() => {
      this.initializeMenu();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this._screensizeService.onResize(this._platform.width());

      if ((this._platform.is('android') ||  this._platform.is('ios')) && !this._platform.is('mobileweb')) {
        this._fcm.addListenersCapacitor()
      }

      if (this._platform.is('mobileweb')) {
        this._inAppNotificationsObservable = this._fcm.showMessages()
        this._inAppNotificationsObservable.subscribe()
      }

      this.openAuthModalOnStartup()
    });
  }

  initializeMenu() {

    this._screensizeService.isDesktopView().subscribe(isDesktop => {
      if (this._isDesktop) {
        this.menuCtrl.enable(true)
      } else {
        this.menuCtrl.enable(false)
      }
      this._isDesktop = isDesktop
    })

  }

  async openAuthModalOnStartup(): Promise<void> {


    this.router.events.pipe(filter(event => event instanceof NavigationEnd), first()).subscribe(async (event: NavigationEnd) => {

      if (!this.user.uid) return

      const doNotShowAuthPages: string[] = ['/download', '/terms'];
      const doShowSignUpModalPages: string[] = ['/explore']

      if (doNotShowAuthPages.indexOf(event.url) > -1) {
        return
      } else if (doShowSignUpModalPages.indexOf(event.url) > -1) {
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
    this._screensizeService.onResize(event.target.innerWidth);
  }
}
