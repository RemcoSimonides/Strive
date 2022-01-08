import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ModalController, PopoverController } from '@ionic/angular';
import { FcmService } from '@strive/utils/services/fcm.service';
import { AuthModalModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { PWAService } from '@strive/utils/services/pwa.service';

@Component({
  selector: 'journal-profile-options',
  templateUrl: './profile-options.page.html',
  styleUrls: ['./profile-options.page.scss'],
})
export class ProfileOptionsComponent {

  constructor(
    private auth: Auth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    public pwa: PWAService,
    private fcm: FcmService
  ) { }

  pushNotifications() {
    this.fcm.registerFCM();
    this.popoverCtrl.dismiss()
  }

  signOut() {
    this.auth.signOut()
    this.popoverCtrl.dismiss()

    // open auth modal
    this.modalCtrl.create({
      component: AuthModalModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}