import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SupportingComponent } from './supporting.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonTitle, IonContent, IonList, IonItem, IonThumbnail, IonLabel } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageDirective,
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
