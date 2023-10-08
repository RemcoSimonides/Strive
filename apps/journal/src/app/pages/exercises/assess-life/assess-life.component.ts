import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ModalController } from '@ionic/angular'
import { orderBy } from 'firebase/firestore'
import { combineLatest, firstValueFrom, map, of, shareReplay, startWith, switchMap } from 'rxjs'

import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { AssessLifeEntry, AssessLifeInterval, AssessLifeSettings } from '@strive/model'
import { AuthService } from '@strive/auth/auth.service'
import { AssessLifeEntryService, AssessLifeSettingsService } from '@strive/exercises/assess-life/assess-life.service'
import { AssessLifeEntryComponent } from '@strive/exercises/assess-life/components/entry/assess-life-entry.component'
import { differenceInDays } from 'date-fns'

function getActivatedQuestions(settings: AssessLifeSettings | undefined, interval: AssessLifeInterval) {
  if (!settings) return []
  const activated = []

  for (const [key, value] of Object.entries(settings)) {
    if (value === interval) activated.push(key)
  }
  return activated
}

function getMessage(entries: AssessLifeEntry[], settings: AssessLifeSettings | undefined, interval: AssessLifeInterval) {
  const questions = getActivatedQuestions(settings, interval)
  const minDays: Record<AssessLifeInterval, number> = {
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    yearly: 365
  }

  if (questions.length === 0) return { disabled: true, message: 'No questions activated - change in settings' }
  if (entries.length === 0) return { disabled: false, message: `Ready for a new entry!`}

  const lastEntry = entries[0]
  const today = new Date()
  const days = differenceInDays(today, lastEntry.createdAt)

  if (days < minDays[interval]) return { disabled: true, message: `You can't add a new entry yet. You can add a new entry in ${minDays[interval] - days} day${minDays[interval] - days === 1 ? '' : 's'}`}

  return { disabled: false, message: `Ready for a new entry!`}
}

@Component({
  selector: 'journal-assess-life',
  templateUrl: './assess-life.component.html',
  styleUrls: ['./assess-life.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessLifeComponent {

  isMobile$ = this.screensize.isMobile$

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
    map(([entries, settings]) => getMessage(entries, settings, 'weekly'))
  )

  monthly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'monthly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getMessage(entries, settings, 'monthly'))
  )

  quarterly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'quarterly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getMessage(entries, settings, 'quarterly'))
  )

  yearly$ = combineLatest([
    this.dbEntries$.pipe(map(entries => entries.filter(entry => entry.interval === 'yearly'))),
    this.settings$
  ]).pipe(
    map(([entries, settings]) => getMessage(entries, settings, 'yearly'))
  )

  constructor(
    private auth: AuthService,
    private modal: ModalController,
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
    const previousEntry = await this.getPreviousEntry(interval)

    this.modal.create({
      component: AssessLifeEntryComponent,
      componentProps: { interval, previousEntry }
    }).then(modal => modal.present())
  }

  async openEntry(entry: AssessLifeEntry) {
    this.modal.create({
      component: AssessLifeEntryComponent,
      componentProps: { entry, interval: entry.interval }
    }).then(modal => modal.present())
  }

  async getPreviousEntry(interval: AssessLifeInterval) {
    const entries = await firstValueFrom(this.dbEntries$)
    const filtered = entries.filter(entry => entry.interval === interval)
    return filtered[0]
  }
}