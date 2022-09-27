import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { MilestoneDeadlineComponent } from './deadline.component'

import { DatetimeModule } from '@strive/ui/datetime/datetime.module'


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DatetimeModule
  ],
  declarations: [
    MilestoneDeadlineComponent
  ],
  exports: [
    MilestoneDeadlineComponent
  ]
})
export class MilestoneDeadlineModule { }