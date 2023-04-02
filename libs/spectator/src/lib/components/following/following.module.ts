import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { FollowingComponent } from './following.component'

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
  declarations: [FollowingComponent],
})
export class FollowingModule { }
