import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { IonTitle, IonContent } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { RemindersComponent } from '../../components/reminders/reminders.component'

@Component({
    imports: [
    HeaderModalComponent,
    RemindersComponent,
    IonContent,
    IonTitle
],
    selector: '[goal, stakeholder] strive-reminders-modal',
    templateUrl: './reminders.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemindersModalComponent extends ModalDirective {
  @Input() goalId = ''
  @Input() stakeholderId = ''

  constructor() {
    super()
  }
}
