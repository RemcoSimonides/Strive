import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
// Ionic
import { Platform, MenuController, PopoverController, ModalController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
// Services
import { AuthService } from './services/auth/auth.service';
import { FcmService } from './services/fcm/fcm.service';
import { ScreensizeService } from './services/screensize/screensize.service';
// Pages
import { TabsPage } from './pages/tabs/tabs'
import { ProfileOptionsBrowserPage } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'
import { AuthModalPage, enumAuthSegment } from './pages/auth/auth-modal.page';
import { InstantSearchService } from './services/instant-search/instant-search.service';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  rootPage:any = TabsPage;
  _isDesktop: boolean;
  _isLoggedIn: boolean;

  pages: Array<{ title: string, url: string, icon: string }> = []

  _uid: string

  private _inAppNotificationsObservable: Observable<any>

  enumAuthSegment = enumAuthSegment

  constructor(
    public auth: AuthService,
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

    this.auth.getCurrentuserProfileObs().subscribe((userProfile) => {
      if (userProfile) {
        this._isLoggedIn = true;
      } else {
        this._isLoggedIn = false;
      }
    })

    this.pages = []
    this.auth.getCurrentUserProfile().then(userProfile => {
      if (userProfile) {
        this._uid = userProfile.id

        this.pages.push(
          { title: 'Explore', url: '/explore', icon: 'globe' },
          { title: 'Notifications', url: '/notifications', icon: 'notifications' },
          { title: 'Goals', url: '/goals', icon: 'flag' },
          { title: 'Supports', url: '/supports', icon: 'heart' },
          { title: 'Profile', url: `/profile/${userProfile.id}`, icon: 'person' }
        )

      }
    })
  }

  async openAuthModalOnStartup(): Promise<void> {

    this.router.events.pipe(filter(event => event instanceof NavigationEnd), take(1)).subscribe(async (event: NavigationEnd) => {

      const isLoggedIn: boolean = await this.auth.isLoggedIn()
      if (isLoggedIn) return

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
