import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

@Component({
  selector: 'strive-daily-gratitude-cards-modal',
  templateUrl: './cards-modal.component.html',
  styleUrls: ['./cards-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsModalComponent extends ModalDirective {
}