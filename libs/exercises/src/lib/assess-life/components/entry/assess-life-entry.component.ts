import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'

import { BehaviorSubject } from 'rxjs'

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
  | 'timeManagementPast'
  | 'stress'
  | 'wheelOfLife'
  | 'timeManagementFuture'
  | 'prioritizeGoals'
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
    title: 'Your previous intentions',
    section: 'previousIntention'
  },
  {
    setting: 'timeManagement',
    title: 'The past {interval}',
    section: 'timeManagementPast'
  },
  {
    setting: 'stress',
    title: 'The past {interval}',
    section: 'stress'
  },
  {
    setting: 'wheelOfLife',
    title: 'How do you feel now?',
    section: 'wheelOfLife'
  },
  {
    setting: 'timeManagement',
    title: 'The upcoming {interval}',
    section: 'timeManagementFuture'
  },
  {
    setting: 'prioritizeGoals',
    title: 'Order goals by priority',
    section: 'prioritizeGoals'
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
  loading = signal<boolean>(true)

  @Input() interval?: AssessLifeInterval
  @Input() entry?: AssessLifeEntry
  @Input() previousEntry?: AssessLifeEntry

  constructor(
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private personalService: PersonalService,
    private service: AssessLifeEntryService,
    private settingsService: AssessLifeSettingsService
  ) {
    super(location, modalCtrl)
  }

  async ngOnInit() {
    if (!this.interval) return

    if (this.entry) {
      this.form.patchValue(this.entry, { emitEvent: false })
    }

    const uid = await this.auth.getUID()
    const settings = await this.settingsService.getSettings(uid)
    if (settings) {
      this.steps.set(allSteps.filter(step => {
        if (step.setting && settings[step.setting] !== this.interval) return false
        if (step.section === 'previousIntention' && !this.previousEntry) return false
        return true
      }))
    }
    this.loading.set(false)
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

    entry.timeManagement.past.entries = entry.timeManagement.past.entries.map(v => AES.encrypt(v, key).toString())
    entry.timeManagement.futureMoreTime.entries = entry.timeManagement.futureMoreTime.entries.map(v => AES.encrypt(v, key).toString())
    entry.timeManagement.futureLessTime.entries = entry.timeManagement.futureLessTime.entries.map(v => AES.encrypt(v, key).toString())

    entry.stress.entries = entry.stress.entries.map(v => AES.encrypt(v, key).toString())

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
  }
}