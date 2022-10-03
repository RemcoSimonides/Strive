import { Component, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { isPlatformServer } from '@angular/common'
import { Platform, ModalController, PopoverController } from '@ionic/angular'
import { Unsubscribe } from 'firebase/firestore'

import { filter, first, firstValueFrom, Subscription } from 'rxjs'

import { TabsComponent } from './pages/tabs/tabs.component'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SupportService } from '@strive/support/support.service'
import { NotificationService } from '@strive/notification/notification.service'
import { PersonalService } from '@strive/user/personal/personal.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AuthService } from '@strive/user/auth/auth.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { ProfileOptionsBrowserComponent } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'

@Component({
  selector: 'journal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  rootPage: typeof TabsComponent = TabsComponent;

  enumAuthSegment = enumAuthSegment

  unreadNotifications$ = this.notification.hasUnreadNotification$
  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$

  private fcmUnsubscribe?: Unsubscribe | undefined
  private sub?: Subscription

  profile$ = this.auth.profile$

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private notification: NotificationService,
    private personalService: PersonalService,
    private platform: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private support: SupportService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.openModalOnStartup()

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
    })

    this.seo.setInitial()
  }

  ngOnDestroy() {
    if (this.fcmUnsubscribe) this.fcmUnsubscribe()
    this.sub?.unsubscribe()
  }

  async openModalOnStartup() {
    if (isPlatformServer(this.platformId)) return

    this.sub = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), first()).subscribe(async event => {
      const isLoggedIn = await firstValueFrom(this.auth.isLoggedIn$)

      if (!isLoggedIn) {
        const { url } = event
        const doNotShowExact = ['/terms', '/privacy-policy', '/goals', '/']
        const doNotShowPartial = ['/goal/']
        const doShowSignUpModalPages = ['/explore']
  
        if (doNotShowExact.some(page => page === url)) return
        if (doNotShowPartial.some(part => url.includes(part))) return
        if (doShowSignUpModalPages.some(page => page === url)) {
          this.openAuthModal(enumAuthSegment.register)
        } else {
          this.openAuthModal(enumAuthSegment.login)
        }
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
