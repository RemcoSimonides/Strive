import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { IonCard, IonCardContent, IonButton, ToastController } from '@ionic/angular/standalone'
import { CommonModule } from '@angular/common'

import { map } from 'rxjs'
import { PersonalService } from '@strive/user/personal.service'

@Component({
    selector: 'strive-exercise-activate-push-notification',
    templateUrl: './activate-push-notifications.component.html',
    styleUrls: ['./activate-push-notifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        IonCard,
        IonCardContent,
        IonButton
    ]
})
export class ActivatePushNotificationsComponent {
  private personal = inject(PersonalService);
  private toast = inject(ToastController);


  noFcmToken$ = this.personal.personal$.pipe(
    map(personal => !personal?.fcmTokens?.length)
  )

  fcmNotSupported$ = this.personal.fcmIsSupported.then(isSupported => !isSupported)

  async pushNotifications() {
    const res = await this.personal.registerFCM(true, true)
    if (res) {
      this.toast.create({
        message: 'Push notifications actived',
        duration: 3000,
        position: 'bottom',
      }).then(toast => toast.present())
    }
  }
}
