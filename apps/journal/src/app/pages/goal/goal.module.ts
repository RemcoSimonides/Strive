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

import { RoadmapComponent } from '@strive/roadmap/components/roadmap/roadmap.component'

import { StoryComponent } from '@strive/story/components/story/story.component'

import { ChatModalComponent } from '@strive/chat/modals/chat/chat.component'

import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'

import { ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { DescriptionComponent } from '@strive/ui/description/description.component'
import { CompactPipe } from '@strive/utils/pipes/compact.pipe'

import { SupportListComponent } from '@strive/support/components/list/list.component'
import { AddSupportComponent } from '@strive/support/components/add/add.component'

import { ImageDirective } from '@strive/media/directives/image.directive'
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
    ImageDirective,
    ImageZoomModalComponent,
    CompactPipe,
    RoadmapComponent,
    StoryComponent,
    DescriptionComponent,
    JoinButtonModule,
    SupportListComponent,
    AddSupportComponent,
    ChatModalComponent,
    PageLoadingComponent,
    PagenotfoundComponent,
    HeaderRootComponent,
    AddOthersModalComponent,
    DeadlinePopoverSComponent,
    UpsertPostModalComponent,
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
