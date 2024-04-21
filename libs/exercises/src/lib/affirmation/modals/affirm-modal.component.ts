import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { IonContent } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
  standalone: true,
  selector: '[affirmation] strive-exercise-affirm-modal',
  templateUrl: './affirm-modal.component.html',
  styleUrls: ['./affirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    HeaderModalComponent,
    ImageModule,
    IonContent
  ]
})
export class AffirmModalComponent extends ModalDirective {
  @Input() affirmation = ''
}
