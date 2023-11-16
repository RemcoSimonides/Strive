import { ChangeDetectionStrategy, Component, signal } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { orderBy } from 'firebase/firestore'
import { combineLatest, firstValueFrom, map, of, shareReplay, switchMap } from 'rxjs'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { SelfReflectCategory, SelfReflectEntry, SelfReflectFrequency, SelfReflectQuestion, SelfReflectSettings, createSelfReflectEntry, createSelfReflectQuestion, createSelfReflectSettings, selfReflectKeys, selfReflectSettings } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { SelfReflectEntryService, SelfReflectSettingsService } from '@strive/exercises/self-reflect/self-reflect.service'
import { SelfReflectEntryComponent } from '@strive/exercises/self-reflect/components/entry/self-reflect-entry.component'
import { addMonths, addQuarters, addWeeks, addYears, differenceInDays, getMonth, getQuarter, getWeek, startOfDay, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { getSelfReflectId, getSelfReflectYear, startOfSelfReflectYear, } from '@strive/exercises/self-reflect/utils/date.utils'
import { SelfReflectCustomQuestionModalComponent } from '@strive/exercises/self-reflect/modals/upsert-custom-question/upsert-custom-question.component'
import { SelfReflectQuestionModalComponent } from '@strive/exercises/self-reflect/modals/upsert-question/upsert-question.component'

function getEntryStatus(entries: SelfReflectEntry[], settings: SelfReflectSettings | undefined, frequency: SelfReflectFrequency) {
  if (!settings) return { disabled: true, message: 'No settings found' }
  const questions = settings.questions.filter(question => question.frequency === frequency)

  if (questions.length === 0) return { disabled: true, message: 'No questions activated - change in settings' }
  if (entries.length === 0) return { disabled: false, message: `Ready for a new entry!`}

  const today = startOfDay(new Date())
  const lastEntry = entries[0]

  const getFrequency = {
    weekly: getWeek,
    monthly: getMonth,
    quarterly: getQuarter,
    yearly: (date: Date) => getSelfReflectYear(date, 12, 24)
  }
  const frequencyDeltaSinceLastEntry = getFrequency[frequency](today) - getFrequency[frequency](lastEntry.createdAt)
  if (frequencyDeltaSinceLastEntry > 0) return { disabled: false, message: `Ready for a new entry!`}

  const startOfFrequency = {
    weekly: startOfWeek,
    monthly: startOfMonth,
    quarterly: startOfQuarter,
    yearly: (date: Date) => startOfSelfReflectYear(date, 12, 24)
  }

  const addFrequency = {
    weekly: (date: Date) => addWeeks(date, 1),
    monthly: (date: Date) => addMonths(date, 1),
    quarterly: (date: Date) => addQuarters(date, 1),
    yearly: (date: Date) => addYears(date, 1)
  }

  const startOfNextFrequency = startOfFrequency[frequency](addFrequency[frequency](lastEntry.createdAt))
  const daysLeft = differenceInDays(startOfNextFrequency, today)
  return { disabled: true, message: `You can't add a new entry yet. You can add a new entry in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
}

@Component({
  selector: 'journal-self-reflect',
  templateUrl: './self-reflect.component.html',
  styleUrls: ['./self-reflect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelfReflectComponent {

  isMobile$ = this.screensize.isMobile$
  uid$ = this.auth.uid$
  loadingQuestions = signal<boolean>(true)

  dbEntries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => entries.length ? this.service.decrypt(entries) : of([])),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.settingsService.getSettings$(profile.uid) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  weekly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.frequency === 'weekly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'weekly'))
  )

  monthly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.frequency === 'monthly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'monthly'))
  )

  quarterly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.frequency === 'quarterly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'quarterly'))
  )

  yearly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.frequency === 'yearly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'yearly'))
  )

  customQuestions$ = this.settings$.pipe(
    map(settings => settings ? settings.questions.filter(({ key }) => !selfReflectKeys.includes(key)) : []),
  )

  categories: Record<SelfReflectCategory, string> = {
    intro: '',
    previousIntention: '',
    career: 'Career',
    creative: 'Creative',
    education: 'Education',
    environment: 'Environment',
    financial: 'Financial',
    healthAndFitness: 'Health and Fitness',
    personalDevelopment: 'Personal Development',
    relationships: 'Relationships',
    spiritual: 'Spiritual',
    travelAndAdventures: 'Travel and Adventures',
    other: 'Other',
    dearFutureSelf: 'Dear Future Self',
    wheelOfLife: 'Wheel of Life',
    gratitude: 'Gratitude',
    prioritizeGoals: 'Prioritize Goals',
    outro: ''
  }

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private screensize: ScreensizeService,
    private service: SelfReflectEntryService,
    private settingsService: SelfReflectSettingsService,
    private seo: SeoService,
  ) {
    this.seo.generateTags({
      title: 'Self Reflect - Strive Journal',
      description: 'Get a grasp on life by looking back and planning ahead',
    })
  }

  async addEntry(frequency: SelfReflectFrequency) {
    const [weekly, monthly, quarterly, yearly] = await Promise.all([
      firstValueFrom(this.weekly$),
      firstValueFrom(this.monthly$),
      firstValueFrom(this.quarterly$),
      firstValueFrom(this.yearly$),
    ])

    const todos = []
    if (!weekly.disabled) todos.push('weekly')
    if (!monthly.disabled) todos.push('monthly')
    if (!quarterly.disabled) todos.push('quarterly')
    if (!yearly.disabled) todos.push('yearly')

    const id = getSelfReflectId(frequency)
    const entry = createSelfReflectEntry({ id, frequency })

    const modal = await this.modalCtrl.create({
      component: SelfReflectEntryComponent,
      componentProps: { entry, todos }
    })
    modal.onDidDismiss().then(({ data: nextFrequency }) => {
      if (nextFrequency) this.addEntry(nextFrequency)
    })
    modal.present()
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  async openQuestion(question: SelfReflectQuestion, entries: SelfReflectEntry[]) {
    const settings = await firstValueFrom(this.settings$)

    this.modalCtrl.create({
      component: SelfReflectQuestionModalComponent,
      componentProps: { question, settings, entries }
    }).then(modal => modal.present())
  }

  async openCustomQuestion(question?: SelfReflectQuestion) {
    const modal = await this.modalCtrl.create({
      component: SelfReflectCustomQuestionModalComponent,
      componentProps: { question }
    })
    modal.onDidDismiss().then(async ({ data }) => {
      if (!data) return
      const question = createSelfReflectQuestion(data)
      const settings = await firstValueFrom(this.settings$)
      if (!settings) throw new Error(`Couldn't get settings`)
      const uid = this.auth.uid
      if (!uid) throw new Error(`Can't save question without uid`)

      if (data.question === 'delete') {
        settings.questions = settings.questions.filter(({ key }) => key !== question.key)
      } else {
        const index = settings.questions.findIndex(({ key }) => key === question.key)
        if (index > -1) {
          settings.questions[index] = question
        } else {
          settings.questions.push(question)
        }
      }

      this.settingsService.save(uid, settings)
    })
    modal.present()
  }
}