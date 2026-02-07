import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation, inject } from '@angular/core'
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms'

import { IonItem, IonTextarea, IonButton, IonIcon, PopoverController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { calendarOutline, checkmark } from 'ionicons/icons'

import { limit, orderBy } from '@angular/fire/firestore'
import { BehaviorSubject, firstValueFrom, of, switchMap, tap } from 'rxjs'
import { formatISO, isToday, startOfDay } from 'date-fns'
import { SwiperContainer } from 'swiper/element'

import { AuthService } from '@strive/auth/auth.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { DailyGratitudeEntryService } from '../../daily-gratitude.service'

import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { DailyGratitudeEntry } from '@strive/model'
import { delay } from '@strive/utils/helpers'
import { IsTodayPipe, ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'


@Component({
    selector: 'strive-daily-gratitude-cards',
    templateUrl: './cards.component.html',
    styleUrls: ['./cards.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IsTodayPipe,
        ToDatePipe,
        IonItem,
        IonTextarea,
        IonButton,
        IonIcon
    ],
    providers: [DatePipe],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CardsComponent implements OnDestroy {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private datePipe = inject(DatePipe);
  private entryService = inject(DailyGratitudeEntryService);
  private popoverCtrl = inject(PopoverController);
  private screensize = inject(ScreensizeService);


  @ViewChild('swiper') swiper?: ElementRef<SwiperContainer>;

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
      return this.entryService.collectionData([orderBy('id', 'desc'), limit(500)], { uid: profile.uid }).pipe(
        switchMap(cards => this.entryService.decrypt(cards))
      )
    }),
    tap(entries => {
      const today = entries.find(e => isToday(new Date(e.id)))
      this.enteredToday$.next(!!today)

      if (!this.swiper) return
      const swiper = this.swiper.nativeElement.swiper

      const formattedEntries = entries.map(entry => ({
        formattedDate: this.datePipe.transform(entry.id, 'longDate'),
        items: entry.items.map(item => ({ item })) // Assuming items are strings
      }));

      const indexes = Array.from({ length: formattedEntries.length }, (_, i) => i + 1)
      swiper.removeSlide(indexes)

      const listItems = formattedEntries.map(entry => {
        return entry.items.map(item => {
          return `
            <li>
              <span class="disc">•</span>
              ${item.item}
            </li>
          `
        }).join('')
      })

      const elements = formattedEntries.map(entry => `
        <swiper-slide>
          <section class="card">
            <span class="date">${entry.formattedDate}</span>
            <ul>
              ${listItems}
            </ul>
          </section>
        </swiper-slide.
      `)
      swiper.appendSlide(elements)
    })
  )

  private sub = this.form.valueChanges.subscribe(() => {
    if (this.save$.value === 'saved' && this.form.dirty) {
      this.save$.next('save')
    }
  })

  constructor() {
    this.getEntry()
    addIcons({ calendarOutline, checkmark })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  save() {
    if (!this.auth.isLoggedIn()) return
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
      },
      cssClass: 'datetime-popover'
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
