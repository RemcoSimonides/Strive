import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { RoadmapComponent } from './roadmap.component'

import { MilestoneStatusModule } from '../status/status.module'
import { AssigneeModule } from '../assignee/assignee.module'

import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { DetailsModule } from '../details/details.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { MaxLengthPipe } from '@strive/utils/pipes/max-length.pipe'
import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'
import { IonList, IonReorderGroup, IonItemSliding, IonItem, IonButton, IonIcon, IonReorder, IonItemOptions, IonItemOption, IonInput, IonSkeletonText } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    ImageModule,
    MilestoneStatusModule,
    AssigneeModule,
    AddSupportModalComponent,
    DetailsModule,
    SubtaskPipeModule,
    MaxLengthPipe,
    UpsertPostModalModule,
    IonList,
    IonReorderGroup,
    IonItemSliding,
    IonItem,
    IonButton,
    IonIcon,
    IonReorder,
    IonItemOptions,
    IonItemOption,
    IonInput,
    IonSkeletonText
  ],
  exports: [
    RoadmapComponent
  ],
  declarations: [
    RoadmapComponent
  ]
})
export class RoadmapModule { }
