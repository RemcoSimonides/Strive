import { CommonModule } from '@angular/common'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core'

import { IonButtons, IonButton, IonToggle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox } from '@ionic/angular/standalone'

import { Subscription } from 'rxjs'

import { PushNotificationSettingsForm } from '@strive/user/forms/settings.form'
import { PersonalService } from '@strive/user/personal.service'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { HeaderComponent } from '@strive/ui/header/header.component'

@Component({
  standalone: true,
  selector: 'journal-push-notification-settings',
  templateUrl: './push-notification-settings.component.html',
  styleUrls: ['./push-notification-settings.component.scss'],
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