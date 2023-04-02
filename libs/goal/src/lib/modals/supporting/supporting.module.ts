import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { SupportingComponent } from './supporting.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
    HeaderModalComponent
  ],
  exports: [],
  declarations: [SupportingComponent],
})
export class SupportingModule { }
