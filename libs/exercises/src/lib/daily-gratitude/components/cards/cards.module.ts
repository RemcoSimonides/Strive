import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { CardsComponent } from './cards.component'

import { SwiperModule } from 'swiper/angular'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { IsTodayPipe, ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    SwiperModule,
    DatetimeModule,
    IsTodayPipe,
    ToDatePipe
  ],
  declarations: [
    CardsComponent
  ],
  exports: [
    CardsComponent
  ]
})
export class CardsModule {}