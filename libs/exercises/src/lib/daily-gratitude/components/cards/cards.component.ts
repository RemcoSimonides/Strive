import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { PopoverController } from '@ionic/angular'

import { limit, orderBy } from 'firebase/firestore'
import { BehaviorSubject, firstValueFrom, of, switchMap, tap } from 'rxjs'
import { formatISO, isToday, startOfDay } from 'date-fns'

import { AuthService } from '@strive/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { DailyGratitudeEntryService } from '../../daily-gratitude.service'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { DailyGratitudeEntry } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import SwiperCore, { EffectCards, Navigation } from 'swiper'
SwiperCore.use([EffectCards, Navigation])

@Component({
  selector: 'strive-daily-gratitude-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent implements OnDestroy {

  private startValue = ''
  date = formatISO(new Date(), { representation: 'date' })
  isDesktop$ = this.screensize.isDesktop$

  form = new FormGroup({
    item1: new FormControl(this.startValue, { nonNullable: true }),
    item2: new FormControl(this.startValue, { nonNullable: true }),
    item3: new FormControl(this.startValue, { nonNullable: true })
  })

  save$ = new BehaviorSubject<'save' | 'saving' | 'saved'>('save')
  enteredToday$ = new BehaviorSubject(false)

  entries$ = this.auth.profile$.pipe(
    switchMap(profile => {
      if (!profile) return of([])
      return this.entryService.valueChanges([orderBy('id', 'desc'), limit(500)], { uid: profile.uid }).pipe(
        switchMap(cards => this.entryService.decrypt(cards))
      )
    }),
    tap(entries => {
      const today = entries.find(e => isToday(new Date(e.id)))
      this.enteredToday$.next(!!today)
    })
  )

  private sub = this.form.valueChanges.subscribe(() => {
    if (this.save$.value === 'saved' && this.form.dirty) {
      this.save$.next('save')
    }
  })

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private entryService: DailyGratitudeEntryService,
    private popoverCtrl: PopoverController,
    private screensize: ScreensizeService
  ) {
    this.getEntry()
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  save() {
    if (!this.auth.uid) return
    this.save$.next('saving')

    const { item1, item2, item3 } = this.form.value

    const items: string[] = []
    if (item1 && item1 !== this.startValue) items.push(item1)
    if (item2 && item2 !== this.startValue) items.push(item2)
    if (item3 && item3 !== this.startValue) items.push(item3)

    if (items.length) {
      const card: DailyGratitudeEntry = {
        id: this.date,
        items
      }

      this.entryService.save(card)
      this.form.markAsPristine()
    }

    delay(1500).then(() => { this.save$.next('saved') })
  }

  async selectDate() {
    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: {
        maxDate: startOfDay(new Date()),
        hideRemove: true
      }
    })
    popover.onDidDismiss().then(async ({ data, role }) => {
      if (role === 'dismiss') {
        const date = data ? new Date(data) : new Date()
        this.date = formatISO(date, { representation: 'date' })

        this.getEntry()
        this.save$.next('save')
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }

  private async getEntry() {
    const entries = await firstValueFrom(this.entries$)

    const entry = entries.find(e => e.id === this.date)
    if (entry) {
      const [item1, item2, item3,] = entry.items
      this.form.patchValue({
        item1: item1 ?? this.startValue,
        item2: item2 ?? this.startValue,
        item3: item3 ?? this.startValue
      })
    } else {
      this.form.patchValue({
        item1: this.startValue,
        item2: this.startValue,
        item3: this.startValue
      })
    }
  }
}