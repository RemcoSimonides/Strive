import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { StoryComponent } from './story.component'

import { StoryItemMessagePipeModule } from '../../pipes/story-message'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { PostComponentModule } from '@strive/post/components/post/post.module'
import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'
import { IonButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    StoryItemMessagePipeModule,
    TimeAgoPipeModule,
    PostComponentModule,
    UpsertPostModalModule,
    IonButton,
    IonIcon
  ],
  declarations: [
    StoryComponent
  ],
  exports: [
    StoryComponent
  ]
})
export class StoryModule { }
