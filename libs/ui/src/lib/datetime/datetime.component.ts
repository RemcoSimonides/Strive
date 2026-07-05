import { ChangeDetectionStrategy, Component, HostListener, Input, ViewChild, inject } from '@angular/core'
import { IonDatetime, IonButton, PopoverController } from '@ionic/angular/standalone'
import { format, isValid } from 'date-fns'

// ion-datetime only accepts ISO 8601 and ignores timezones, so format dates
// as local ISO (no 'Z') — toLocaleString() produces strings it cannot parse
// and toISOString() shifts the date for users ahead of UTC.
function toLocalIso(value: string | Date): string | undefined {
  if (typeof value === 'string') return value
  return isValid(value) ? format(value, "yyyy-MM-dd'T'HH:mm:ss") : undefined
}

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

  @HostListener('window:popstate')
  onPopState() { this.popoverCtrl.dismiss() }

  @ViewChild('datePicker') datetime?: IonDatetime

  _value?: string
  @Input() set value(value: string | Date) {
    if (!value) return
    this._value = toLocalIso(value)
  }

  _minDate?: string
  @Input() set minDate(value: string | Date) {
    if (!value) return
    this._minDate = toLocalIso(value)
  }

  _maxDate?: string
  @Input() set maxDate(value: string | Date) {
    if (!value) return
    this._maxDate = toLocalIso(value)
  }
  @Input() presentation: 'date' | 'date-time' | 'month' | 'month-year' | 'time' | 'time-date' | 'year' = 'date'
  @Input() label?: string
  @Input() caption?: string
  @Input() hideRemove = false

  confirm() {
    const value = this.datetime?.value
    const single = Array.isArray(value) ? value[0] : value
    // never hand back a value that parses to an Invalid Date
    const valid = single && isValid(new Date(single)) ? single : undefined
    this.popoverCtrl.dismiss(valid, 'dismiss')
  }

  remove() {
    this.popoverCtrl.dismiss(undefined, 'remove')
  }
}
