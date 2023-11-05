import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { FormArray, FormControl } from '@angular/forms'
import { AlertController, ModalController } from '@ionic/angular'

import { BehaviorSubject, combineLatest, firstValueFrom, map, of, shareReplay, switchMap, tap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeInterval, AssessLifeTense, Step, createAssessLifeEntry, getInterval } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { AssessLifeForm } from '../../forms/assess-life.form'
import { AssessLifeEntryService, AssessLifeSettingsService } from '../../assess-life.service'
import { WheelOfLifeForm } from '../wheel-of-life/wheel-of-life.form'

interface EntryStep {
  step: Step
  tense: AssessLifeTense | ''
}

function getTitle({ step, tense }: EntryStep): string {
  switch (step) {
    case 'intro':
    case 'outro':
      return ''
    case 'dearFutureSelf':
      return 'Dear Future Self'
    case 'forgive':
      return 'Forgive and let go'
    case 'imagine':
      return 'Imagine'
    case 'prioritizeGoals':
      return 'Order goals by priority'
    case 'wheelOfLife':
      return 'How do you feel now?'
    default:
      return tense === 'past' ? 'The past {interval}' : 'The upcoming {interval}'
  }
}

@Component({
  selector: '[entry] strive-assess-life-entry',
  templateUrl: './assess-life-entry.component.html',
  styleUrls: ['./assess-life-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessLifeEntryComponent extends ModalDirective implements OnInit {

  animatingSection = signal<undefined | 'visible' | 'invisible'>('visible')
  title = signal<string>('Get Ready')
  step = signal<Step>('intro')

  form = new AssessLifeForm()

  steps = signal<EntryStep[]>([])
  stepIndex = signal<number>(0)
  stepping$ = new BehaviorSubject<boolean>(false)
  progress = computed(() => this.stepIndex() / (this.steps().length - 1))

  private profile$ = this.auth.profile$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  )

  previousEntry$ = this.profile$.pipe(
    switchMap(profile => profile ? this.service.getPreviousEntry(profile.uid, this.interval) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile
      ? combineLatest([
          this.settingsService.getSettings$(profile.uid),
          this.previousEntry$
        ])
      : of([])),
    shareReplay({ bufferSize: 1, refCount: true }),
    tap(([settings, previousEntry]) => {
      if (settings) {
        const questions = settings.questions.filter(({ interval }) => interval === this.interval)
        const activatedSteps: EntryStep[] = [{ step: 'intro', tense: '' }]
        if (previousEntry) activatedSteps.push({ step: 'previousIntention', tense: '' })

        const past = questions.filter(({ tense }) => tense === 'past')
        const pastSteps = past.map(({ step, tense }) => ({ step, tense }))
        activatedSteps.push(...pastSteps)

        const future = questions.filter(({ tense }) => tense === 'future')
        const futureSteps = future.map(({ step, tense }) => ({ step, tense }))
        activatedSteps.push(...futureSteps)
        activatedSteps.push({ step: 'outro', tense: '' })

        const uniqueSteps = activatedSteps.reduce((acc, step) => {
          if (acc.length === 0) return [step]
          const res = acc.find(s => s.step === step.step && s.tense === step.tense)
          return res ? acc : [...acc, step]
        }, [] as EntryStep[])

        this.steps.set(uniqueSteps)
      }
    }),
    map(([settings]) => settings)
  )

  @Input() entry = createAssessLifeEntry()
  @Input() todos: AssessLifeInterval[] = []

  questions$ = this.settings$.pipe(
    map(settings => settings ? settings.questions : []),
    map(questions => questions.filter(question => question.interval === this.interval))
  )

  get interval() { return this.entry.interval }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private service: AssessLifeEntryService,
    private settingsService: AssessLifeSettingsService
  ) {
    super(location, modalCtrl)
  }

  async ngOnInit() {
    const questions = await firstValueFrom(this.questions$)

    for (const question of questions) {
      if (question.type === 'textarea') {
        this.form.addControl(question.key, new FormControl<string>('', { nonNullable: true }))
      } else if (question.type === 'formlist') {
        this.form.addControl(question.key, new FormArray<FormControl<string>>([]))
      } else if (question.type === 'prioritizeGoals') {
        this.form.addControl(question.key, new FormArray<FormControl<string>>([]))
      } else if (question.type === 'wheelOfLife') {
        this.form.addControl(question.key, new WheelOfLifeForm())
      } else {
        throw new Error(`Unknown question type: ${question.type}`)
      }
    }
    this.form.patchValue(this.entry, { emitEvent: false })
  }

  async doStep(direction: 'next' | 'previous') {
    this.stepping$.next(true) // input value is being added to the form
    const steps = this.steps()

    if (direction === 'next' && this.stepIndex() === steps.length - 1) {
      this.dismiss()
      return
    }

    this.animatingSection.set('invisible')
    await delay(1000)

    if (direction === 'next' && this.stepIndex() === steps.length - 2) {
      // saving after delay to first add input form to form
      this.save()
    }

    const delta = direction === 'next' ? 1 : -1

    const nextIndex = this.stepIndex() + delta
    const nextStep = steps[nextIndex]

    this.step.set(nextStep.step)

    const title = getTitle(nextStep).replace('{interval}', getInterval(this.interval))
    this.title.set(title)

    this.stepIndex.set(nextIndex)


    this.animatingSection.set('visible')
    this.stepping$.next(false)
  }

  async save() {
    if (!this.auth.uid) return

    const entry = createAssessLifeEntry({
      ...this.entry,
      ...this.form.getRawValue()
    })

    await this.service.save(entry)
    this.form.markAsPristine()
  }

  override beforeDismiss(): boolean | Promise<boolean> {
    return new Promise((resolve) => {
      if (this.form.dirty) {
        this.alertCtrl.create({
          subHeader: 'Are you sure you want to close this assessment?',
          message: 'Your answers will not be saved.',
          buttons: [
            {
              text: 'Yes',
              handler: () => resolve(true)
            },
            {
              text: 'No',
              role: 'cancel',
              handler: () => resolve(false)
            }
          ]
        }).then(alert => alert.present())
      } else {
        resolve(true)
      }
    })
  }
}