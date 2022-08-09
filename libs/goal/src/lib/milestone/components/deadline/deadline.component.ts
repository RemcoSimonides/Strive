import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Milestone } from '@strive/model'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component';

@Component({
  selector: '[milestone] strive-milestone-deadline',
  templateUrl: 'deadline.component.html',
  styleUrls: ['./deadline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneDeadlineComponent {
  @Input() milestone!: Milestone
  @Input() maxDeadline?: string
  @Input() isAdmin = false

  @Output() deadlineChange = new EventEmitter<string>()

  constructor(private popoverCtrl: PopoverController) {}

  async openDatePicker(event: Event) {
    if (!this.isAdmin) return
    if (this.milestone.status !== 'pending' && this.milestone.status !== 'overdue') return
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