import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ActivatePushNotificationsComponent } from './activate-push-notifications.component'
import { IonCard, IonCardContent, IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonButton
  ],
  declarations: [ActivatePushNotificationsComponent],
  exports: [ActivatePushNotificationsComponent]
})
export class ActivatePushNotificationsModule { }
