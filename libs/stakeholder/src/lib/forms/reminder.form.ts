import { FormControl, FormGroup, Validators } from '@angular/forms'
import { createReminder, DayTypes, Reminder } from '@strive/model'

function createReminderFormControl(params?: Partial<Reminder>) {
  const reminder = createReminder(params)
  return {
    id: new FormControl<string>(reminder.id, { nonNullable: true }),
    description: new FormControl(reminder.description, { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
    isRepeating: new FormControl<boolean | null>(reminder.isRepeating),
    interval: new FormControl(reminder.interval, { nonNullable: true, validators: [Validators.required] }),
    date: new FormControl(reminder.date, { nonNullable: true, validators: [Validators.required] }),
    dayOfWeek: new FormControl(reminder.dayOfWeek, { nonNullable: true }),
    numberOfWeek: new FormControl(reminder.numberOfWeek, { nonNullable: true })
  }
}

type ReminderFormControl = ReturnType<typeof createReminderFormControl>
export class ReminderForm extends FormGroup<ReminderFormControl> {
  constructor(reminder?: Partial<Reminder>) {
    super(createReminderFormControl(reminder))
  }

  get id() { return this.get('id')! as FormControl<string> }
  get description() { return this.get('description')! as FormControl<string> }
  get isRepeating() { return this.get('isRepeating')! as FormControl<boolean> }
  get interval() { return this.get('interval')! as FormControl<string> }
  get date() { return this.get('date')! as FormControl<Date> }
  get dayOfWeek() { return this.get('dayOfWeek')! as FormControl<DayTypes> }
  get numberOfWeek() { return this.get('numberOfWeek')! as FormControl<number> }

  get isValid() {
    const { description, date, dayOfWeek, isRepeating, interval, numberOfWeek} = this.value

    if (!description) return false
    if (!date) return false

    if (isRepeating) {
      if (interval === 'yearly' && !date) return false

      if (interval === 'quarterly') {
        if (!dayOfWeek || numberOfWeek === null || numberOfWeek === undefined) return false
      }

      if (interval === 'monthly') {
        if (!dayOfWeek || numberOfWeek === null || numberOfWeek === undefined || numberOfWeek > 4) return false
      }

      if (interval === 'weekly') {
        if (!dayOfWeek) return false
      }

    } else {
      if (!date) return false
    }

    return true
  }
}