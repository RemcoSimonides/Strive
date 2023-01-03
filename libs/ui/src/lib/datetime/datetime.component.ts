import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core'
import { IonDatetime, PopoverController } from '@ionic/angular'

@Component({
  selector: 'strive-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatetimeComponent {
  @ViewChild('datePicker') datetime?: IonDatetime

  _value?: string
  @Input() set value(value: string | Date) {
    if (!value) return
    this._value = typeof value === 'string' ? value : value.toISOString()
  }

  _minDate?: string
  @Input() set minDate(value: string | Date) {
    if (!value) return
    this._minDate = typeof value === 'string' ? value : value.toISOString()
  }

  _maxDate?: string
  @Input() set maxDate(value: string | Date) {
    if (!value) return
    this._maxDate = typeof value === 'string' ? value : value.toISOString()
  }
  @Input() presentation: 'date' | 'date-time' | 'month' | 'month-year' | 'time' | 'time-date' | 'year' = 'date'
  @Input() label?: string
  @Input() caption?: string
  @Input() hideRemove = false

  constructor(private popoverCtrl: PopoverController) {}
  
  confirm() {
    this.popoverCtrl.dismiss(this.datetime?.value, 'dismiss')
  }
  
  remove() {
    this.popoverCtrl.dismiss(undefined, 'remove')
  }
}