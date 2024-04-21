import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { GoalPageComponent } from './goal.page'

import { GoalOptionsModule } from './popovers/options/options.module'
import { AddOthersModalComponent } from './modals/add-others/add-others.component'

import { GoalUpdateModalComponent } from '@strive/goal/modals/upsert/update/update.component'
import { JoinButtonModule } from '@strive/goal/components/join-button/join-button.module'
import { DeadlinePopoverSComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { GoalSharePopoverComponent } from '@strive/goal/popovers/share/share.component'
import { CollectiveGoalsModalSComponent } from '@strive/goal/modals/collective-goals/collective-goals.component'

import { AchieversModalComponent } from '@strive/stakeholder/modals/achievers/achievers.component'
import { SupportersModalComponent } from '@strive/stakeholder/modals/supporters/supporters.component'
import { SpectatorsModalComponent } from '@strive/stakeholder/modals/spectators/spectators.component'
import { SuggestionModalComponent } from '@strive/ui/suggestion/modal/suggestion-modal.component'

import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'

import { StoryModule } from '@strive/story/components/story/story.module'

import { ChatModalModule } from '@strive/chat/modals/chat/chat.module'

import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'

import { ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { DescriptionComponent } from '@strive/ui/description/description.component'
import { CompactPipe } from '@strive/utils/pipes/compact.pipe'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

import { ImageModule } from '@strive/media/directives/image.module'
import { IonFab, IonFabButton, IonIcon, IonContent, IonButton, IonSelect, IonSelectOption, IonCard, IonList, IonItem, IonAvatar, IonLabel } from "@ionic/angular/standalone";

const routes: Routes = [
  { path: '', component: GoalPageComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),

    // Strive
    GoalOptionsModule,
    GoalSharePopoverComponent,
    GoalUpdateModalComponent,
    AchieversModalComponent,
    SpectatorsModalComponent,
    SupportersModalComponent,
    ImageModule,
    ImageZoomModalComponent,
    CompactPipe,
    RoadmapModule,
    StoryModule,
    DescriptionComponent,
    JoinButtonModule,
    SupportListModule,
    AddSupportModule,
    ChatModalModule,
    PageLoadingComponent,
    PagenotfoundComponent,
    HeaderRootComponent,
    AddOthersModalComponent,
    DeadlinePopoverSComponent,
    UpsertPostModalModule,
    CollectiveGoalsModalSComponent,
    SuggestionModalComponent,
    IonFab,
    IonFabButton,
    IonIcon,
    IonContent,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonList,
    IonItem,
    IonAvatar,
    IonLabel
  ],
  declarations: [GoalPageComponent],
})
export class GoalPageModule { }
