import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { ModalController, PopoverController } from '@ionic/angular'
import { DailyGratefulnessService } from '@strive/exercises/daily-gratefulness/daily-gratefulness.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { UserService } from '@strive/user/user/user.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { debounceTime, of, switchMap, tap } from 'rxjs'
import { addDays, isPast, set } from 'date-fns'
import { SeoService } from '@strive/utils/services/seo.service'
import { CardsModalComponent } from '@strive/exercises/daily-gratefulness/modals/cards/cards-modal.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

interface DailyGratefulnessSetting {
  on: boolean
  time: string
}

@Component({
  selector: 'strive-daily-gratefulness',
  templateUrl: './daily-gratefulness.component.html',
  styleUrls: ['./daily-gratefulness.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyGratefulnessComponent implements OnDestroy {
  isLoading = true

  form = new FormGroup({
    on: new FormControl(false, { nonNullable: true }),
    time: new FormControl('21:00', { nonNullable: true })
  })

  get dailyGratefulness(): DailyGratefulnessSetting {
    return this.form.value as DailyGratefulnessSetting
  }

  private sub = this.user.user$.pipe(
    switchMap(user => user ? this.service.getDailyGratefulnessSettings(user.uid) : of(undefined)),
    tap(dailyGratefulness => {

      const setting = { on: false, time: '21:00' } // default
      if (dailyGratefulness) {
        const { time, on } = dailyGratefulness

        const hours = time.getHours()
        const minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes()
        setting.time = `${hours}:${minutes}`
        setting.on = on
      }

      this.form.patchValue(setting)
      this.isLoading = false
      this.cdr.markForCheck()
    })
  ).subscribe()

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private service: DailyGratefulnessService,
    public user: UserService
  ) {
    this.seo.generateTags({
      title: 'Daily Gratefulness - Strive Journal',
      description: 'Focus on the positive and take a minute to be grateful'
    })

    const { t } = this.route.snapshot.queryParams
    if (t === 'new') {
      this.modalCtrl.create({
        component: CardsModalComponent
      }).then(modal => modal.present())
    }
  }

  toggle(event: any) {
    if (!this.user.uid) return
    const on = event.detail.checked
  
    if (on) {
      this.openDatetime()
    } else {
      this.service.save(this.user.uid, { on: false })
    }
  }

  async openDatetime() {
    if (this.form.get('on')!.value === false) return

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: {
        value: this.getDateFromTime(),
        presentation: 'time',
        label: 'What time would you like to receive the reminder?'
      }
    })
    popover.onDidDismiss<string>().then((value) => {
      if (!this.user.uid) return
      const { data, role } = value

      if (role === 'dismiss') {
        const date = data ? new Date(data) : new Date()

        const hours = date.getHours()
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
        const time = `${hours}:${minutes}`

        this.form.get('time')?.setValue(time)

        const toDate = set(new Date(), { hours, minutes: date.getMinutes() })
        const performAt = isPast(toDate) ? addDays(toDate, 1) : toDate
        this.service.save(this.user.uid, { on: true, time: performAt })
      } 

      if (role === 'remove') {
        this.form.get('on')!.setValue(false)
        this.service.save(this.user.uid, { on: false })
      }

      this.cdr.markForCheck()

    })
    popover.present()
  }

  getDateFromTime() {
    const setting = this.form.value
    
    const [ hours, minutes ] = setting.time!.split(':').map(time => +time)
    return set(new Date(), { hours, minutes })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
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