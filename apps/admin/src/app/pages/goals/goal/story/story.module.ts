import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { StoryComponent } from './story.component'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'

import { StoryModule as GoalStoryModule } from '@strive/story/components/story/story.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingModule,
    GoalStoryModule
  ],
  declarations: [StoryComponent],
  exports: [StoryComponent]
})
export class StoryModule {}
