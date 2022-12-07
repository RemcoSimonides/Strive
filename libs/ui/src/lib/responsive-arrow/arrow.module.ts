import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { ArrowForwardComponent, ArrowBackComponent } from './arrow.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    ArrowForwardComponent, ArrowBackComponent
  ],
  exports: [
    ArrowForwardComponent, ArrowBackComponent
  ]
})
export class ArrowModule {}