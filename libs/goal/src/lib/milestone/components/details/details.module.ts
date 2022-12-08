import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { DetailsComponent } from './details.component'

import { MilestoneStatusModule } from '../status/status.module'
import { MilestoneDeadlineModule } from '../deadline/deadline.module'
import { AssigneeModule } from '../assignee/assignee.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { StoryModule } from '../../../story/components/story/story.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module'
import { PledgeModule } from '@strive/support/components/pledge/pledge.module'
import { SupportDecisionModule } from '@strive/support/components/decision/decision.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    MilestoneDeadlineModule,
    AssigneeModule,
    SubtaskPipeModule,
    StoryModule,
    DatetimeModule,
    UpsertPostModalModule,
    PledgeModule,
    SupportDecisionModule,
    AddSupportModule
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule {}