import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { IonicModule } from '@ionic/angular'

import { SwiperModule } from 'swiper/angular'

import { WelcomeModalComponent } from './welcome.modal'

import { ImageModule } from '@strive/media/directives/image.module'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'


@NgModule({
  imports: [
    CommonModule,
    SwiperModule,
    IonicModule,
    ImageModule,
    GoalCreateModalComponent
  ],
  declarations: [
    WelcomeModalComponent
  ]
})
export class WelcomeModalModule {}