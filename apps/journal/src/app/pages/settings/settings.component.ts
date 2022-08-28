import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { FcmService } from '@strive/utils/services/fcm.service'
import { PWAService } from '@strive/utils/services/pwa.service'
import { getAuth } from 'firebase/auth'

@Component({
  selector: 'user-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {

  showInstallPromotion$ = this.pwa.showInstallPromotion$
  fcmIsSupported = this.fcm.fcmIsSupported

  fcmActive = false

  constructor(
    private cdr: ChangeDetectorRef,
    private fcm: FcmService,
    private location: Location,
    private modalCtrl: ModalController,
    private pwa: PWAService,
    private router: Router
  ) {
    this.fcm.fcmActive$.subscribe(value => {
      this.fcmActive = value
      this.cdr.markForCheck()
    })
  }

  registerFCM() {
    if (this.fcm.fcmActive$.value) {
      this.fcm.unregisterFCM()
    } else {
      this.fcm.registerFCM()
    }
  }

  installPWA() {
    this.pwa.showInstallPromotion()
  }

  signOut() {
    getAuth().signOut()
    this.router.navigate(['/'])

    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  back() {
    this.location.back()
  }
}