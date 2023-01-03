import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { PopoverController, ModalController } from '@ionic/angular'
import { getAuth } from 'firebase/auth'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { NotificationService } from '@strive/notification/notification.service'
import { PWAService } from '@strive/utils/services/pwa.service'
import { isSafari } from '@strive/utils/helpers'
import { PersonalService } from '@strive/user/personal.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
  selector: 'journal-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserComponent {

  unreadNotifications$ = this.notification.hasUnreadNotification$
  isSafari = isSafari() && matchMedia('(display-mode: browser)').matches

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private personalService: PersonalService,
    private popoverCtrl: PopoverController,
    public pwa: PWAService,
    private router: Router,
    private notification: NotificationService
  ) {}

  goTo(url: string) {
    this.router.navigateByUrl(url)
    this.popoverCtrl.dismiss()
  }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.auth.uid}`)
    this.popoverCtrl.dismiss()
  }

  pushNotifications() {
    this.personalService.registerFCM()
    this.popoverCtrl.dismiss()
  }

  async signOut() {
    await getAuth().signOut()
    this.popoverCtrl.dismiss()

    // open auth modal
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}