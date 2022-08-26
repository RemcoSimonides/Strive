import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { StoryComponent } from './story.component'

import { StoryItemMessagePipeModule } from '@strive/goal/story/pipes/story-message'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { PostComponentModule } from '@strive/post/components/post/post.module'
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module'

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        RouterModule,
        StoryItemMessagePipeModule,
        TimeAgoPipeModule,
        PostComponentModule,
        UpsertPostModalModule
    ],
    declarations: [
        StoryComponent
    ],
    exports: [
        StoryComponent
    ]
})
export class StoryModule {}