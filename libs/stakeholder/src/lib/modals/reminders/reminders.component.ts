import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormArray, ReactiveFormsModule } from '@angular/forms'

import { IonTitle, IonContent, IonList, IonItem, IonButton, ModalController } from '@ionic/angular/standalone'
import { of } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Reminder } from '@strive/model'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ReminderForm } from '@strive/stakeholder/forms/reminder.form'
import { ReminderService } from '@strive/stakeholder/reminder.service'
import { UpsertReminderModalComponent } from '../upsert-reminder/upsert-reminder.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderModalComponent,
    PageLoadingComponent,
    IonTitle,
    IonContent,
    IonItem,
    IonList,
    IonButton,
  ],
  selector: '[goal, stakeholder] strive-reminders-modal',
  templateUrl: './reminders.component.html',
  styleUrls: ['./reminders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemindersModalComponent extends ModalDirective implements OnInit {

  form = new FormArray<ReminderForm>([])
  newReminderForm = new ReminderForm()

  reminders$ = of<Reminder[]>([])

  @Input() goalId = ''
  @Input() stakeholderId = ''

  constructor(
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private reminderService: ReminderService
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.reminders$ = this.reminderService.valueChanges({ goalId: this.goalId, uid: this.stakeholderId })
  }

  upsertReminder(reminder?: Reminder) {
    this.modalCtrl.create({
      component: UpsertReminderModalComponent,
      componentProps: { reminder, goalId: this.goalId, stakeholderId: this.stakeholderId }
    }).then(modal => modal.present())
  }
}
