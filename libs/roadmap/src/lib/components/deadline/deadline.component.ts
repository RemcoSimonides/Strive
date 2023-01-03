import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { createGoalStakeholder, Milestone } from '@strive/model'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

@Component({
  selector: '[milestone] strive-milestone-deadline',
  templateUrl: 'deadline.component.html',
  styleUrls: ['./deadline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneDeadlineComponent {
  @Input() milestone!: Milestone
  @Input() maxDeadline?: string
  @Input() stakeholder = createGoalStakeholder()

  @Output() deadlineChange = new EventEmitter<string>()

  get canEdit(): boolean {
    if (!this.stakeholder.isAdmin && !this.stakeholder.isAchiever) return false
    if (this.milestone.status === 'failed' || this.milestone.status === 'succeeded') return false
    return true
  }

  constructor(private popoverCtrl: PopoverController) {}

  async openDatePicker(event: Event) {
    if (!this.canEdit) return
    event.stopPropagation()

    const minDate = new Date()
    const maxDate = this.maxDeadline 
      ? this.maxDeadline
      : new Date(new Date().getFullYear() + 1000, 12, 31)

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'remove') {
        this.milestone.deadline = ''
        this.deadlineChange.emit(this.milestone.deadline)
      } else if (role === 'dismiss') {
        this.milestone.deadline = data ?? ''
        this.deadlineChange.emit(this.milestone.deadline)
      }
    })
    popover.present()
  }
}