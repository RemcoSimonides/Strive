import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { IonButtons, IonButton, IonToggle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox } from '@ionic/angular/standalone'

import { HeaderComponent } from '@strive/ui/header/header.component'
import { EmailNotificationSettingsForm } from '@strive/user/forms/settings.form'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'


@Component({
  standalone: true,
  selector: 'journal-email-notification-settings',
  templateUrl: './email-notification-settings.component.html',
  styleUrls: ['./email-notification-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonButton,
    IonToggle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonCheckbox
  ]
})
export class EmailNotificationSettingsComponent {

  isMobile$ = this.screensize.isMobile$

  form = this.personalService.form.emailNotification as EmailNotificationSettingsForm

  constructor(
    private personalService: PersonalService,
    private screensize: ScreensizeService
  ) { }
}
