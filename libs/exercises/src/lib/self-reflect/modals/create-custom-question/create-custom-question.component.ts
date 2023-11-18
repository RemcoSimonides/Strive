import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { IonicModule, ModalController } from '@ionic/angular'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { SelfReflectCategory, SelfReflectFrequencyWithNever, SelfReflectTense, SelfReflectType, createSelfReflectQuestion } from '@strive/model'
import { createRandomString } from '@strive/utils/helpers'
import { SelfReflectSettingsService } from '../../self-reflect.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-custom-question',
  templateUrl: './create-custom-question.component.html',
  styleUrls: ['./create-custom-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModalComponent
  ]
})
export class SelfReflectCustomQuestionModalComponent extends ModalDirective {

  form = new FormGroup({
    question: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<SelfReflectType>('formlist', { nonNullable: true, validators: [Validators.required] }),
    frequency: new FormControl<SelfReflectFrequencyWithNever | ''>('', { nonNullable: true , validators: [Validators.required]}),
    tense: new FormControl<SelfReflectTense | ''>('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<SelfReflectCategory | ''>('', { nonNullable: true, validators: [Validators.required] })
  })

  constructor(
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private settingsService: SelfReflectSettingsService
  ) {
    super(location, modalCtrl)
  }

  async submit() {
    this.form.markAllAsTouched()
    if (this.form.invalid) return
    if (!this.auth.uid) return

    const { category, frequency, question, tense, type} = this.form.value
    if (!category || !frequency || !question || !tense || !type ) return

    const selfReflectQuestion = createSelfReflectQuestion({
      key: createRandomString(16),
      category,
      frequency,
      question,
      tense,
      type
    })

    const settings = await this.settingsService.getSettings(this.auth.uid)
    if (!settings) return

    settings.questions.push(selfReflectQuestion)
    await this.settingsService.save(this.auth.uid, settings)

    this.dismiss(selfReflectQuestion)
  }
}