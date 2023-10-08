import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { ActivatePushNotificationsComponent } from './activate-push-notifications.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [ActivatePushNotificationsComponent],
  exports: [ActivatePushNotificationsComponent]
})
export class ActivatePushNotificationsModule {}