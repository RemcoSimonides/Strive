import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewEncapsulation } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'

import { limit } from 'firebase/firestore'
import { debounceTime, map, of, switchMap } from 'rxjs'
import { formatISO } from 'date-fns'

import { AuthService } from '@strive/user/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { DailyGratefulnessItemService } from '../../daily-gratefulness.service'

import { DailyGratefulnessItem } from '@strive/model'

import SwiperCore, { EffectCards, Navigation } from 'swiper'
SwiperCore.use([EffectCards, Navigation])

@Component({
  selector: 'exercise-daily-gratefulness-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardsComponent implements OnDestroy {

  startValue = 'I am grateful for '
  today = formatISO(new Date(), { representation: 'date' })
  isDesktop$ = this.screensize.isDesktop$

  form = new FormGroup({
    item1: new FormControl(this.startValue, { nonNullable: true }),
    item2: new FormControl(this.startValue, { nonNullable: true }),
    item3: new FormControl(this.startValue, { nonNullable: true })
  })

  cards$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.itemService.valueChanges([limit(500)] ,{ uid: profile.uid }) : of([]))
  ).pipe(
    switchMap(cards => this.itemService.decrypt(cards)),
    map(cards => {
      for (const card of cards) {
        if (card.id === this.today) {
          const [item1, item2, item3,] = card.items
          this.form.patchValue({
            item1: item1 ?? this.startValue,
            item2: item2 ?? this.startValue,
            item3: item3 ?? this.startValue
          }, { emitEvent: false })
        }
      }

      return cards.filter(card => card.id !== this.today)
    })
  )

  private sub = this.form.valueChanges.pipe(
    debounceTime(2000)
  ).subscribe(value => {
    if (!this.auth.uid) return

    const { item1, item2, item3 } = value

    const items: string[] = []
    if (item1 && item1 !== this.startValue) items.push(item1)
    if (item2 && item2 !== this.startValue) items.push(item2)
    if (item3 && item3 !== this.startValue) items.push(item3)

    if (items.length) {
      const card: DailyGratefulnessItem = {
        id: this.today,
        items
      }

      this.itemService.save(card)
    }

    this.form.markAsPristine()
    this.cdr.markForCheck()
  })

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private itemService: DailyGratefulnessItemService,
    private screensize: ScreensizeService
  ) {}

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

}