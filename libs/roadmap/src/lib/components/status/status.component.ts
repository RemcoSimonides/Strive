import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { createMilestone, MilestoneStatus } from '@strive/model'

@Component({
  selector: 'strive-milestone-status',
  templateUrl: 'status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneStatusComponent {

  icon: Record<MilestoneStatus, { 
    name: string,
    color: 'primary' | 'secondary' | 'warning' | 'danger' | 'none'
  }> = {
    pending: {
      name: 'radio-button-off',
      color: 'primary'
    },
    succeeded: {
      name: 'checkmark-circle',
      color: 'secondary'
    },
    failed: {
      name: 'close-circle',
      color: 'danger'
    }
  }

  @Input() milestone = createMilestone()
}