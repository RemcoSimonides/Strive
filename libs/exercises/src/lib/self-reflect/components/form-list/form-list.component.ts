import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core'
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { SelfReflectQuestion } from '@strive/model'
import { SelfReflectReplaceFrequencyPipe } from '../../pipes/frequency.pipe'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SelfReflectReplaceFrequencyPipe
  ]
})
export class SelfReflectFormListComponent {

  inputForm = new FormControl('', { nonNullable: true })
  showInput = signal<boolean>(true)

  @Input() form?: FormArray<FormControl<string>>
  @Input() question?: SelfReflectQuestion
  @Input() set stepping(stepping: boolean | null) {
    if (stepping && this.inputForm.value) {
      this.showInput.set(false)
      this.add()
    }
  }

  patchValue(values: string[]) {
    if (!this.form) return
    this.form.clear()
    for (const value of values) {
      this.form.push(new FormControl(value, { nonNullable: true }))
    }
  }

  add() {
    if (!this.form) return
    this.form.push(new FormControl(this.inputForm.value, { nonNullable: true }))
    this.form.markAsDirty()
    this.inputForm.setValue('')
  }

  blur(index: number) {
    if (!this.form) return
    const value = this.form.at(index).value
    if (!value) this.removeValue(index)
  }

  removeValue(index: number) {
    if (!this.form) return
    this.form.removeAt(index)
    this.form.markAsDirty()
  }
}