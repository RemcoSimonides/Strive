import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { DetailsComponent } from './details.component'

import { MilestoneStatusModule } from '../status/status.module'
import { MilestoneDeadlineModule } from '../deadline/deadline.module'
import { AssigneeModule } from '../assignee/assignee.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { AddSupportModalModule } from '@strive/support/components/add/add.module'
import { StoryModule } from '../../../story/components/story/story.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    MilestoneDeadlineModule,
    AssigneeModule,
    SubtaskPipeModule,
    AddSupportModalModule,
    StoryModule
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule {}