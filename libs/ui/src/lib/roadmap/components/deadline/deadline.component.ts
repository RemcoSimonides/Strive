import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Milestone } from '@strive/milestone/+state/milestone.firestore';

@Component({
  selector: '[milestone] strive-milestone-deadline',
  templateUrl: 'deadline.component.html',
  styleUrls: ['./deadline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MilestoneDeadlineComponent {

  @ViewChild('datePicker') datePicker: any

  @Input() milestone: Milestone
  @Input() maxDeadline: string
  @Input() isAdmin = false

  @Output() change = new EventEmitter<string>()

  openDatePicker(event: Event) {
    if (!this.isAdmin) return
    event.stopPropagation(); //prevents roadmap from collapsing in or out :)
    this.datePicker.el.click()
  }

  public openDatetime($event) {

    // empty value
    $event.target.value = ""

    // set min
    $event.target.min = new Date().toISOString()

    // set max
    if (this.maxDeadline) {
      $event.target.max = this.maxDeadline
    } else {
      $event.target.max = new Date(new Date().getFullYear() + 1000, 12, 31).toISOString()
    }
  }

  public onDeadlineDateChange(value: string) {
    this.milestone.deadline = value
    this.change.emit(value);
  }
}