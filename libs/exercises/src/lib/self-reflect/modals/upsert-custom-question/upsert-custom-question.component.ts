import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { AlertController, IonicModule, ModalController } from '@ionic/angular'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { SelfReflectCategory, SelfReflectIntervalWithNever, SelfReflectQuestion, SelfReflectTense, SelfReflectType, createSelfReflectQuestion } from '@strive/model'
import { createRandomString } from '@strive/utils/helpers'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-custom-question',
  templateUrl: './upsert-custom-question.component.html',
  styleUrls: ['./upsert-custom-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModalComponent
  ]
})
export class SelfReflectCustomQuestionModalComponent extends ModalDirective implements OnInit {

  form = new FormGroup({
    question: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<SelfReflectType | ''>('', { nonNullable: true, validators: [Validators.required] }),
    interval: new FormControl<SelfReflectIntervalWithNever | ''>('', { nonNullable: true , validators: [Validators.required]}),
    tense: new FormControl<SelfReflectTense | ''>('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<SelfReflectCategory | ''>('', { nonNullable: true, validators: [Validators.required] })
  })

  @Input() question?: SelfReflectQuestion

  constructor(
    private alertCtrl: AlertController,
    location: Location,
    modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    if (!this.question) return
    this.form.patchValue({ ...this.question, category: this.question.step as SelfReflectCategory })
  }

  submit() {
    this.form.markAllAsTouched()
    if (this.form.invalid) return

    const selfReflectQuestion = createSelfReflectQuestion(this.question)
    const { category, interval, question, tense, type} = this.form.value
    if (!category || !interval || !question || !tense || !type ) return

    selfReflectQuestion.step = category
    selfReflectQuestion.interval = interval
    selfReflectQuestion.question = question
    selfReflectQuestion.tense = tense
    selfReflectQuestion.type = type

    if (!selfReflectQuestion.key) {
      selfReflectQuestion.key = createRandomString(16)
    }

    this.dismiss(selfReflectQuestion)
  }

  delete() {
    this.alertCtrl.create({
      subHeader: 'Are you sure you want to delete this question?',
      message: 'This action is irreversible. Instead you could set frequency to "Never"',
      buttons: [
        {
          text: 'Yes',
          handler: () => this.dismiss({ ...this.question, question: 'delete' })
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
}