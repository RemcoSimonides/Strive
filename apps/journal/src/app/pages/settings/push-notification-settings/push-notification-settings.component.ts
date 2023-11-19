import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'
import { PushNotificationSettingsForm } from '@strive/user/forms/settings.form'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { FormControl } from '@angular/forms'

@Component({
  selector: 'journal-push-notification-settings',
  templateUrl: './push-notification-settings.component.html',
  styleUrls: ['./push-notification-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PushNotificationsSettingsComponent implements OnDestroy {

  fcmActive = false
  isMobile$ = this.screensize.isMobile$

  mainForm = new FormControl<boolean | null>(null) // separate mainForm to avoid infinite loop because main is also updated in registerFCM method

  form = this.personalService.form.pushNotification as PushNotificationSettingsForm
  fcmRegistered$ = this.personalService.fcmIsRegistered

  private sub: Subscription

  constructor(
    private personalService: PersonalService,
    private screensize: ScreensizeService
  ) {
    this.mainForm.setValue(this.form.main.value)
    if (!this.form.main.value) this.form.disableControls()

    this.sub = this.mainForm.valueChanges.subscribe(value => {
      if (value) {
        this.personalService.registerFCM(true, true)
        this.form.enableControls()
      } else {
        this.form.disableControls()
        this.form.main.setValue(false)
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }

  unregisterFCM() {
    this.personalService.unregisterFCM()
  }
}