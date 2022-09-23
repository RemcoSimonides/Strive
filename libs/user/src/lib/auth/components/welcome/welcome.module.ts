import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FlexLayoutModule } from '@angular/flex-layout'
import { IonicModule } from '@ionic/angular'

import { SwiperModule } from 'swiper/angular'

import { WelcomeModalComponent } from './welcome.modal'

import { ImageModule } from '@strive/media/directives/image.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module'


@NgModule({
  imports: [
    CommonModule,
    SwiperModule,
    FlexLayoutModule,
    IonicModule,
    ImageModule,
    UpsertGoalModalModule
  ],
  declarations: [
    WelcomeModalComponent
  ]
})
export class WelcomeModalModule {}