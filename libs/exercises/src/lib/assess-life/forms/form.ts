import { FormControl, FormGroup } from '@angular/forms'
import { AssessLifeEntry, createAssessLifeEntry } from '@strive/model'
import { TimeManagementForm } from '../components/time-management/time-management.form'
import { WheelOfLifeForm } from '../components/wheel-of-life/wheel-of-life.form'

function createAssessLifeFormControl(params?: Partial<AssessLifeEntry>) {
  const assessLife = createAssessLifeEntry(params)

  return {
    id: new FormControl(assessLife.id, { nonNullable: true }),
    timeManagement: new TimeManagementForm(assessLife.timeManagement),
    wheelOfLife: new WheelOfLifeForm(assessLife.wheelOfLife)
  }
}

export type AssessLifeFormControl = ReturnType<typeof createAssessLifeFormControl>

export class AssessLifeForm extends FormGroup<AssessLifeFormControl> {
  constructor(assessLife?: Partial<AssessLifeEntry>) {
    super(createAssessLifeFormControl(assessLife))
  }

  get id() { return this.get('id')! as FormControl }
  get timeManagement() { return this.get('timeManagement')! as TimeManagementForm }
  get wheelOfLife() { return this.get('wheelOfLife')! as WheelOfLifeForm }
}