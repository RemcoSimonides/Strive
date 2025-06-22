import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Router } from '@angular/router'

import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { arrowBack } from 'ionicons/icons'

import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
    selector: '[title] strive-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonTitle
    ]
})
export class HeaderComponent {

  @Input() title?: string
  @Input() color = ''
  @Input() defaultBack = '/'

  constructor(
    private location: Location,
    private router: Router,
    public screensize: ScreensizeService
  ) {
    addIcons({ arrowBack })
  }

  back() {
    const state = this.location.getState() as { navigationId: number }

    if (state?.navigationId === 1) {
      this.router.navigateByUrl(this.defaultBack)
    } else {
      this.location.back()
    }
  }
}
