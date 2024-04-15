import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SupportingComponent } from './supporting.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    HeaderModalComponent,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonThumbnail,
    IonLabel
  ],
  exports: [],
  declarations: [SupportingComponent],
})
export class SupportingModule { }
