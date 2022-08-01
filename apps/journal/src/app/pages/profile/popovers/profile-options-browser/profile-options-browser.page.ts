import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { limit, where } from '@angular/fire/firestore';
import { PopoverController, ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Services
import { UserService } from '@strive/user/user/user.service';
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { FcmService } from '@strive/utils/services/fcm.service';
import { NotificationService } from '@strive/notification/notification.service';
import { PWAService } from '@strive/utils/services/pwa.service';

@Component({
  selector: 'journal-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserComponent {

  unreadNotifications$: Observable<boolean>

  constructor(
    private auth: Auth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public pwa: PWAService,
    private router: Router,
    private user: UserService,
    private fcm: FcmService,
    private notification: NotificationService
  ) {
    this.unreadNotifications$ = this.user.user$.pipe(
      switchMap(user => user
        ? this.notification.valueChanges([where('type', '==', 'notification'), where('isRead', '==', false), limit(1)], { uid: user.uid }).pipe(map(notifications => !!notifications.length))
        : of(false)
      )
    )
  }

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
    await this.auth.signOut()
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