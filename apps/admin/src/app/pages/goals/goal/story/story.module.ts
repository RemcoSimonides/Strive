import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { StoryComponent } from './story.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

import { StoryModule as GoalStoryModule } from '@strive/story/components/story/story.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingComponent,
    GoalStoryModule
  ],
  declarations: [StoryComponent],
  exports: [StoryComponent]
})
export class StoryModule {}
