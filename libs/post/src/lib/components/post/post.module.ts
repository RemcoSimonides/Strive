import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { PostComponent } from './post.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'
import { PostOptionsModule } from '@strive/post/popovers/options/options.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    ImageZoomModalModule,
    PostOptionsModule
  ],
  exports: [PostComponent],
  declarations: [PostComponent],
})
export class PostComponentModule { }
