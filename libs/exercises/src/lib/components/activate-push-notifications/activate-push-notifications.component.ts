import { ChangeDetectionStrategy, Component } from "@angular/core";
import { PersonalService } from '@strive/user/personal/personal.service';
import { map } from "rxjs";
import { FcmService } from "@strive/utils/services/fcm.service";
import { ToastController } from "@ionic/angular";

@Component({
  selector: 'exercises-activate-push-notification',
  templateUrl: './activate-push-notifications.component.html',
  styleUrls: ['./activate-push-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivatePushNotificationsComponent {

  noFcmToken$ = this.personal.personal$.pipe(
    map(personal => !personal?.fcmTokens?.length)
  )

  fcmNotSupported$ = this.fcm.fcmIsSupported.then(isSupported => !isSupported)

  constructor(
    private fcm: FcmService,
    private personal: PersonalService,
    private toast: ToastController,
  ) {}

  async pushNotifications() {
    const res = await this.fcm.registerFCM()
    if (res) {
      this.toast.create({
        message: 'Push notifications actived',
        duration: 3000,
        position: 'bottom',
      }).then(toast => toast.present())
    }
  }
}