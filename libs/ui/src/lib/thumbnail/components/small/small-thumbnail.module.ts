import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { SmallThumbnailComponent } from './small-thumbnail.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule
  ],
  exports: [SmallThumbnailComponent],
  declarations: [SmallThumbnailComponent]
})
export class SmallThumbnailModule { }