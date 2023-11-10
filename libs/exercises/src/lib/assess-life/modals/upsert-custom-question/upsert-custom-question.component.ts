import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { AlertController, IonicModule, ModalController } from '@ionic/angular'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { AssessLifeCategory, AssessLifeIntervalWithNever, AssessLifeQuestion, AssessLifeTense, AssessLifeType, createAssessLifeQuestion } from '@strive/model'
import { createRandomString } from '@strive/utils/helpers'

@Component({
  standalone: true,
  selector: 'strive-assess-life-custom-question',
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
export class AssessLifeCustomQuestionModalComponent extends ModalDirective implements OnInit {

  form = new FormGroup({
    question: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<AssessLifeType | ''>('', { nonNullable: true, validators: [Validators.required] }),
    interval: new FormControl<AssessLifeIntervalWithNever | ''>('', { nonNullable: true , validators: [Validators.required]}),
    tense: new FormControl<AssessLifeTense | ''>('', { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<AssessLifeCategory | ''>('', { nonNullable: true, validators: [Validators.required] })
  })

  @Input() question?: AssessLifeQuestion

  constructor(
    private alertCtrl: AlertController,
    location: Location,
    modalCtrl: ModalController
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    if (!this.question) return
    this.form.patchValue({ ...this.question, category: this.question.step as AssessLifeCategory })
  }

  submit() {
    this.form.markAllAsTouched()
    if (this.form.invalid) return

    const assessLifeQuestion = createAssessLifeQuestion(this.question)
    const { category, interval, question, tense, type} = this.form.value
    if (!category || !interval || !question || !tense || !type ) return

    assessLifeQuestion.step = category
    assessLifeQuestion.interval = interval
    assessLifeQuestion.question = question
    assessLifeQuestion.tense = tense
    assessLifeQuestion.type = type

    if (!assessLifeQuestion.key) {
      assessLifeQuestion.key = createRandomString(16)
    }

    this.dismiss(assessLifeQuestion)
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