import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { RoadmapComponent } from './roadmap.component'

import { MilestoneStatusModule } from '../status/status.module'
import { AssigneeModule } from '../assignee/assignee.module'

import { AddSupportModalModule } from '@strive/support/components/add/add.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { DetailsModule } from '../details/details.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { MaxLengthModule } from '@strive/utils/pipes/max-length.pipe'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    
    ImageModule,
    MilestoneStatusModule,
    AssigneeModule,
    AddSupportModalModule,
    DetailsModule,
    SubtaskPipeModule,
    MaxLengthModule
  ],
  exports: [
    RoadmapComponent
  ],
  declarations: [
    RoadmapComponent
  ]
})
export class RoadmapModule { }
