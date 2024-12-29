import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { IonContent } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: '[affirmation] strive-exercise-affirm-modal',
    templateUrl: './affirm-modal.component.html',
    styleUrls: ['./affirm-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        HeaderModalComponent,
        IonContent
    ]
})
export class AffirmModalComponent extends ModalDirective {
  @Input() affirmation = ''
}
