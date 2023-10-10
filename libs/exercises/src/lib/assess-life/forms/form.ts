import { FormControl, FormGroup } from '@angular/forms'
import { AssessLifeEntry, createAssessLifeEntry } from '@strive/model'
import { TimeManagementForm } from '../components/time-management/time-management.form'
import { WheelOfLifeForm } from '../components/wheel-of-life/wheel-of-life.form'
import { FormList } from '../utils/form.utils'
import { LearnForm } from '../components/learn/learn.form'
import { DearFutureSelfForm } from '../components/dear-future-self/dear-future-self.form'
import { ExploreForm } from '../components/explore/explore.form'
import { EnvironmentForm } from '../components/environment/environment.form'

function createAssessLifeFormControl(params?: Partial<AssessLifeEntry>) {
  const assessLife = createAssessLifeEntry(params)

  return {
    id: new FormControl(assessLife.id, { nonNullable: true }),
    dearFutureSelf: new DearFutureSelfForm(assessLife.dearFutureSelf),
    environment: new EnvironmentForm(assessLife.environment),
    explore: new ExploreForm(assessLife.explore),
    gratitude: new FormList(assessLife.gratitude),
    learn: new LearnForm(assessLife.learn),
    proud: new FormList(assessLife.proud),
    timeManagement: new TimeManagementForm(assessLife.timeManagement),
    wheelOfLife: new WheelOfLifeForm(assessLife.wheelOfLife),
  }
}

export type AssessLifeFormControl = ReturnType<typeof createAssessLifeFormControl>

export class AssessLifeForm extends FormGroup<AssessLifeFormControl> {
  constructor(assessLife?: Partial<AssessLifeEntry>) {
    super(createAssessLifeFormControl(assessLife))
  }

  get id() { return this.get('id')! as FormControl }
  get dearFutureSelf() { return this.get('dearFutureSelf')! as DearFutureSelfForm }
  get environment() { return this.get('environment')! as EnvironmentForm }
  get explore() { return this.get('explore')! as ExploreForm }
  get gratitude() { return this.get('gratitude')! as FormList }
  get learn() { return this.get('learn')! as LearnForm }
  get proud() { return this.get('proud')! as FormList }
  get timeManagement() { return this.get('timeManagement')! as TimeManagementForm }
  get wheelOfLife() { return this.get('wheelOfLife')! as WheelOfLifeForm }
}