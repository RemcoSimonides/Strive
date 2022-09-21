import { Component, HostListener, OnDestroy } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { Platform, ModalController, PopoverController } from '@ionic/angular'
import { Unsubscribe } from 'firebase/firestore'

import { filter, first, firstValueFrom } from 'rxjs'

import { TabsComponent } from './pages/tabs/tabs.component'

import { UserService } from '@strive/user/user/user.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SupportService } from '@strive/support/support.service'
import { NotificationService } from '@strive/notification/notification.service'
import { PersonalService } from '@strive/user/personal/personal.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { ProfileOptionsBrowserComponent } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'

@Component({
  selector: 'strive-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  rootPage: typeof TabsComponent = TabsComponent;

  enumAuthSegment = enumAuthSegment

  unreadNotifications$ = this.notification.hasUnreadNotification$
  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$

  private fcmUnsubscribe?: Unsubscribe | undefined

  constructor(
    private modalCtrl: ModalController,
    private notification: NotificationService,
    private personalService: PersonalService,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    public screensize: ScreensizeService,
    private support: SupportService,
    public user: UserService
  ) {
    this.platform.ready().then(() => {
      this.screensize.onResize(this.platform.width());
      // this.initializeMenu();
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();

      if ((this.platform.is('android') || this.platform.is('ios')) && !this.platform.is('mobileweb')) {
        this.personalService.addListenersCapacitor()
      }

      if (this.platform.is('mobileweb')) {
        this.personalService.showMessages().then(res => {
          this.fcmUnsubscribe = res
        })
      }

      this.openAuthModalOnStartup()
    })
  }

  ngOnDestroy() {
    if (this.fcmUnsubscribe) this.fcmUnsubscribe()
  }

  async openAuthModalOnStartup() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), first()).subscribe(async event => {
      const isLoggedIn = await firstValueFrom(this.user.isLoggedIn$)
      if (isLoggedIn) return

      const doNotShowExact = ['/terms', '/privacy-policy', '/goals', '/']
      const doNotShowPartial = ['/goal/']
      const doShowSignUpModalPages = ['/explore']

      if (doNotShowExact.some(page => page === event.url)) return
      if (doNotShowPartial.some(part => event.url.includes(part))) return
      if (doShowSignUpModalPages.some(page => page === event.url)) {
        this.openAuthModal(enumAuthSegment.register)
      } else {
        this.openAuthModal(enumAuthSegment.login)
      }
    })
  }

  openUserPopover(ev: UIEvent) {
    this.popoverCtrl.create({
      component: ProfileOptionsBrowserComponent,
      event: ev,
      showBackdrop: false
    }).then(popover => popover.present())
  }

  openAuthModal(segment: enumAuthSegment) {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: segment
      }
    }).then(modal => modal.present())
  }

  @HostListener('window:resize', ['$event'])
  private onResize(event: any) {
    this.screensize.onResize(event.target.innerWidth);
  }
}
