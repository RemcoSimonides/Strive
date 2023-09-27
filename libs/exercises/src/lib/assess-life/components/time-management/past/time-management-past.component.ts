import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeIntervalPipe } from '../../../pipes/interval.pipe'
import { FormList } from '../../../utils/form.utils'
import { AssessLifeInterval } from '@strive/model'

@Component({
  standalone: true,
  selector: '[form][interval] strive-assess-life-time-management-past',
  templateUrl: './time-management-past.component.html',
  styleUrls: ['./time-management-past.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeTimeManagementPastComponent {

  inputForm = new FormControl('', { nonNullable: true })

  @Input() interval?: AssessLifeInterval
  @Input() form?: FormList
  @Input() set stepping(stepping: boolean | null) {
    if (stepping && this.inputForm.value) this.add()
  }

  add() {
    if (!this.form) return
    this.form.entries.push(new FormControl(this.inputForm.value, { nonNullable: true }))
    this.inputForm.setValue('')
  }

  blur(index: number) {
    if (!this.form) return
    const value = this.form.entries.at(index).value
    if (!value) this.removeValue(index)
  }

  removeValue(index: number) {
    if (!this.form) return
    this.form.entries.removeAt(index)
    this.form.markAsDirty()
  }
}