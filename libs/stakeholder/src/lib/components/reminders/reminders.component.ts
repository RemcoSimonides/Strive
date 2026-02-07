import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core'
import { FormArray, ReactiveFormsModule } from '@angular/forms'

import { IonList, IonItem, IonButton, ModalController } from '@ionic/angular/standalone'
import { of } from 'rxjs'

import { Reminder } from '@strive/model'
import { ReminderForm } from '@strive/stakeholder/forms/reminder.form'
import { ReminderService } from '@strive/stakeholder/reminder.service'
import { UpsertReminderModalComponent } from '../../modals/upsert-reminder/upsert-reminder.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

@Component({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PageLoadingComponent,
        IonItem,
        IonList,
        IonButton,
    ],
    selector: '[goalId][stakeholderId] strive-reminders',
    templateUrl: './reminders.component.html',
    styleUrls: ['./reminders.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RemindersComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private reminderService = inject(ReminderService);


  form = new FormArray<ReminderForm>([])
  newReminderForm = new ReminderForm()

  reminders$ = of<Reminder[]>([])

  @Input() goalId = ''
  @Input() stakeholderId = ''

  ngOnInit() {
    if (this.goalId && this.stakeholderId) {
      this.reminders$ = this.reminderService.collectionData({ goalId: this.goalId, uid: this.stakeholderId })
    }
  }

  upsertReminder(reminder?: Reminder) {
    this.modalCtrl.create({
      component: UpsertReminderModalComponent,
      componentProps: { reminder, goalId: this.goalId, stakeholderId: this.stakeholderId }
    }).then(modal => modal.present())
  }
}
