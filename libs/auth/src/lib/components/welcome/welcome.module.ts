import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { IonicModule } from '@ionic/angular'

import { SwiperModule } from 'swiper/angular'

import { WelcomeModalComponent } from './welcome.modal'

import { ImageModule } from '@strive/media/directives/image.module'
import { UpsertGoalModalModule } from '@strive/goal/modals/upsert/goal-upsert.module'


@NgModule({
  imports: [
    CommonModule,
    SwiperModule,
    IonicModule,
    ImageModule,
    UpsertGoalModalModule
  ],
  declarations: [
    WelcomeModalComponent
  ]
})
export class WelcomeModalModule {}