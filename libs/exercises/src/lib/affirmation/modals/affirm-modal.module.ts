import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { AffirmModalComponent } from './affirm-modal.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderModule,
    ImageModule
  ],
  declarations: [AffirmModalComponent]
})
export class AffirmModalModule {}