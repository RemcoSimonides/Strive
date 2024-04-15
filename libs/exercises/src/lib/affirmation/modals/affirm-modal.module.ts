import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { AffirmModalComponent } from './affirm-modal.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    HeaderModalComponent,
    ImageModule,
    IonContent
  ],
  declarations: [AffirmModalComponent]
})
export class AffirmModalModule { }
