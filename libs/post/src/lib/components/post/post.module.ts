import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { PostComponent } from './post.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { PostOptionsModule } from '@strive/post/popovers/options/options.module'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'
import { MediaPipeModule } from '@strive/media/pipes/media.pipe'
import { IonCard, IonAvatar, IonButton, IonIcon, IonCardContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    ImageZoomModalComponent,
    PostOptionsModule,
    HTMLPipeModule,
    SafePipe,
    MediaPipeModule,
    IonCard,
    IonAvatar,
    IonButton,
    IonIcon,
    IonCardContent
  ],
  exports: [PostComponent],
  declarations: [PostComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PostComponentModule { }
