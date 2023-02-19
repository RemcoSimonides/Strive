import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { ModalController, Platform } from '@ionic/angular'
import { getAuth } from 'firebase/auth'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { PersonalService } from '@strive/user/personal.service'
import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { AppVersionService } from '@strive/utils/services/app-version.service'
import { ThemeService } from '@strive/utils/services/theme.service'

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
  isWeb = Capacitor.getPlatform() === 'web'
  theme$ = this.themeService.theme$

  showPlayStore = this.isWeb && !this.platform.platforms().includes('ios')
  showAppStore = this.isWeb && !this.platform.platforms().includes('android')

  fcmActive = false

  version = this.versionService.version

  constructor(
    private cdr: ChangeDetectorRef,
    private location: Location,
    private modalCtrl: ModalController,
    private personalService: PersonalService,
    private platform: Platform,
    private pwa: PWAService,
    private router: Router,
    private themeService: ThemeService,
    private versionService: AppVersionService
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

  async signOut() {
    await getAuth().signOut()
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

  toggleTheme() {
    this.themeService.toggle()
  }
}