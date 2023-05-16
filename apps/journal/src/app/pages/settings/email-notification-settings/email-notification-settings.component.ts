import { ChangeDetectionStrategy, Component } from '@angular/core'
import { EmailNotificationSettingsForm } from '@strive/user/forms/settings.form'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'


@Component({
  selector: 'journal-email-notification-settings',
  templateUrl: './email-notification-settings.component.html',
  styleUrls: ['./email-notification-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailNotificationSettingsComponent {

  isMobile$ = this.screensize.isMobile$

  form = this.personalService.form.emailNotification as EmailNotificationSettingsForm

  constructor(
    private personalService: PersonalService,
    private screensize: ScreensizeService
  ) {}
}