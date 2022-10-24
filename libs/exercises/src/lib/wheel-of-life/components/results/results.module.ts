import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { WheelOfLifeResultsComponent } from './results.component'

import { NgChartsModule } from 'ng2-charts'
import 'chartjs-adapter-date-fns'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NgChartsModule
  ],
  declarations: [WheelOfLifeResultsComponent],
  exports: [WheelOfLifeResultsComponent]
})
export class WheelOfLifeResultsModule {}