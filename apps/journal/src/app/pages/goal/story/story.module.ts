import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
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
    RouterModule,
    FlexLayoutModule,
    StoryItemMessagePipeModule,
    TimeAgoPipeModule,
    PostComponentModule
  ],
  exports: [StoryComponent],
  declarations: [StoryComponent]
})
export class StoryModule { }
