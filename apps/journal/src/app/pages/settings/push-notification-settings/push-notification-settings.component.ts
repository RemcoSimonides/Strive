import { ChangeDetectionStrategy, Component } from '@angular/core'
import { PushNotificationSettingsForm } from '@strive/user/forms/settings.form'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'journal-push-notification-settings',
  templateUrl: './push-notification-settings.component.html',
  styleUrls: ['./push-notification-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PushNotificationsSettingsComponent {

  fcmActive = false
  isMobile$ = this.screensize.isMobile$

  form = this.personalService.form.pushNotification as PushNotificationSettingsForm
  fcmRegistered$ = this.personalService.fcmIsRegistered

  constructor(
    private personalService: PersonalService,
    private screensize: ScreensizeService
  ) {}

  unregisterFCM() {
    this.personalService.unregisterFCM()
  }
}