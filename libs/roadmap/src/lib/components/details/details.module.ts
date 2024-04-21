import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { DetailsComponent } from './details.component'

import { MilestoneStatusModule } from '../status/status.module'
import { AssigneeComponent } from '../assignee/assignee.component'
import { SubtaskPipeModule } from '../../pipes/subtask.pipe'
import { StoryComponent } from '@strive/story/components/story/story.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'

import { SupportListComponent } from '@strive/support/components/list/list.component'
import { AddSupportComponent } from '@strive/support/components/add/add.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonButton, IonIcon, IonContent, IonItem, IonTextarea, IonList, IonReorderGroup, IonInput, IonReorder } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    AssigneeComponent,
    SubtaskPipeModule,
    StoryComponent,
    DatetimeComponent,
    UpsertPostModalModule,
    AddSupportComponent,
    SupportListComponent,
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
