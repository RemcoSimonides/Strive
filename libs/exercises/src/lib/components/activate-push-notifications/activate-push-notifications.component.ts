import { ChangeDetectionStrategy, Component } from "@angular/core";
import { UserService } from '@strive/user/user/+state/user.service';
import { PersonalService } from '@strive/user/user/+state/personal.service';
import { map, of, switchMap } from "rxjs";
import { Personal } from "@strive/user/user/+state/user.firestore";
import { FcmService } from "@strive/utils/services/fcm.service";
import { ToastController } from "@ionic/angular";

@Component({
  selector: 'exercises-activate-push-notification',
  templateUrl: './activate-push-notifications.component.html',
  styleUrls: ['./activate-push-notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivatePushNotificationsComponent {

  hasPushNotifications$ = this.user.user$.pipe(
    switchMap(user => user ? this.personal.valueChanges(user.uid, { uid: user.uid }) : of(undefined)),
    map((personal: Personal) => !personal?.fcmTokens?.length)
  )

  constructor(
    private fcm: FcmService,
    private personal: PersonalService,
    private toast: ToastController,
    private user: UserService,
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