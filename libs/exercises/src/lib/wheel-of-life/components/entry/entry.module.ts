import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonRange, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone'

import { WheelOfLifeEntryComponent } from './entry.component'

import { NgChartsModule } from 'ng2-charts'

import { WheelOfLifeResultsModule } from '../results/results.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgChartsModule,
    WheelOfLifeResultsModule,
    IonRange,
    IonButton,
    IonIcon,
    IonContent
  ],
  declarations: [WheelOfLifeEntryComponent],
  exports: [WheelOfLifeEntryComponent]
})
export class WheelOfLifeEntryModule { }
