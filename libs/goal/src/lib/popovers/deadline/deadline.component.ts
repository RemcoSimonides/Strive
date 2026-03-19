import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core'
import { IonContent, IonList, IonItem, PopoverController } from '@ionic/angular/standalone'
import { addYears, endOfYear } from 'date-fns'

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

  @HostListener('window:popstate')
  onPopState() { this.popoverCtrl.dismiss() }

  deadlineSelect(value: '1' | 'end0' | 'end1' | '3' | '10' | 'custom') {
    const now = new Date()

    if (value === 'custom') {
      this.popoverCtrl.dismiss(undefined, 'custom')
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
