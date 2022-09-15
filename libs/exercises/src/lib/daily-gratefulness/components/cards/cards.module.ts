import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { CardsComponent } from './cards.component'

import { SwiperModule } from 'swiper/angular'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SwiperModule
  ],
  declarations: [
    CardsComponent
  ],
  exports: [
    CardsComponent
  ]
})
export class CardsModule {}