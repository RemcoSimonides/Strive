import { ChangeDetectionStrategy, Component } from '@angular/core'
import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'
import { SeoService } from '@strive/utils/services/seo.service'

@Component({
  selector: 'journal-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadPageComponent {

  isStandalone = typeof matchMedia !== 'undefined' ? matchMedia('(display-mode: standalone)').matches : false
  isBrowser = typeof matchMedia !== 'undefined' ? matchMedia('(display-mode: browser)').matches : false
  isSafari = isSafari()

  showInstallPromotion$ = this.pwa.showInstallPromotion$

  constructor(
    private pwa: PWAService,
    seo: SeoService
  ) {
    seo.generateTags({
      title: 'Download - Strive Journal',
      description: 'Journaling, Affirmations, Dear Future Self, Daily Gratitude and more to increase your chance of succeeding'
    })
  }

  install() {
    this.pwa.showInstallPromotion()
  }
}