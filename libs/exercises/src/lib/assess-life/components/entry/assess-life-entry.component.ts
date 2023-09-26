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

type Section = 'intro' | 'past' | 'future' | 'outro'
type Subsection = 'intro' | 'timeManagementPast' | 'timeManagementFuture' | 'outro'

const titles: Record<AssessLifeInterval, { [key in Section]: string }> = {
  weekly: {
    intro: '',
    past: 'The past week',
    future: 'The upcoming week',
    outro: ''
  },
  monthly: {
    intro: '',
    past: 'The past month',
    future: 'The upcoming month',
    outro: ''
  },
  quarterly: {
    intro: '',
    past: 'The past quarter',
    future: 'The upcoming quarter',
    outro: ''
  },
  yearly: {
    intro: '',
    past: 'The past year',
    future: 'The upcoming year',
    outro: ''
  }
}

const allSteps: {
  setting: keyof Omit<AssessLifeSettings, "id" | "createdAt" | "updatedAt"> | undefined,
  section: Section,
  subsection: Subsection}[] = [
  {
    setting: undefined,
    section: 'intro',
    subsection: 'intro'
  },
  {
    setting: 'timeManagement',
    section: 'past',
    subsection: 'timeManagementPast'
  },
  {
    setting: 'timeManagement',
    section: 'future',
    subsection: 'timeManagementFuture'
  },
  {
    setting: undefined,
    section: 'outro',
    subsection: 'outro'
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
  subsection = signal<Subsection>('intro')

  form = new AssessLifeForm()

  steps = signal<{ section: Section, subsection: Subsection }[]>([])
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

    this.subsection.set(nextStep.subsection)
    this.title.set(titles[this.interval][nextStep.section])

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
    entry.timeManagement.future.entries = entry.timeManagement.future.entries.map(v => AES.encrypt(v, key).toString())

    const id = await this.service.upsert(entry, { params: { uid: this.auth.uid } })
    this.form.id.setValue(id)
  }
}