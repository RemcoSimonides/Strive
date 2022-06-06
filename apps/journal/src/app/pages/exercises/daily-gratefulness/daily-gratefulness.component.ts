import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { DailyGratefulness } from "@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore";
import { DailyGratefulnessService } from "@strive/exercises/daily-gratefulness/+state/daily-gratefulness.service";
import { AuthModalComponent, enumAuthSegment } from "@strive/user/auth/components/auth-modal/auth-modal.page";
import { UserService } from "@strive/user/user/+state/user.service";
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { debounceTime, of, switchMap, tap } from "rxjs";
import { addDays, isPast, set } from 'date-fns'
import { SeoService } from "@strive/utils/services/seo.service";

@Component({
  selector: 'strive-daily-gratefulness',
  templateUrl: './daily-gratefulness.component.html',
  styleUrls: ['./daily-gratefulness.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DailyGratefulnessComponent implements OnDestroy {
  isLoading = true

  form = new FormGroup({
    on: new FormControl(false),
    time: new FormControl('21:00')
  })

  get dailyGratefulness(): DailyGratefulness {
    return this.form.value
  }

  private sub = this.user.user$.pipe(
    switchMap(user => user ? this.service.getDailyGratefulnessSettings(user.uid) : of(undefined)),
    tap(dailyGratefulness => {

      const setting = { on: false, time: '21:00' } // default
      if (dailyGratefulness) {
        const hours = dailyGratefulness.time.getHours()
        const minutes = dailyGratefulness.time.getMinutes()
        setting.time = `${hours}:${minutes}`
        setting.on = dailyGratefulness.on
      }

      this.form.patchValue(setting)
      this.isLoading = false
      this.cdr.markForCheck()
    })
  ).subscribe()

  private formSub = this.form.valueChanges.pipe(
    debounceTime(1000)
  ).subscribe((setting: { on: boolean, time: string }) => {
    if (!this.user?.uid) return

    const [ hours, minutes ] = setting.time.split(':').map(time => +time)
    const time = set(new Date(), { hours, minutes })
    const performAt = isPast(time) ? addDays(time, 1) : time

    this.service.save(this.user.uid, {
      on: setting.on,
      time: performAt
    })
  })

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    public screensize: ScreensizeService,
    private seo: SeoService,
    private service: DailyGratefulnessService,
    public user: UserService
  ) {
    this.seo.generateTags({ title: 'Daily Gratefulness - Strive Journal' })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.formSub.unsubscribe()
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