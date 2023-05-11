import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { Capacitor } from '@capacitor/core'
import { ModalController, Platform } from '@ionic/angular'
import { getAuth } from 'firebase/auth'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { AppVersionService } from '@strive/utils/services/app-version.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'journal-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent {

  showInstallPromotion$ = this.pwa.showInstallPromotion$
  isSafari = isSafari() && matchMedia('(display-mode: browser)').matches
  theme$ = this.themeService.theme$
  isMobile$ = this.screensize.isMobile$

  isWeb = Capacitor.getPlatform() === 'web'
  showPlayStore = this.isWeb && !this.platform.platforms().includes('ios')
  showAppStore = this.isWeb && !this.platform.platforms().includes('android')

  version = this.versionService.version

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private platform: Platform,
    private pwa: PWAService,
    private router: Router,
    private screensize: ScreensizeService,
    private themeService: ThemeService,
    private versionService: AppVersionService
  ) {}

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