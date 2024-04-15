import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FollowersComponent } from './followers.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    HeaderModalComponent,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel
  ],
  exports: [],
  declarations: [FollowersComponent],
})
export class FollowersModule { }
