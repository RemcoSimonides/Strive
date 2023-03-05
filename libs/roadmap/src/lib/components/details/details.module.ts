import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { DetailsComponent } from './details.component'

import { MilestoneStatusModule } from '../status/status.module'
import { AssigneeModule } from '../assignee/assignee.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { StoryModule } from '@strive/story/components/story/story.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    AssigneeModule,
    SubtaskPipeModule,
    StoryModule,
    DatetimeModule,
    UpsertPostModalModule,
    AddSupportModule,
    SupportListModule
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule {}