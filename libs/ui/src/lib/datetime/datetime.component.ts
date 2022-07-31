import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { IonDatetime, NavParams, PopoverController } from "@ionic/angular";

@Component({
  selector: 'strive-datetime',
  templateUrl: './datetime.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatetimeComponent {
  @ViewChild('datePicker') datetime: IonDatetime

  minDeadline = this.navParams.data?.minDeadline
  maxDeadline = this.navParams.data?.maxDeadline
  presentation: 'date' | 'date-time' | 'month' | 'month-year' | 'time' | 'time-date' | 'year'

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {
    this.presentation = this.navParams.data?.presentation ?? 'date'
  }
  
  confirm() {
    this.popoverCtrl.dismiss(this.datetime.value, 'dismiss')
  }
  
  remove() {
    this.popoverCtrl.dismiss(undefined, 'remove')
  }
}