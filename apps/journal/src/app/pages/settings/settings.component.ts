import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { Capacitor } from '@capacitor/core'

import { IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonListHeader, ModalController, Platform } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { moonOutline, sunnyOutline, downloadOutline, openOutline } from 'ionicons/icons'

import { getAuth } from 'firebase/auth'

import { PWAService } from '@strive/utils/services/pwa.service'
import { ThemeService } from '@strive/utils/services/theme.service'
import { AppVersionService } from '@strive/utils/services/app-version.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { isSafari } from '@strive/utils/helpers'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { ImageDirective } from '@strive/media/directives/image.directive'

@Component({
    selector: 'journal-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HeaderComponent,
        ImageDirective,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonListHeader
    ]
})
export class SettingsPageComponent {
  private location = inject(Location);
  private modalCtrl = inject(ModalController);
  private platform = inject(Platform);
  private pwa = inject(PWAService);
  private router = inject(Router);
  private screensize = inject(ScreensizeService);
  private themeService = inject(ThemeService);
  private versionService = inject(AppVersionService);


  showInstallPromotion$ = this.pwa.showInstallPromotion$
  isSafari = isSafari() && matchMedia('(display-mode: browser)').matches
  theme$ = this.themeService.theme$
  isMobile$ = this.screensize.isMobile$

  isWeb = Capacitor.getPlatform() === 'web'
  showPlayStore = this.isWeb && !this.platform.platforms().includes('ios')
  showAppStore = this.isWeb && !this.platform.platforms().includes('android')

  version = this.versionService.version

  constructor() {
    addIcons({ moonOutline, sunnyOutline, downloadOutline, openOutline })
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
