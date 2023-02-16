import { Component, HostListener, Inject, OnDestroy, PLATFORM_ID } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { isPlatformServer, Location } from '@angular/common'
import { Platform, ModalController, PopoverController } from '@ionic/angular'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { Unsubscribe } from 'firebase/firestore'
import { differenceInMilliseconds } from 'date-fns'

import { filter, first, firstValueFrom, Subscription } from 'rxjs'

import { TabsComponent } from './pages/tabs/tabs.component'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SupportService } from '@strive/support/support.service'
import { NotificationService } from '@strive/notification/notification.service'
import { PersonalService } from '@strive/user/personal.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AppVersionService } from '@strive/utils/services/app-version.service'
import { AuthService } from '@strive/auth/auth.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ProfileOptionsBrowserComponent } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page'

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

  private lastBack = new Date()
  backButtonSub = this.platform.backButton.subscribeWithPriority(0, async () => {
    // prevent double trigger when going back (doesn't happen in debug mode, only in live action)
    const now = new Date()
    if (differenceInMilliseconds(new Date(), this.lastBack) <= 100) return
    this.lastBack = now

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
    private versionService: AppVersionService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.openModalOnStartup()
    this.versionService.checkForUpdate()

    platform.ready().then(() => {
      this.screensize.onResize(platform.width())

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

      if (!isLoggedIn) {
        if (Capacitor.getPlatform() === 'web') {
          const doNotShowExact = ['/terms', '/privacy-policy', '/goals', '/download', '/']
          const doNotShowPartial = ['/goal/']
          const showRegisterModalPages = ['/explore']

          const dontShow = doNotShowExact.some(page => page === url) || doNotShowPartial.some(part => url.includes(part))
          const showRegister = showRegisterModalPages.some(page => page === url)

          if (!dontShow) {
            if (showRegister) {
              await this.openAuthModal(enumAuthSegment.register)
            } else {
              await this.openAuthModal(enumAuthSegment.login)
            }
          }
        
        } else {
          await this.openAuthModal(enumAuthSegment.register)
        }
      }

      const reroutesToGoals = isLoggedIn && url === '/'
      const goalsRoute = url === '/goals'
      if (!reroutesToGoals && !goalsRoute) SplashScreen.hide()
    })
  }

  openUserPopover(ev: UIEvent) {
    this.popoverCtrl.create({
      component: ProfileOptionsBrowserComponent,
      event: ev,
      showBackdrop: false
    }).then(popover => popover.present())
  }

  async openAuthModal(authSegment: enumAuthSegment) {
    const modal = await this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: { authSegment }
    })
    modal.present()
  }

  @HostListener('window:resize', ['$event'])
  private onResize(event: any) {
    this.screensize.onResize(event.target.innerWidth)
  }
}
