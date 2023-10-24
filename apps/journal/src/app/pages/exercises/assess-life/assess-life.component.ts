import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { orderBy } from 'firebase/firestore'
import { combineLatest, firstValueFrom, map, of, shareReplay, startWith, switchMap } from 'rxjs'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AssessLifeEntry, AssessLifeInterval, AssessLifeSettings, createAssessLifeEntry } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeEntryService, AssessLifeSettingsService } from '@strive/exercises/assess-life/assess-life.service'
import { AssessLifeEntryComponent } from '@strive/exercises/assess-life/components/entry/assess-life-entry.component'
import { addMonths, addQuarters, addWeeks, addYears, differenceInDays, getMonth, getQuarter, getWeek, startOfDay, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { getAssessLifeId, getAssessLifeYear, startOfAssessLifeYear, } from '@strive/exercises/assess-life/utils/date.utils'

function getActivatedQuestions(settings: AssessLifeSettings | undefined, interval: AssessLifeInterval) {
  if (!settings) return []
  const activated = []

  for (const [key, value] of Object.entries(settings)) {
    if (value === interval) activated.push(key)
  }
  return activated
}

function getEntryStatus(entries: AssessLifeEntry[], settings: AssessLifeSettings | undefined, interval: AssessLifeInterval) {
  const questions = getActivatedQuestions(settings, interval)

  if (questions.length === 0) return { disabled: true, message: 'No questions activated - change in settings' }
  if (entries.length === 0) return { disabled: false, message: `Ready for a new entry!`}

  const today = startOfDay(new Date())
  const lastEntry = entries[0]

  const getInterval = {
    weekly: getWeek,
    monthly: getMonth,
    quarterly: getQuarter,
    yearly: (date: Date) => getAssessLifeYear(date, 12, 24)
  }
  const intervalDeltaSinceLastEntry = getInterval[interval](today) - getInterval[interval](lastEntry.createdAt)
  if (intervalDeltaSinceLastEntry > 0) return { disabled: false, message: `Ready for a new entry!`}

  const startOfInterval = {
    weekly: startOfWeek,
    monthly: startOfMonth,
    quarterly: startOfQuarter,
    yearly: (date: Date) => startOfAssessLifeYear(date, 12, 24)
  }

  const addInterval = {
    weekly: (date: Date) => addWeeks(date, 1),
    monthly: (date: Date) => addMonths(date, 1),
    quarterly: (date: Date) => addQuarters(date, 1),
    yearly: (date: Date) => addYears(date, 1)
  }

  const startOfNextInterval = startOfInterval[interval](addInterval[interval](lastEntry.createdAt))
  const daysLeft = differenceInDays(startOfNextInterval, today)
  return { disabled: true, message: `You can't add a new entry yet. You can add a new entry in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
}

@Component({
  selector: 'journal-assess-life',
  templateUrl: './assess-life.component.html',
  styleUrls: ['./assess-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessLifeComponent {

  isMobile$ = this.screensize.isMobile$
  uid$ = this.auth.uid$

  private dbEntries$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }) : of([])),
    switchMap(entries => entries.length ? this.service.decrypt(entries) : of([]))
  )

  filterForm = new FormGroup({
    weekly: new FormControl<boolean>(true),
    monthly: new FormControl<boolean>(true),
    quarterly: new FormControl<boolean>(true),
    yearly: new FormControl<boolean>(true)
  })

  entries$ = combineLatest([
    this.dbEntries$,
    this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
  ]).pipe(
    map(([entries, filter]) => entries.filter(entry => {
      const intervals: AssessLifeInterval[] = []
      if (filter.weekly) intervals.push('weekly')
      if (filter.monthly) intervals.push('monthly')
      if (filter.quarterly) intervals.push('quarterly')
      if (filter.yearly) intervals.push('yearly')

      return intervals.includes(entry.interval)
    }))
  )

  private settings$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.settingsService.getSettings$(profile.uid) : of(undefined)),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  weekly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'weekly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'weekly'))
  )

  monthly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'monthly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'monthly'))
  )

  quarterly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'quarterly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'quarterly'))
  )

  yearly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'yearly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getEntryStatus(entries, settings, 'yearly'))
  )

  constructor(
    private auth: AuthService,
    private modalCtrl: ModalController,
    private screensize: ScreensizeService,
    private service: AssessLifeEntryService,
    private settingsService: AssessLifeSettingsService,
    private seo: SeoService,
  ) {
    this.seo.generateTags({
      title: 'Assess life - Strive Journal',
      description: 'Get a grasp on life by looking back and planning ahead',
    })
  }

  async addEntry(interval: AssessLifeInterval) {
    const [previousEntry, weekly, monthly, quarterly, yearly] = await Promise.all([
      this.getPreviousEntry(interval),
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

    const id = getAssessLifeId(interval)
    const entry = createAssessLifeEntry({ id, interval })

    const modal = await this.modalCtrl.create({
      component: AssessLifeEntryComponent,
      componentProps: { entry, previousEntry, todos }
    })
    modal.onDidDismiss().then(({ data: nextInterval }) => {
      if (nextInterval) this.addEntry(nextInterval)
    })
    modal.present()
  }

  async openEntry(entry: AssessLifeEntry) {
    this.modalCtrl.create({
      component: AssessLifeEntryComponent,
      componentProps: { entry }
    }).then(modal => modal.present())
  }

  async getPreviousEntry(interval: AssessLifeInterval) {
    const entries = await firstValueFrom(this.dbEntries$)
    const filtered = entries.filter(entry => entry.interval === interval)
    return filtered[0]
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}