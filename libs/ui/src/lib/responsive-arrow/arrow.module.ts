import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ArrowForwardComponent, ArrowBackComponent } from './arrow.component'

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ArrowForwardComponent, ArrowBackComponent
  ],
  exports: [
    ArrowForwardComponent, ArrowBackComponent
  ]
})
export class ArrowModule { }
