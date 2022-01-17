import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { AuthModalModalComponent, enumAuthSegment } from "@strive/user/auth/components/auth-modal/auth-modal.page";
import { FcmService } from "@strive/utils/services/fcm.service";
import { PWAService } from '@strive/utils/services/pwa.service';

@Component({
  selector: 'user-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {

  showInstallPromotion$ = this.pwa.showInstallPromotion$

  constructor(
    private auth: Auth,
    private fcm: FcmService,
    private location: Location,
    private modalCtrl: ModalController,
    private pwa: PWAService,
    private router: Router
  ) {}

  pushNotifications() {
    this.fcm.registerFCM()
  }

  installPWA() {
    this.pwa.showInstallPromotion()
  }

  signOut() {
    this.auth.signOut()
    this.router.navigate(['/'])

    // open auth modal
    this.modalCtrl.create({
      component: AuthModalModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  back() {
    this.location.back()
  }
}