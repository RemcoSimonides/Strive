import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { addIcons } from 'ionicons'
import { arrowBack, closeOutline } from 'ionicons/icons'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone'
import { map } from 'rxjs'

@Component({
    selector: 'strive-header-modal',
    templateUrl: './header-modal.component.html',
    styleUrls: ['./header-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon
    ]
})
export class HeaderModalComponent {
  private screensize = inject(ScreensizeService);


  isDesktop$ = this.screensize.isDesktop$
  isNotDesktop$ = this.screensize.isDesktop$.pipe(
    map(isDesktop => !isDesktop)
  )
  @Input() color = ''
  @Input() transparent = false

  @Output() dismiss = new EventEmitter()

  constructor() {
    addIcons({ arrowBack, closeOutline })
  }
}
