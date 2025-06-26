import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'

import { Support } from '@strive/model'
import { SupportDetailsComponent } from '@strive/support/components/details/details.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
    selector: 'strive-support-details-modal',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        SupportDetailsComponent,
        HeaderModalComponent,
        IonContent
    ]
})
export class SupportDetailsModalComponent extends ModalDirective {
  @Input() support?: Support

  constructor() {
    super()
  }
}
