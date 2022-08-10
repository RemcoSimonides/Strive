import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { PopoverController, ModalController } from '@ionic/angular'
import { getAuth } from 'firebase/auth'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { FcmService } from '@strive/utils/services/fcm.service'
import { NotificationService } from '@strive/notification/notification.service'
import { PWAService } from '@strive/utils/services/pwa.service'
import { UserService } from '@strive/user/user/user.service'

@Component({
  selector: 'journal-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserComponent {

  unreadNotifications$ = this.notification.hasUnreadNotification$

  constructor(
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public pwa: PWAService,
    private router: Router,
    private user: UserService,
    private fcm: FcmService,
    private notification: NotificationService
  ) {}

  goTo(url: string) {
    this.router.navigateByUrl(url)
    this.popoverCtrl.dismiss()
  }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.user.uid}`)
    this.popoverCtrl.dismiss()
  }

  pushNotifications() {
    this.fcm.registerFCM()
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