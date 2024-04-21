import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild } from '@angular/core'
import { IonDatetime, IonButton, PopoverController } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  selector: 'strive-datetime',
  templateUrl: './datetime.component.html',
  styleUrls: ['./datetime.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonDatetime,
    IonButton
  ]
})
export class DatetimeComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

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

  constructor(private popoverCtrl: PopoverController) { }

  confirm() {
    this.popoverCtrl.dismiss(this.datetime?.value, 'dismiss')
  }

  remove() {
    this.popoverCtrl.dismiss(undefined, 'remove')
  }
}
