import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  selector: '[affirmation] strive-exercise-affirm-modal',
  templateUrl: './affirm-modal.component.html',
  styleUrls: ['./affirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmModalComponent extends ModalDirective {
  @Input() affirmation!: string
}
