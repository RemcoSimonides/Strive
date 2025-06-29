import { ChangeDetectionStrategy, Component, HostListener, Input, inject } from '@angular/core'
import { IonContent, IonList, IonItem, PopoverController } from '@ionic/angular/standalone'
import { addYears, endOfYear, startOfYear } from 'date-fns'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

@Component({
    selector: 'strive-goal-deadline-popover',
    templateUrl: './deadline.component.html',
    styleUrls: ['./deadline.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonContent,
        IonList,
        IonItem
    ]
})
export class DeadlinePopoverComponent {
  private popoverCtrl = inject(PopoverController);

  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

  @Input() caption?: string

  async deadlineSelect(value: '1' | 'end0' | 'end1' | '3' | '10' | 'custom') {
    const now = new Date()

    if (value === 'custom') {
      const minDate = startOfYear(addYears(new Date(), -100))
      const maxDate = endOfYear(addYears(new Date(), 1000))

      const popover = await this.popoverCtrl.create({
        component: DatetimeComponent,
        componentProps: { minDate, maxDate, showRemove: false, caption: this.caption, width: '300px' },
        cssClass: 'datetime-popover'
      })
      popover.onDidDismiss().then(({ data, role }) => {
        if (role === 'dismiss') {
          const date = data ? new Date(data) : new Date()
          this.popoverCtrl.dismiss(date)
        } else {
          this.popoverCtrl.dismiss()
        }
      })
      popover.present()
    } else {
      let date = undefined

      if (value === '1') date = addYears(now, 1)
      if (value === 'end0') date = endOfYear(now)
      if (value === 'end1') date = endOfYear(addYears(now, 1))
      if (value === '3') date = addYears(now, 3)
      if (value === '10') date = addYears(now, 10)

      this.popoverCtrl.dismiss(date)
    }
  }
}