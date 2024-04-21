import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ArrowBackComponent, ArrowForwardComponent } from '@strive/ui/responsive-arrow/arrow.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { MaxLengthModule } from '@strive/utils/pipes/max-length.pipe'

import { PledgeComponent } from './pledge.component'
import { CommonModule } from '@angular/common'
import { IonAvatar } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ArrowBackComponent,
    ArrowForwardComponent,
    ImageModule,
    MaxLengthModule,
    IonAvatar,
    IonAvatar
  ],
  declarations: [
    PledgeComponent
  ],
  exports: [
    PledgeComponent
  ]
})
export class PledgeModule { }
