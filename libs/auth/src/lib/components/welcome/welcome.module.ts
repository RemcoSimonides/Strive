import { CommonModule } from "@angular/common"
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core"
import { IonicModule } from '@ionic/angular'

import { WelcomeModalComponent } from './welcome.modal'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    GoalCreateModalComponent
  ],
  declarations: [
    WelcomeModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WelcomeModalModule {}