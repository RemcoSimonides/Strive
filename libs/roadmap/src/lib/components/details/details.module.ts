import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { DetailsComponent } from './details.component'

import { MilestoneStatusModule } from '../status/status.module'
import { AssigneeModule } from '../assignee/assignee.module'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { StoryModule } from '@strive/story/components/story/story.module'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonButton, IonIcon, IonContent, IonItem, IonTextarea, IonList, IonReorderGroup, IonInput, IonReorder } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    AssigneeModule,
    SubtaskPipeModule,
    StoryModule,
    DatetimeComponent,
    UpsertPostModalModule,
    AddSupportModule,
    SupportListModule,
    HeaderModalComponent,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonTextarea,
    IonList,
    IonReorderGroup,
    IonInput,
    IonReorder
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule { }
