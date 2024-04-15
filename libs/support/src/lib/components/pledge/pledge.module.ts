import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ArrowModule } from '@strive/ui/responsive-arrow/arrow.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { MaxLengthModule } from '@strive/utils/pipes/max-length.pipe'

import { PledgeComponent } from './pledge.component'
import { CommonModule } from '@angular/common'
import { IonAvatar } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ArrowModule,
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
