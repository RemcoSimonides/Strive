import { CommonModule } from "@angular/common"
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core"
import { WelcomeModalComponent } from './welcome.modal'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    GoalCreateModalComponent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon
  ],
  declarations: [
    WelcomeModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WelcomeModalModule { }
