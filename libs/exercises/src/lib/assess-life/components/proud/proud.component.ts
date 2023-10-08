import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { AssessLifeIntervalPipe } from '../../pipes/interval.pipe'
import { AssessLifeInterval } from '@strive/model'
import { FormList } from '../../utils/form.utils'

@Component({
  standalone: true,
  selector: '[form][interval] strive-assess-life-proud',
  templateUrl: './proud.component.html',
  styleUrls: ['./proud.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AssessLifeIntervalPipe
  ]
})
export class AssessLifeProudComponent {

  inputForm = new FormControl('', { nonNullable: true })
  showInput = signal<boolean>(true)

  @Input() interval?: AssessLifeInterval
  @Input() form?: FormList
  @Input() set stepping(stepping: boolean | null) {
    if (stepping && this.inputForm.value) {
      this.showInput.set(false)
      this.add()
    }
  }

  add() {
    if (!this.form) return
    this.form.entries.push(new FormControl(this.inputForm.value, { nonNullable: true }))
    this.form.markAsDirty()
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