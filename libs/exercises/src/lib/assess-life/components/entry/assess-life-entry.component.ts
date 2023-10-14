import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { AlertController, ModalController } from '@ionic/angular'

import { BehaviorSubject, shareReplay, switchMap, tap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { delay } from '@strive/utils/helpers'
import { AssessLifeEntry, AssessLifeInterval, AssessLifeSettings, createAssessLifeEntry } from '@strive/model'

import { AssessLifeForm } from '../../forms/form'
import { AssessLifeEntryService, AssessLifeSettingsService } from '../../assess-life.service'
import { PersonalService } from '@strive/user/personal.service'
import { AES } from 'crypto-js'
import { getInterval } from '../../pipes/interval.pipe'

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
  selector: 'strive-assess-life-entry',
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

  settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.settingsService.getSettings$(profile.uid) : []),
    shareReplay({ bufferSize: 1, refCount: true }),
    tap(settings => {
      if (settings) {
        if (!this.interval) throw new Error('No interval provided')

        const activatedSteps = allSteps.filter(step => {
          if (step.setting && settings[step.setting] !== this.interval) return false
          if (step.section === 'previousIntention' && !this.previousEntry) return false
          return true
        })
        const squashedSteps = activatedSteps.reduce((acc, step) => {
          if (acc.length === 0) return [step]
          const lastStep = acc[acc.length - 1]
          return lastStep.section === step.section ? acc : [...acc, step]
        }, [] as typeof activatedSteps)

        this.steps.set(squashedSteps)
      }
    })
  )

  @Input() interval?: AssessLifeInterval
  @Input() entry?: AssessLifeEntry
  @Input() previousEntry?: AssessLifeEntry

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private personalService: PersonalService,
    private service: AssessLifeEntryService,
    private settingsService: AssessLifeSettingsService
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    if (this.entry) {
      this.form.patchValue(this.entry, { emitEvent: false })
    }
  }

  async step(direction: 'next' | 'previous') {
    if (!this.interval) return

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

    const key = await this.personalService.getEncryptionKey()

    const entry = createAssessLifeEntry({
      interval: this.interval,
      ...this.entry,
      ...this.form.getRawValue()
    })

    entry.dearFutureSelf.advice = AES.encrypt(entry.dearFutureSelf.advice, key).toString()
    entry.dearFutureSelf.predictions = AES.encrypt(entry.dearFutureSelf.predictions, key).toString()
    entry.dearFutureSelf.anythingElse = AES.encrypt(entry.dearFutureSelf.anythingElse, key).toString()

    entry.environment.past.entries = entry.environment.past.entries.map(v => AES.encrypt(v, key).toString())
    entry.environment.future.entries = entry.environment.future.entries.map(v => AES.encrypt(v, key).toString())

    entry.explore.past.entries = entry.explore.past.entries.map(v => AES.encrypt(v, key).toString())
    entry.explore.future.entries = entry.explore.future.entries.map(v => AES.encrypt(v, key).toString())

    entry.forgive.entries = entry.forgive.entries.map(v => AES.encrypt(v, key).toString())

    entry.gratitude.entries = entry.gratitude.entries.map(v => AES.encrypt(v, key).toString())

    entry.imagine.die = AES.encrypt(entry.imagine.die, key).toString()

    entry.learn.past.entries = entry.learn.past.entries.map(v => AES.encrypt(v, key).toString())
    entry.learn.future.entries = entry.learn.future.entries.map(v => AES.encrypt(v, key).toString())

    entry.timeManagement.past.entries = entry.timeManagement.past.entries.map(v => AES.encrypt(v, key).toString())
    entry.timeManagement.futureMoreTime.entries = entry.timeManagement.futureMoreTime.entries.map(v => AES.encrypt(v, key).toString())
    entry.timeManagement.futureLessTime.entries = entry.timeManagement.futureLessTime.entries.map(v => AES.encrypt(v, key).toString())

    entry.proud.entries = entry.proud.entries.map(v => AES.encrypt(v, key).toString())

    entry.wheelOfLife.career = AES.encrypt(entry.wheelOfLife.career.toString(), key).toString()
    entry.wheelOfLife.development = AES.encrypt(entry.wheelOfLife.development.toString(), key).toString()
    entry.wheelOfLife.environment = AES.encrypt(entry.wheelOfLife.environment.toString(), key).toString()
    entry.wheelOfLife.family = AES.encrypt(entry.wheelOfLife.family.toString(), key).toString()
    entry.wheelOfLife.friends = AES.encrypt(entry.wheelOfLife.friends.toString(), key).toString()
    entry.wheelOfLife.fun = AES.encrypt(entry.wheelOfLife.fun.toString(), key).toString()
    entry.wheelOfLife.health = AES.encrypt(entry.wheelOfLife.health.toString(), key).toString()
    entry.wheelOfLife.love = AES.encrypt(entry.wheelOfLife.love.toString(), key).toString()
    entry.wheelOfLife.money = AES.encrypt(entry.wheelOfLife.money.toString(), key).toString()
    entry.wheelOfLife.spirituality = AES.encrypt(entry.wheelOfLife.spirituality.toString(), key).toString()

    const id = await this.service.upsert(entry, { params: { uid: this.auth.uid } })
    this.form.id.setValue(id)
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