import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'

import { IonTitle, IonContent, ModalController } from '@ionic/angular/standalone'

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
  protected override location: Location;
  protected override modalCtrl: ModalController;


  @Input() goalId = ''
  @Input() stakeholderId = ''

  constructor() {
    const location = inject(Location);
    const modalCtrl = inject(ModalController);

    super(location, modalCtrl)

    this.location = location;
    this.modalCtrl = modalCtrl;
  }
}
