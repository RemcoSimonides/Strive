import { Component, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { isPlatformServer, Location } from '@angular/common'
import { Platform, ModalController, PopoverController } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
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
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'

@Component({
  selector: 'journal-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  rootPage: typeof TabsComponent = TabsComponent

  enumAuthSegment = enumAuthSegment

  unreadNotifications$ = this.notification.hasUnreadNotification$
  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$

  private fcmUnsubscribe?: Unsubscribe | undefined
  private sub?: Subscription

  profile$ = this.auth.profile$

  backButtonSub = this.platform.backButton.subscribeWithPriority(0, async () => {
    const segments = this.router.url.split('/').slice(1)

    if (!segments[0] || segments[0] === 'goals') {
      return App.exitApp()
    }

    if (segments[0] === 'supports') {
      return this.router.navigate(['goals'])
    }

    if (segments[0] === 'explore') {
      return this.router.navigate(['goals'])
    }

    if (segments[0] === 'exercise') {
      const id = segments[1]
      if (id) {
        return this.location.back()
      } else {
        return this.router.navigate(['goals'])
      }
    }

    if (segments[0] === 'profile') {
      const isOwner = segments[1] === this.auth.uid
      if (isOwner) {
        return this.router.navigate(['goals'])
      } else {
        return this.location.back()
      }
    }

    return this.location.back()
  })

  constructor(
    private auth: AuthService,
    private location: Location,
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

    platform.ready().then(() => {
      this.screensize.onResize(platform.width())

      GoogleAuth.initialize({
        clientId: '423468347975-tjkdd38gna8rfgqd16f0jpf1o5bl6204.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true
      })

      if (Capacitor.getPlatform() === 'web') {
        this.personalService.showMessages().then(res => {
          this.fcmUnsubscribe = res
        })
      } else {
        this.personalService.addListenersCapacitor()
      }
    })

    this.seo.setInitial()
  }

  ngOnDestroy() {
    if (this.fcmUnsubscribe) this.fcmUnsubscribe()
    this.sub?.unsubscribe()
    this.backButtonSub.unsubscribe()
  }

  async openModalOnStartup() {
    if (isPlatformServer(this.platformId)) return

    this.sub = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), first()).subscribe(async event => {
      const isLoggedIn = await firstValueFrom(this.auth.isLoggedIn$)
      const { url } = event

      const reroutesToGoals = isLoggedIn && url === '/'
      const goalsRoute = '/goals'
      if (!reroutesToGoals && !goalsRoute) SplashScreen.hide()

      if (!isLoggedIn) {
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
