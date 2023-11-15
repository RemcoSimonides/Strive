import { ChangeDetectionStrategy, Component, Input, OnInit, computed, signal } from '@angular/core'
import { Location } from '@angular/common'
import { FormArray, FormControl } from '@angular/forms'
import { AlertController, ModalController } from '@ionic/angular'

import { BehaviorSubject, firstValueFrom, map, of, shareReplay, switchMap} from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectEntry, SelfReflectFrequency, EntryStep, createSelfReflectEntry, createSelfReflectQuestion, getFrequency } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import { SelfReflectForm } from '../../forms/self-reflect.form'
import { SelfReflectEntryService, SelfReflectSettingsService } from '../../self-reflect.service'
import { WheelOfLifeForm } from '../wheel-of-life/wheel-of-life.form'

function getTitle({ category, tense }: EntryStep): string {
  switch (category) {
    case 'intro':
    case 'outro':
      return ''
    case 'gratitude':
      return 'Gratitude'
    case 'dearFutureSelf':
      return 'Dear Future Self'
    case 'prioritizeGoals':
      return 'Order goals by priority'
    case 'wheelOfLife':
      return 'How do you feel now?'
    default:
      return tense === 'past'
        ? 'The past {frequency}'
        : tense === 'present'
          ? 'The now'
          : 'The upcoming {frequency}'
  }
}

@Component({
  selector: '[entry] strive-self-reflect-entry',
  templateUrl: './self-reflect-entry.component.html',
  styleUrls: ['./self-reflect-entry.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfReflectEntryComponent extends ModalDirective implements OnInit {

  animatingSection = signal<undefined | 'visible' | 'invisible'>('visible')
  title = signal<string>('Get Ready')
  step = signal<EntryStep>({ category: 'intro', tense: '' })
  finishedLoading = signal<boolean>(false)

  form = new SelfReflectForm()

  steps = signal<EntryStep[]>([])
  stepIndex = signal<number>(0)
  stepping$ = new BehaviorSubject<boolean>(false)
  progress = computed(() => this.stepIndex() / (this.steps().length - 1))

  private profile$ = this.auth.profile$.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  )

  previousEntry$ = this.profile$.pipe(
    switchMap(profile => profile ? this.service.getPreviousEntry(profile.uid, this.frequency) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  private questions$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.settingsService.getSettings$(profile.uid) : of(undefined)),
    map(settings => settings ? settings.questions : []),
    map(questions => questions.filter(({ frequency }) => frequency === this.frequency)),
    map(questions => questions.map(question => createSelfReflectQuestion(question))),
  )

  @Input() entry = createSelfReflectEntry()
  @Input() todos: SelfReflectFrequency[] = []

  get frequency() { return this.entry.frequency }

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private service: SelfReflectEntryService,
    private settingsService: SelfReflectSettingsService
  ) {
    super(location, modalCtrl)
  }

  async ngOnInit() {
    const questions = this.entry.config.length
      ? this.entry.config
      : await firstValueFrom(this.questions$)

    let previousEntry: SelfReflectEntry | undefined = undefined
    if (!this.entry.config.length) {
      this.entry.config = questions
      previousEntry = await firstValueFrom(this.previousEntry$)
    }

    const activatedSteps: EntryStep[] = [{ category: 'intro', tense: '' }]
    if (previousEntry) activatedSteps.push({ category: 'previousIntention', tense: '' })

    const past = questions.filter(({ tense }) => tense === 'past')
    const pastSteps = past.map(({ category, tense }) => ({ category, tense }))
    activatedSteps.push(...pastSteps)

    const present = questions.filter(({ tense }) => tense === 'present')
    const presentSteps = present.map(({ category, tense }) => ({ category, tense }))
    activatedSteps.push(...presentSteps)

    const future = questions.filter(({ tense }) => tense === 'future')
    const futureSteps = future.map(({ category, tense }) => ({ category, tense }))
    activatedSteps.push(...futureSteps)
    activatedSteps.push({ category: 'outro', tense: '' })

    const uniqueSteps = activatedSteps.reduce((acc, step) => {
      if (acc.length === 0) return [step]
      const res = acc.find(s => s.category === step.category && s.tense === step.tense)
      return res ? acc : [...acc, step]
    }, [] as EntryStep[])
    this.steps.set(uniqueSteps)

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
    this.finishedLoading.set(true)
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

    this.step.set(nextStep)

    const title = getTitle(nextStep).replace('{frequency}', getFrequency(this.frequency))
    this.title.set(title)

    this.stepIndex.set(nextIndex)


    this.animatingSection.set('visible')
    this.stepping$.next(false)
  }

  async save() {
    if (!this.auth.uid) return

    const entry = createSelfReflectEntry({
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
          subHeader: 'Are you sure you want to close this reflection?',
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