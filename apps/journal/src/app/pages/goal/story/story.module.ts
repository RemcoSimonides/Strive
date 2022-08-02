import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'
import { FlexLayoutModule } from '@angular/flex-layout'

import { StoryComponent } from './story.component'

import { StoryItemMessagePipeModule } from '@strive/goal/story/pipes/story-message'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { PostComponentModule } from '@strive/post/components/post/post.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    StoryItemMessagePipeModule,
    TimeAgoPipeModule,
    PostComponentModule
  ],
  exports: [StoryComponent],
  declarations: [StoryComponent]
})
export class StoryModule { }