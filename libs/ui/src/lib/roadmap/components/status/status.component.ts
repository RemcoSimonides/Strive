import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MilestoneStatus } from '@strive/milestone/+state/milestone.firestore';

@Component({
  selector: 'strive-milestone-status',
  templateUrl: 'status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneStatusComponent {

  icon: Record<MilestoneStatus, { 
    name: string,
    color: 'primary' | 'secondary' | 'warning' | 'danger' | 'none',
    pointer: boolean
  }> = {
    pending: {
      name: 'radio-button-off',
      color: 'primary',
      pointer: true
    },
    succeeded: {
      name: 'checkmark-circle',
      color: 'secondary',
      pointer: false
    },
    failed: {
      name: 'close-circle',
      color: 'danger',
      pointer: false
    },
    neutral: {
      name: 'remove-circle',
      color: 'warning',
      pointer: false
    },
    overdue: {
      name: 'radio-button-off',
      color: 'primary',
      pointer: true
    }
  }

  @Input() status: MilestoneStatus
}