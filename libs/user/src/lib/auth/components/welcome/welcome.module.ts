import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { WelcomeModal } from './welcome.modal';

import { SwiperModule } from 'swiper/angular';
import { ImageModule } from '@strive/media/directives/image.module';


@NgModule({
  imports: [
    CommonModule,
    SwiperModule,
    FlexLayoutModule,
    IonicModule,
    ImageModule
  ],
  declarations: [
    WelcomeModal
  ]
})
export class WelcomeModalModule {}