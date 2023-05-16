import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ToastController } from '@ionic/angular'
import { map } from 'rxjs'
import { PersonalService } from '@strive/user/personal.service'

@Component({
  selector: 'strive-exercise-activate-push-notification',
  templateUrl: './activate-push-notifications.component.html',
  styleUrls: ['./activate-push-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivatePushNotificationsComponent {

  noFcmToken$ = this.personal.personal$.pipe(
    map(personal => !personal?.fcmTokens?.length)
  )

  fcmNotSupported$ = this.personal.fcmIsSupported.then(isSupported => !isSupported)

  constructor(
    private personal: PersonalService,
    private toast: ToastController,
  ) {}

  async pushNotifications() {
    const res = await this.personal.registerFCM(true)
    if (res) {
      this.toast.create({
        message: 'Push notifications actived',
        duration: 3000,
        position: 'bottom',
      }).then(toast => toast.present())
    }
  }
}