import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { ImageModule } from '@strive/media/directives/image.module'
import { LargeThumbnailComponent } from './large-thumbnail.component'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule
  ],
  exports: [LargeThumbnailComponent],
  declarations: [LargeThumbnailComponent]
})
export class LargeThumbnailModule { }