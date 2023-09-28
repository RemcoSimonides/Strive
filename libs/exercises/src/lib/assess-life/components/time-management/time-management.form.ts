import { FormGroup } from '@angular/forms'
import { FormList } from '../../utils/form.utils'
import { TimeManagement, createTimeManagement } from '@strive/model'

function createTimeManagementFormControl(params?: Partial<TimeManagement>) {
  const timeManagement = createTimeManagement(params)

  return {
    past: new FormList(timeManagement.past),
    futureMoreTime: new FormList(timeManagement.futureMoreTime),
    futureLessTime: new FormList(timeManagement.futureLessTime)
  }
}

export type TimeManagementFormControl = ReturnType<typeof createTimeManagementFormControl>

export class TimeManagementForm extends FormGroup<TimeManagementFormControl> {
  constructor(timeManagement?: Partial<TimeManagement>) {
    super(createTimeManagementFormControl(timeManagement))
  }

  get past() { return this.get('past')! as FormList }
  get futureMoreTime() { return this.get('futureMoreTime')! as FormList }
  get futureLessTime() { return this.get('futureLessTime')! as FormList }
}