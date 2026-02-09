import { Component, HostListener, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser, isPlatformServer, Location } from '@angular/common';
import { Unsubscribe } from 'firebase/firestore'

// Ionic
import { IonApp, IonNav, IonHeader, IonToolbar, IonButton, IonIcon, IonRouterOutlet, Platform, ModalController, PopoverController, IonRouterLink, IonRouterLinkWithHref, IonAvatar } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons';
import {
  search, notificationsOutline, settingsOutline, send, closeOutline, imagesOutline, close, arrowBack,
  logoGoogle, logoApple, mail, trashOutline, checkmarkOutline, ellipsisVertical, calendarOutline,
  linkOutline, checkmark, shareSocialOutline, arrowForwardOutline, ellipsisVerticalOutline, play,
  chevronDownOutline, moonOutline, sunnyOutline, downloadOutline, openOutline, sparklesOutline,
  addOutline, star, starOutline, add, lockClosedOutline, flagOutline, shield, flag, people, map,
  list, clipboard, filterOutline, chatboxOutline, listOutline, alarmOutline, reorderFourOutline,
  personOutline, radioButtonOff, chatbubblesOutline, arrowForward, flagSharp, barbellSharp
} from 'ionicons/icons'

import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'

import { filter, first, Subscription } from 'rxjs'

import { captureException } from '@sentry/angular'
import { differenceInMilliseconds } from 'date-fns'

import { Intent, SendIntent } from 'send-intent'

import { TabsComponent } from './pages/tabs/tabs.component'
import { ProfileOptionsComponent } from './pages/profile/popovers/profile-options/profile-options.component'
import { ImageDirective } from '@strive/media/directives/image.directive'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SupportService } from '@strive/support/support.service'
import { NotificationService } from '@strive/notification/notification.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AppVersionService } from '@strive/utils/services/app-version.service'
import { AuthService } from '@strive/auth/auth.service'
import { PWAService } from '@strive/utils/services/pwa.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { PersonalService } from '@strive/user/personal.service';

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { SendIntentSelectGoalComponent } from '@strive/goal/modals/send-intent-select-goal/send-intent-select-goal.component'

@Component({
  imports: [
    CommonModule,
    RouterModule,
    IonApp, IonNav, IonHeader, IonToolbar, IonButton, IonIcon, IonRouterOutlet, IonRouterLink, IonRouterLinkWithHref, IonApp, IonNav, IonHeader, IonToolbar, IonButton, IonIcon, IonAvatar, IonRouterOutlet,
    ImageDirective
  ],
  selector: 'journal-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnDestroy {
  private auth = inject(AuthService);
  private location = inject(Location);
  private modalCtrl = inject(ModalController);
  private notification = inject(NotificationService);
  private personalService = inject(PersonalService);
  private platform = inject(Platform);
  private popoverCtrl = inject(PopoverController);
  private router = inject(Router);
  screensize = inject(ScreensizeService);
  private seo = inject(SeoService);
  private support = inject(SupportService);
  private theme = inject(ThemeService);
  private versionService = inject(AppVersionService);
  private platformId = inject(PLATFORM_ID);

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
      try {
        return App.exitApp()
      } catch (err) {
        captureException(err)
        return
      }
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
      const isOwner = segments[1] === this.auth.uid()
      if (isOwner) {
        return this.router.navigate(['goals'])
      } else {
        return this.location.back()
      }
    }

    return this.location.back()
  })

  constructor() {
    const platform = this.platform;
    const pwa = inject(PWAService);

    pwa.addEventListeners()
    this.theme.initTheme('dark')
    this.openModalOnStartup()
    if (isPlatformBrowser(this.platformId)) this.versionService.checkForUpdate()

    platform.ready().then(() => {
      this.screensize.onResize(platform.width())

      if (Capacitor.getPlatform() === 'web') {
        this.personalService.showMessages().then(res => {
          this.fcmUnsubscribe = res
        })
      } else {
        this.personalService.addListenersCapacitor()
      }

      if (isPlatformBrowser(this.platformId)) {
        window.addEventListener('sendIntentReceived', () => {
          SendIntent.checkSendIntentReceived().then(this.sendIntent)
        })
      }
      SendIntent.checkSendIntentReceived().then(this.sendIntent)
    })

    this.seo.setInitial()
    addIcons({
      search, notificationsOutline, settingsOutline, send, closeOutline, imagesOutline, close, arrowBack,
      logoGoogle, logoApple, mail, trashOutline, checkmarkOutline, ellipsisVertical, calendarOutline,
      linkOutline, checkmark, shareSocialOutline, arrowForwardOutline, ellipsisVerticalOutline, play,
      chevronDownOutline, moonOutline, sunnyOutline, downloadOutline, openOutline, sparklesOutline,
      addOutline, star, starOutline, add, lockClosedOutline, flagOutline, shield, flag, people, map,
      list, clipboard, filterOutline, chatboxOutline, listOutline, alarmOutline, reorderFourOutline,
      personOutline, radioButtonOff, chatbubblesOutline, arrowForward, flagSharp, barbellSharp
    });
  }

  ngOnDestroy() {
    if (this.fcmUnsubscribe) this.fcmUnsubscribe()
    this.sub?.unsubscribe()
    this.backButtonSub.unsubscribe()
  }

  async openModalOnStartup() {
    // TODO put code that should only execute in browser in afterRender and afterNextRender lifecycle hooks (https://angular.io/guide/ssr#authoring-server-compatible-components)
    if (isPlatformServer(this.platformId)) return

    this.sub = this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), first()).subscribe(async event => {
      const isLoggedIn = this.auth.isLoggedIn()
      const { url } = event

      if (!isLoggedIn) {
        if (Capacitor.getPlatform() === 'web') {
          const doNotShowExact = ['/terms', '/privacy-policy', '/goals', '/download', '/']
          const doNotShowPartial = ['/goal/', '/profile/']
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
      if (!reroutesToGoals && !goalsRoute) SplashScreen.hide().catch(err => captureException(err))
    })
  }

  async openAuthModal(authSegment: enumAuthSegment) {
    const modal = await this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: { authSegment }
    })
    modal.present()
  }

  openPopover(event: Event) {
    this.popoverCtrl.create({
      component: ProfileOptionsComponent,
      event,
      showBackdrop: false
    }).then(popover => popover.present())
  }

  sendIntent(sendIntentData: Intent) {
    if (!sendIntentData || !sendIntentData.title) return
    this.modalCtrl.create({
      component: SendIntentSelectGoalComponent,
      componentProps: { sendIntentData }
    }).then(modal => modal.present())
  }

  @HostListener('window:resize', ['$event'])
  _onResize(event: Event) {
    this.screensize.onResize((event.target as Window).innerWidth)
  }
}

