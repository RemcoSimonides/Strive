import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

@Component({
  selector: '[affirmation] exercise-affirm-modal',
  templateUrl: './affirm-modal.component.html',
  styleUrls: ['./affirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AffirmModalComponent {

  @Input() affirmation!: string
  
}