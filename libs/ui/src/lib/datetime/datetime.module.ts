import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from "@ionic/angular"

import { DatetimeComponent } from './datetime.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [DatetimeComponent],
  exports: [DatetimeComponent]
})
export class DatetimeModule {}