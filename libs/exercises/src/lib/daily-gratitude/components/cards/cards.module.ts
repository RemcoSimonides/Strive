import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { CardsComponent } from './cards.component'

import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { IsTodayPipe, ToDatePipe } from '@strive/utils/pipes/date-fns.pipe'
import { DatePipe } from '@angular/common'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    DatetimeModule,
    IsTodayPipe,
    ToDatePipe
  ],
  declarations: [
    CardsComponent
  ],
  exports: [
    CardsComponent
  ],
  providers: [
    DatePipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CardsModule {}