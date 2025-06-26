import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'

import { addYears, endOfYear, startOfYear } from 'date-fns'

import { AlertController, IonButton, IonContent, IonInput, IonList, IonItem,  IonRadio, IonRadioGroup, IonSelect, IonSelectOption, IonTitle, IonTextarea, PopoverController } from '@ionic/angular/standalone'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { createReminder, DayTypes, Reminder } from '@strive/model'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ReminderForm } from '@strive/stakeholder/forms/reminder.form'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { ReminderService } from '@strive/stakeholder/reminder.service'

@Component({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HeaderModalComponent,
        IonButton,
        IonContent,
        IonInput,
        IonItem,
        IonList,
        IonRadio,
        IonRadioGroup,
        IonSelect,
        IonSelectOption,
        IonTitle,
        IonTextarea
    ],
    selector: '[goal, stakeholder] strive-upsert-reminder-modal',
    templateUrl: './upsert-reminder.component.html',
    styleUrls: ['./upsert-reminder.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpsertReminderModalComponent extends ModalDirective implements OnInit {
  private alertCtrl = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);
  private popoverCtrl = inject(PopoverController);
  private reminderService = inject(ReminderService);


  form = new ReminderForm()
  isEditMode = false

  @Input() reminder?: Reminder
  @Input() goalId = ''
  @Input() stakeholderId = ''

  constructor() {
    super()
  }

  ngOnInit() {
    if (this.reminder?.id) {
      this.isEditMode = true
      this.form.patchValue(this.reminder)
    }
  }

  save() {
    if (!this.form.isValid) return

    const reminder = createReminder(this.form.value)
    if (reminder.id) {
      this.reminderService.upsert(reminder, { params: { goalId: this.goalId, uid: this.stakeholderId } })
    } else {
      this.reminderService.add(reminder, { params: { goalId: this.goalId, uid: this.stakeholderId } })
    }
    this.dismiss()
  }

  remove() {

    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this reminder?`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            if (!this.reminder?.id) return
            this.reminderService.remove(this.reminder.id, { params: { goalId: this.goalId, uid: this.stakeholderId } })
            this.dismiss()
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }

  async openTimePicker() {
    const control = this.form.date
    if (!control) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { presentation: 'time', hideRemove: true, value: control.value },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss().then(({ data }) => {
      const date = data ? data : control.value ? control.value : new Date()
      control.setValue(date)
      control.markAsDirty()
      this.cdr.markForCheck()
    })
    popover.present()
  }

  selectDayOfWeek(day: DayTypes) {
    const control = this.form.get('dayOfWeek')
    if (!control) return

    control.setValue(day)
    control.markAsDirty()
    this.cdr.markForCheck()
  }

  async openDatePicker(startYear: boolean) {
    const caption = 'When would you like to receive the first reminder?'

    const minDate = startYear ? startOfYear(new Date()) : new Date()
    const maxDate = startYear ? endOfYear(new Date()) : addYears(new Date(), 100)

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { caption, hideRemove: true, minDate, maxDate }
    })
    popover.onDidDismiss().then(({ data }) => {
      if (data && this.form) {
        this.form.date.setValue(data)
        this.form.date.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}
