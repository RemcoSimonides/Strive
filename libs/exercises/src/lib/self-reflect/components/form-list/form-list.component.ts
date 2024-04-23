import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core'
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms'
import { SelfReflectQuestion } from '@strive/model'
import { SelfReflectReplaceFrequencyPipe } from '../../pipes/frequency.pipe'
import { addIcons } from 'ionicons'
import { closeOutline, addOutline } from 'ionicons/icons'
import { IonList, IonItem, IonTextarea, IonIcon, IonButton } from '@ionic/angular/standalone'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SelfReflectReplaceFrequencyPipe,
    IonList,
    IonItem,
    IonTextarea,
    IonIcon,
    IonButton
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

  constructor() {
    addIcons({ closeOutline, addOutline });
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
    if (!this.inputForm.value) return
    this.form.push(new FormControl(this.inputForm.value, { nonNullable: true }))
    this.form.markAsDirty()
    this.inputForm.setValue('')
  }

  blur(event: CustomEvent, index: number) {
    if (!this.form) return
    if (event.defaultPrevented) return // element removed
    const value = this.form.at(index).value
    if (!value) this.removeValue(index)
  }

  removeValue(index: number) {
    if (!this.form) return
    this.form.removeAt(index)
    this.form.markAsDirty()
  }
}
