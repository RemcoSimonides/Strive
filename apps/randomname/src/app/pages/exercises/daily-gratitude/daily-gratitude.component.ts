import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'

import { IonContent, IonToggle, ModalController, PopoverController } from '@ionic/angular/standalone'

import { of, switchMap, tap } from 'rxjs'
import { addDays, isPast, set } from 'date-fns'

import { DailyGratitudeService } from '@strive/exercises/daily-gratitude/daily-gratitude.service'
import { SeoService } from '@strive/utils/services/seo.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { AuthService } from '@strive/auth/auth.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ActivatePushNotificationsComponent } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.component'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { CardsComponent } from '@strive/exercises/daily-gratitude/components/cards/cards.component'

interface DailyGratitudeSetting {
  on: boolean
  time: string
}

@Component({
    selector: 'journal-daily-gratitude',
    templateUrl: './daily-gratitude.component.html',
    styleUrls: ['./daily-gratitude.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        RouterModule,
        PageLoadingComponent,
        ActivatePushNotificationsComponent,
        HeaderComponent,
        CardsComponent,
        IonContent,
        IonToggle
    ]
})
export class DailyGratitudePageComponent implements OnDestroy {
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private modalCtrl = inject(ModalController);
  private popoverCtrl = inject(PopoverController);
  screensize = inject(ScreensizeService);
  private seo = inject(SeoService);
  private service = inject(DailyGratitudeService);

  isLoading = true

  form = new FormGroup({
    on: new FormControl(false, { nonNullable: true }),
    time: new FormControl('21:00', { nonNullable: true })
  })

  get dailyGratitude(): DailyGratitudeSetting {
    return this.form.value as DailyGratitudeSetting
  }

  private sub = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.service.getDailyGratitudeSettings(profile.uid) : of(undefined)),
    tap(dailyGratitude => {

      const setting = { on: false, time: '21:00' } // default
      if (dailyGratitude) {
        const { time, on } = dailyGratitude

        const hours = time.getHours()
        const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
        setting.time = `${hours}:${minutes}`
        setting.on = on
      }

      this.form.patchValue(setting, { emitEvent: false })
      this.isLoading = false
      this.cdr.markForCheck()
    })
  ).subscribe()

  private toggleSub = this.form.get('on')?.valueChanges.subscribe(on => {
    if (on) {
      this.openDatetime()
    } else {
      if (!this.auth.uid) return
      this.service.save(this.auth.uid, { on: false })
    }
  })

  uid$ = this.auth.uid$

  constructor() {
    this.seo.generateTags({
      title: 'Daily Gratitude - Strive Journal',
      description: 'Focus on the positive and take a minute to be grateful'
    })
  }

  async openDatetime() {
    if (this.form.get('on')?.value === false) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: {
        value: this.getDateFromTime(),
        presentation: 'time',
        label: 'What time would you like to receive the reminder?'
      },
      cssClass: 'datetime-popover'
    })
    popover.onDidDismiss<string>().then((value) => {
      if (!this.auth.uid) return
      const { data, role } = value

      if (role === 'dismiss') {
        const date = data ? new Date(data) : new Date()

        const hours = date.getHours()
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        const time = `${hours}:${minutes}`

        this.form.get('time')?.setValue(time)

        const toDate = set(new Date(), { hours, minutes: date.getMinutes() })
        const performAt = isPast(toDate) ? addDays(toDate, 1) : toDate
        this.service.save(this.auth.uid, { on: true, time: performAt })
      }

      if (role === 'remove') {
        this.form.get('on')?.setValue(false)
        this.service.save(this.auth.uid, { on: false })
      }

      this.cdr.markForCheck()

    })
    popover.present()
  }

  getDateFromTime() {
    const setting = this.form.value

    const [hours, minutes] = (setting.time as string).split(':').map(time => +time)
    return set(new Date(), { hours, minutes })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.toggleSub?.unsubscribe()
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
