import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { FollowingComponent } from './following.component'

import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule,
  ],
  exports: [],
  declarations: [FollowingComponent],
})
export class FollowingModule { }
