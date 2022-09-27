import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { StoryComponent } from './story.component'

import { StoryModule as StoryMainModule } from '@strive/goal/story/components/story/story.module'
import { StoryItemMessagePipeModule } from '@strive/goal/story/pipes/story-message'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { PostComponentModule } from '@strive/post/components/post/post.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    StoryItemMessagePipeModule,
    TimeAgoPipeModule,
    PostComponentModule,
    StoryMainModule
  ],
  exports: [StoryComponent],
  declarations: [StoryComponent]
})
export class StoryModule { }
