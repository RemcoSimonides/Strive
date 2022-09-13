import { ChangeDetectionStrategy, Component } from '@angular/core'
import { isSafari } from '@strive/utils/helpers'
import { PWAService } from '@strive/utils/services/pwa.service'

@Component({
  selector: 'strive-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DownloadComponent {

  isStandalone = matchMedia('(display-mode: standalone)').matches
  isBrowser = matchMedia('(display-mode: browser)').matches
  isSafari = isSafari()

  showInstallPromotion$ = this.pwa.showInstallPromotion$

  constructor(private pwa: PWAService) {}

  install() {
    this.pwa.showInstallPromotion()
  }

}