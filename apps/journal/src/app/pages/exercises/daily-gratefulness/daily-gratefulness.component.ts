import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { DailyGratefulness } from "@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore";
import { DailyGratefulnessService } from "@strive/exercises/daily-gratefulness/+state/daily-gratefulness.service";
import { AuthModalModalComponent, enumAuthSegment } from "@strive/user/auth/components/auth-modal/auth-modal.page";
import { UserService } from "@strive/user/user/+state/user.service";
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { of, switchMap, tap } from "rxjs";

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
    tap(settings => {
      const value = !settings?.time ? { on: false, time: '21:00' } : settings
      this.form.patchValue(value)
      this.isLoading = false
      this.cdr.markForCheck()
    })
  ).subscribe()

  private formSub = this.form.valueChanges.subscribe(dailyGratefulness => {
    if (this.user?.uid) {
      this.service.save(this.user.uid, dailyGratefulness)
    }
  })

  constructor(
    private cdr: ChangeDetectorRef,
    private modalCtrl: ModalController,
    public screensize: ScreensizeService,
    private service: DailyGratefulnessService,
    public user: UserService
  ) {}

  ngOnDestroy() {
    this.sub.unsubscribe()
    this.formSub.unsubscribe()
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}