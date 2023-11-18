import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit, signal } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { AlertController, IonicModule, ModalController } from '@ionic/angular'
import { orderBy } from 'firebase/firestore'
import { debounceTime, of, switchMap } from 'rxjs'

import { closestIndexTo, eachDayOfInterval, endOfDay, isBefore, startOfDay } from 'date-fns'
import format from 'date-fns/format'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { WheelOfLifeResultsModule } from '../../../wheel-of-life/components/results/results.module'
import { PrioritizeGoalsComponent } from '../../components/prioritize-goals/prioritize-goals.component'

import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectSettingsService } from '../../self-reflect.service'
import { WheelOfLifeEntryService } from '@strive/exercises/wheel-of-life/wheel-of-life.service'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { SelfReflectQuestionForm } from '../../forms/self-reflect-settings.form'
import { SelfReflectReplaceFrequencyPipe } from '../../pipes/frequency.pipe'
import { SelfReflectEntry, SelfReflectFrequencyWithNever, SelfReflectQuestion, createSelfReflectQuestion, selfReflectQuestions } from '@strive/model'


@Component({
  standalone: true,
  selector: 'strive-self-reflect-question',
  templateUrl: './upsert-question.component.html',
  styleUrls: ['./upsert-question.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    HeaderModalComponent,
    SelfReflectReplaceFrequencyPipe,
    PrioritizeGoalsComponent,
    WheelOfLifeResultsModule
  ]
})
export class SelfReflectQuestionModalComponent extends ModalDirective implements OnInit {

  form = new SelfReflectQuestionForm()
  isCustomQuestion = signal<boolean>(false)

  rangeForm = new FormControl()
  range: { date: Date, entry: SelfReflectEntry }[] = []
  prioritizeGoalEntry = signal<SelfReflectEntry | undefined>(undefined)

  wheelOfLifeEntries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.wheelOfLifeEntryService.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => entries.length ? this.wheelOfLifeEntryService.decrypt(entries) : of([]))
  )

  @Input() question?: SelfReflectQuestion
  @Input() entries: SelfReflectEntry[] = []

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private settingsService: SelfReflectSettingsService,
    private wheelOfLifeEntryService: WheelOfLifeEntryService
  ) {
    super(location, modalCtrl)

    this.rangeForm.valueChanges.subscribe(index => {
      if (!this.range[index]) return
      this.prioritizeGoalEntry.set(this.range[index].entry)
    })
  }

  ngOnInit() {
    if (!this.question) return

    const keys = selfReflectQuestions.map(({ key }) => key)
    const included = keys.includes(this.question.key)
    this.isCustomQuestion.set(!included)

    this.form.patchValue({ ...this.question })

    this.form.valueChanges.pipe(debounceTime(500)).subscribe(async value => {
      if (this.form.invalid) return
      if (!this.auth.uid) return

      const question = createSelfReflectQuestion(value)
      const settings = await this.settingsService.getSettings(this.auth.uid)
      if (!settings) return

      const index = settings.questions.findIndex(q => q.key === question.key)
      if (index === -1) return

      settings.questions[index] = question
      await this.settingsService.save(this.auth.uid, settings)
    })

    if (this.question.key === 'prioritizeGoals') this.initPrioritizeGoals()
  }

  /**
   * Create a timeline since first entry
   */
  initPrioritizeGoals() {
    if (!this.entries.length) return
    const first = this.entries.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1)[0]
    const start = startOfDay(first.createdAt)
    const end = new Date()
    this.range = eachDayOfInterval({ start, end })
      .sort((a, b) => a > b ? -1 : 1)
      .map(date => {
        const earlier = this.entries.filter(entry => isBefore(entry.createdAt, endOfDay(date)))
        const index = closestIndexTo(date, earlier.map(entry => entry.createdAt))

        if (index === undefined || index === -1) throw new Error('No entry found')
        const entry = earlier[index]

        return { date, entry }
      })
    this.rangeForm.setValue(0)
  }

  pinFormatter() {
    return (value: number) => {
      if (!this.question) return ''
      if (!this.range.length) return ''
      const date = this.range[value].date
      const formats: Record<SelfReflectFrequencyWithNever, string> = {
        never: 'dd MMM yyyy',
        weekly: 'dd MMM yyyy',
        monthly: 'MMM yyyy',
        quarterly: 'Qo yyyy',
        yearly: 'yyyy'
      }
      return format(date, formats[this.question.frequency])
    }
  }

  delete() {
    this.alertCtrl.create({
      subHeader: 'Are you sure you want to delete this question?',
      message: 'This action is irreversible. Instead you could set frequency to "Never"',
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!this.auth.uid) return

            const settings = await this.settingsService.getSettings(this.auth.uid)
            if (!settings) return

            const index = settings.questions.findIndex(q => q.key === this.question?.key)
            if (index === -1) return

            settings.questions.splice(index, 1)
            await this.settingsService.save(this.auth.uid, settings)

            this.dismiss()
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    }).then(alert => alert.present())
  }
}