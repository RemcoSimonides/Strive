import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { AffirmModalComponent } from './affirm-modal.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent,
    ImageModule
  ],
  declarations: [AffirmModalComponent]
})
export class AffirmModalModule {}