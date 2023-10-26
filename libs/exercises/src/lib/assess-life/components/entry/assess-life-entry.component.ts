import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { AlertController, ModalController } from '@ionic/angular'

import { BehaviorSubject, combineLatest, map, of, shareReplay, switchMap, tap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { delay } from '@strive/utils/helpers'
import { AssessLifeInterval, AssessLifeSettings, createAssessLifeEntry, getInterval } from '@strive/model'

import { AssessLifeForm } from '../../forms/assess-life.form'
import { AssessLifeEntryService, AssessLifeSettingsService } from '../../assess-life.service'

type Section = 'intro'
  | 'previousIntention'
  | 'listQuestionsPast'
  | 'wheelOfLife'
  | 'forgive'
  | 'listQuestionsFuture'
  | 'prioritizeGoals'
  | 'imagine'
  | 'dearFutureSelf'
  | 'outro'

const allSteps: {
  setting: keyof Omit<AssessLifeSettings, "id" | "createdAt" | "updatedAt"> | undefined,
  title: string,
  section: Section}[] = [
  {
    setting: undefined,
    title: '',
    section: 'intro'
  },
  {
    setting: undefined,
    title: 'Last {interval} you wrote...',
    section: 'previousIntention'
  },
  {
    setting: 'timeManagement',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'proud',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'gratitude',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'learn',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'environment',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'explore',
    title: 'The past {interval}',
    section: 'listQuestionsPast'
  },
  {
    setting: 'wheelOfLife',
    title: 'How do you feel now?',
    section: 'wheelOfLife'
  },
  {
    setting: 'forgive',
    title: 'Forgive and let go',
    section: 'forgive'
  },
  {
    setting: 'timeManagement',
    title: 'The upcoming {interval}',
    section: 'listQuestionsFuture'
  },
  {
    setting: 'learn',
    title: 'The upcoming {interval}',
    section: 'listQuestionsFuture'
  },
  {
    setting: 'environment',
    title: 'The upcoming {interval}',
    section: 'listQuestionsFuture'
  },
  {
    setting: 'explore',
    title: 'The upcoming {interval}',
    section: 'listQuestionsFuture'
  },
  {
    setting: 'prioritizeGoals',
    title: 'Order goals by priority',
    section: 'prioritizeGoals'
  },
  {
    setting: 'imagine',
    title: 'Imagine',
    section: 'imagine'
  },
  {
    setting: 'dearFutureSelf',
    title: 'Dear Future Self',
    section: 'dearFutureSelf'
  },
  {
    setting: undefined,
    title: '',
    section: 'outro'
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
  section = signal<Section>('intro')

  form = new AssessLifeForm()

  steps = signal<{ section: Section, title: string }[]>([])
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
          if (step.setting && settings[step.setting] !== this.interval) return false
          if (step.section === 'previousIntention' && !previousEntry) return false
          return true
        })
        const squashedSteps = activatedSteps.reduce((acc, step) => {
          if (acc.length === 0) return [step]
          const lastStep = acc[acc.length - 1]
          return lastStep.section === step.section ? acc : [...acc, step]
        }, [] as typeof activatedSteps)

        this.steps.set(squashedSteps)
      }
    }),
    map(([settings]) => settings)
  )

  @Input() entry = createAssessLifeEntry()
  @Input() todos: AssessLifeInterval[] = []

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

  ngOnInit() {
    this.form.patchValue(this.entry, { emitEvent: false })
  }

  async step(direction: 'next' | 'previous') {
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

    this.section.set(nextStep.section)

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