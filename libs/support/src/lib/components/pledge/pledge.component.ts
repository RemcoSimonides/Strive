import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { createSupportBase, Support } from '@strive/model'

@Component({
  selector: 'support-pledge',
  templateUrl: './pledge.component.html',
  styleUrls: ['./pledge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PledgeComponent {
  @Input() support: Support = createSupportBase()
}