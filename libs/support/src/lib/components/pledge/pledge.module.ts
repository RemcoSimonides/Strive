import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { ArrowModule } from '@strive/ui/responsive-arrow/arrow.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { MaxLengthModule } from '@strive/utils/pipes/max-length.pipe'

import { PledgeComponent } from './pledge.component'
import { CommonModule } from '@angular/common'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ArrowModule,
    ImageModule,
    MaxLengthModule
  ],
  declarations: [
    PledgeComponent
  ],
  exports: [
    PledgeComponent
  ]
})
export class PledgeModule {}