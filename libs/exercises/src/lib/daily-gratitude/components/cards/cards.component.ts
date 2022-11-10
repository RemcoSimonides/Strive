import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { limit, orderBy } from 'firebase/firestore'
import { BehaviorSubject, map, of, switchMap } from 'rxjs'
import { formatISO } from 'date-fns'

import { AuthService } from '@strive/user/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { DailyGratitudeEntryService } from '../../daily-gratitude.service'

import { DailyGratitudeEntry } from '@strive/model'
import { delay } from '@strive/utils/helpers'

import SwiperCore, { EffectCards, Navigation } from 'swiper'
SwiperCore.use([EffectCards, Navigation])

@Component({
  selector: 'exercise-daily-gratitude-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent implements OnDestroy {

  private startValue = ''
  private today = formatISO(new Date(), { representation: 'date' })
  isDesktop$ = this.screensize.isDesktop$

  form = new FormGroup({
    item1: new FormControl(this.startValue, { nonNullable: true }),
    item2: new FormControl(this.startValue, { nonNullable: true }),
    item3: new FormControl(this.startValue, { nonNullable: true })
  })

  save$ = new BehaviorSubject<'save' | 'saving' | 'saved'>('save')

  cards$ = this.auth.profile$.pipe(
    switchMap(profile => {
      if (!profile) return of([])
      return this.entryService.valueChanges([orderBy('createdAt', 'desc'), limit(500)], { uid: profile.uid }).pipe(
        switchMap(cards => this.entryService.decrypt(cards))
      )
    }),
    map(cards => {
      const today = cards.find(card => card.id === this.today)
      if (today) {
        const [item1, item2, item3,] = today.items
        this.form.patchValue({
          item1: item1 ?? this.startValue,
          item2: item2 ?? this.startValue,
          item3: item3 ?? this.startValue
        }, { emitEvent: false })
      }

      return cards.filter(card => card.id !== this.today)
    })
  )

  private sub = this.form.valueChanges.subscribe(() => {
    if (this.save$.value === 'saved' && this.form.dirty) {
      this.save$.next('save')
    }
  })

  constructor(
    private auth: AuthService,
    private entryService: DailyGratitudeEntryService,
    private screensize: ScreensizeService
  ) {}

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
        id: this.today,
        items
      }

      this.entryService.save(card)
      this.form.markAsPristine()
    }

    delay(1500).then(() => { this.save$.next('saved') })
  }

}