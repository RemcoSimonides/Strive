import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'

import { IonContent, IonButton } from '@ionic/angular/standalone'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderComponent } from '@strive/ui/header/header.component'

import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { SeoService } from '@strive/utils/services/seo.service'

@Component({
    selector: 'journal-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ImageDirective,
        HeaderComponent,
        IonContent,
        IonButton
    ]
})
export class DownloadPageComponent {
  private pwa = inject(PWAService);


  isStandalone = typeof matchMedia !== 'undefined' ? matchMedia('(display-mode: standalone)').matches : false
  isBrowser = typeof matchMedia !== 'undefined' ? matchMedia('(display-mode: browser)').matches : false
  isSafari = isSafari()

  showInstallPromotion$ = this.pwa.showInstallPromotion$


  constructor() {
    const seo = inject(SeoService);

    seo.generateTags({
      title: 'Download - Strive Journal',
      description: 'Journaling, Affirmations, Dear Future Self, Daily Gratitude and more to increase your chance of succeeding'
    })
  }

  install() {
    this.pwa.showInstallPromotion()
  }
}