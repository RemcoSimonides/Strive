import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Platform, ModalController, PopoverController } from '@ionic/angular';

import { TabsComponent } from './pages/tabs/tabs.component';

import { UserService } from '@strive/user/user/user.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SupportService } from '@strive/support/support.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { filter, first, firstValueFrom } from 'rxjs';
import { NotificationService } from '@strive/notification/notification.service';
import { ProfileOptionsBrowserComponent } from './pages/profile/popovers/profile-options-browser/profile-options-browser.page';

@Component({
  selector: 'strive-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  rootPage: typeof TabsComponent = TabsComponent;

  enumAuthSegment = enumAuthSegment

  unreadNotifications$ = this.notification.hasUnreadNotification$
  hasSupportNeedingDecision$ = this.support.hasSupportNeedingDecision$

  constructor(
    private modalCtrl: ModalController,
    private notification: NotificationService,
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

      // if ((this.platform.is('android') || this.platform.is('ios')) && !this.platform.is('mobileweb')) {
      //   this.fcm.addListenersCapacitor()
      // }

      // if (this.platform.is('mobileweb')) {
      //   this.fcmUnsubscribe = this.fcm.showMessages()
      // }

      this.openAuthModalOnStartup()
    })
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
