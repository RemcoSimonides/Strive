import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { WheelOfLifeEntryComponent } from './entry.component'

import { NgChartsModule } from 'ng2-charts'

import { WheelOfLifeResultsModule } from '../results/results.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    NgChartsModule,
    WheelOfLifeResultsModule
  ],
  declarations: [WheelOfLifeEntryComponent],
  exports: [WheelOfLifeEntryComponent]
})
export class WheelOfLifeEntryModule {}