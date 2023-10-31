import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { FormArray, FormControl } from '@angular/forms'
import { AlertController, ModalController } from '@ionic/angular'

import { BehaviorSubject, combineLatest, firstValueFrom, map, of, shareReplay, switchMap, tap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeInterval, Setting, Step, createAssessLifeEntry, getInterval } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { AssessLifeForm } from '../../forms/assess-life.form'
import { AssessLifeEntryService, AssessLifeSettingsService } from '../../assess-life.service'
import { WheelOfLifeForm } from '../wheel-of-life/wheel-of-life.form'

const allSteps: {
  setting: Setting | undefined,
  title: string,
  step: Step
}[] = [
  {
    setting: undefined,
    title: '',
    step: 'intro'
  },
  {
    setting: undefined,
    title: 'Last {interval} you wrote...',
    step: 'previousIntention'
  },
  {
    setting: 'timeManagement',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'pride',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'gratitude',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'learn',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'environment',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'explore',
    title: 'The past {interval}',
    step: 'listQuestionsPast'
  },
  {
    setting: 'wheelOfLife',
    title: 'How do you feel now?',
    step: 'wheelOfLife'
  },
  {
    setting: 'forgive',
    title: 'Forgive and let go',
    step: 'forgive'
  },
  {
    setting: 'timeManagement',
    title: 'The upcoming {interval}',
    step: 'listQuestionsFuture'
  },
  {
    setting: 'learn',
    title: 'The upcoming {interval}',
    step: 'listQuestionsFuture'
  },
  {
    setting: 'environment',
    title: 'The upcoming {interval}',
    step: 'listQuestionsFuture'
  },
  {
    setting: 'explore',
    title: 'The upcoming {interval}',
    step: 'listQuestionsFuture'
  },
  {
    setting: 'prioritizeGoals',
    title: 'Order goals by priority',
    step: 'prioritizeGoals'
  },
  {
    setting: 'imagine',
    title: 'Imagine',
    step: 'imagine'
  },
  {
    setting: 'dearFutureSelf',
    title: 'Dear Future Self',
    step: 'dearFutureSelf'
  },
  {
    setting: undefined,
    title: '',
    step: 'outro'
  }
]

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

  steps = signal<{ step: Step, title: string }[]>([])
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
        const activatedSteps = allSteps.filter(step => {
          if (step.step === 'previousIntention') return !!previousEntry
          if (step.setting === undefined) return true

          const questions = settings.questions.filter(question => question.step === step.step)
          return questions.some(question => question.interval === this.interval)
        })
        const squashedSteps = activatedSteps.reduce((acc, step) => {
          if (acc.length === 0) return [step]
          const lastStep = acc[acc.length - 1]
          return lastStep.step === step.step ? acc : [...acc, step]
        }, [] as typeof activatedSteps)

        this.steps.set(squashedSteps)
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

    const title = nextStep.title.replace('{interval}', getInterval(this.interval))
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