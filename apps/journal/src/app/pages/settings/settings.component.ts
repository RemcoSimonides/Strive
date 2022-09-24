import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { PersonalService } from '@strive/user/personal/personal.service'
import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { getAuth } from 'firebase/auth'

@Component({
  selector: 'journal-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {

  showInstallPromotion$ = this.pwa.showInstallPromotion$
  fcmIsSupported = this.personalService.fcmIsSupported
  isSafari = isSafari() && matchMedia('(display-mode: browser)').matches

  fcmActive = false

  constructor(
    private cdr: ChangeDetectorRef,
    private personalService: PersonalService,
    private location: Location,
    private modalCtrl: ModalController,
    private pwa: PWAService,
    private router: Router
  ) {
    this.personalService.fcmActive$.subscribe(value => {
      this.fcmActive = value
      this.cdr.markForCheck()
    })
  }

  registerFCM() {
    if (this.personalService.fcmActive$.value) {
      this.personalService.unregisterFCM()
    } else {
      this.personalService.registerFCM()
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