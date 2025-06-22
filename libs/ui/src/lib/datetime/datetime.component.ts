import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, inject } from '@angular/core'
import { IonDatetime, IonButton, PopoverController } from '@ionic/angular/standalone'

@Component({
    selector: 'strive-datetime',
    templateUrl: './datetime.component.html',
    styleUrls: ['./datetime.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonDatetime,
        IonButton
    ]
})
export class DatetimeComponent {
  private popoverCtrl = inject(PopoverController);

  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

  @ViewChild('datePicker') datetime?: IonDatetime

  _value?: string
  @Input() set value(value: string | Date) {
    if (!value) return
    this._value = typeof value === 'string' ? value : value.toLocaleString()
  }

  _minDate?: string
  @Input() set minDate(value: string | Date) {
    if (!value) return
    this._minDate = typeof value === 'string' ? value : value.toLocaleString()
  }

  _maxDate?: string
  @Input() set maxDate(value: string | Date) {
    if (!value) return
    this._maxDate = typeof value === 'string' ? value : value.toLocaleString()
  }
  @Input() presentation: 'date' | 'date-time' | 'month' | 'month-year' | 'time' | 'time-date' | 'year' = 'date'
  @Input() label?: string
  @Input() caption?: string
  @Input() hideRemove = false

  confirm() {
    this.popoverCtrl.dismiss(this.datetime?.value, 'dismiss')
  }

  remove() {
    this.popoverCtrl.dismiss(undefined, 'remove')
  }
}
