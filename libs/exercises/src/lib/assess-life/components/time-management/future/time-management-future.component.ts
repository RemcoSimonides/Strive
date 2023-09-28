import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeIntervalPipe } from '../../../pipes/interval.pipe'
import { AssessLifeInterval, TimeManagement } from '@strive/model'
import { TimeManagementForm } from '../time-management.form'

@Component({
  standalone: true,
  selector: '[form][interval] strive-assess-life-time-management-future',
  templateUrl: './time-management-future.component.html',
  styleUrls: ['./time-management-future.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeTimeManagementFutureComponent {

  inputMoreTimeForm = new FormControl('', { nonNullable: true })
  inputLessTimeForm = new FormControl('', { nonNullable: true })

  @Input() interval?: AssessLifeInterval
  @Input() form?: TimeManagementForm

  @Input() set stepping(stepping: boolean | null) {
    if (stepping && this.inputMoreTimeForm.value) this.addMoreTimeValue()
    if (stepping && this.inputLessTimeForm.value) this.addLessTimeValue()
  }

  addMoreTimeValue() {
    if (!this.form) return
    this.form.futureMoreTime.entries.push(new FormControl(this.inputMoreTimeForm.value, { nonNullable: true }))
    this.inputMoreTimeForm.setValue('')
  }

  addLessTimeValue() {
    if (!this.form) return
    this.form.futureLessTime.entries.push(new FormControl(this.inputLessTimeForm.value, { nonNullable: true }))
    this.inputLessTimeForm.setValue('')
  }

  blur(index: number, control: keyof TimeManagement) {
    if (!this.form) return
    const value = this.form[control].entries.at(index).value
    if (!value) this.removeValue(index, control)
  }

  removeValue(index: number, control: keyof TimeManagement) {
    if (!this.form) return
    this.form[control].entries.removeAt(index)
    this.form.markAsDirty()
  }
}