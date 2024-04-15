import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonSegment, IonSegmentButton } from '@ionic/angular/standalone'

import { WheelOfLifeResultsComponent } from './results.component'

import { NgChartsModule } from 'ng2-charts'
import 'chartjs-adapter-date-fns'

@NgModule({
  imports: [
    CommonModule,
    NgChartsModule,
    IonSegment,
    IonSegmentButton
  ],
  declarations: [WheelOfLifeResultsComponent],
  exports: [WheelOfLifeResultsComponent]
})
export class WheelOfLifeResultsModule { }
