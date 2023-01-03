import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { GoalsPageComponent } from './goals.page'

// Strive
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { UpsertGoalModalModule } from '@strive/goal/modals/upsert/upsert.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ProgressPipeModule } from '@strive/goal/pipes/progress.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { GoalOptionsModule } from '@strive/goal/components/goal-options/goal-options.module'
import { HomePageModule } from '../home/home.module'
import { GoalThumbnailModule } from '@strive/goal/components/thumbnail/thumbnail.module'
import { GoalUpdatesModalModule } from '@strive/goal/modals/goal-updates/goal-updates.module'
import { MiniThumbnailSwiperModule } from '@strive/goal/components/mini-thumbnail-swiper/mini-thumbnail-swiper.module'

import { CardsModalModule } from '@strive/exercises/daily-gratitude/modals/cards/cards-modal.module'
import { AffirmModalModule } from '@strive/exercises/affirmation/modals/affirm-modal.module'
import { MessageModalModule } from '@strive/exercises/dear-future-self/modals/message/message.module'
import { EntryModalModule } from '@strive/exercises/wheel-of-life/modals/entry/entry.module'

const routes: Routes = [
  {
    path: '',
    component: GoalsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    HeaderRootModule,
    UpsertGoalModalModule,
    ImageModule,
    GoalOptionsModule,
    HomePageModule,
    ReactiveFormsModule,
    ProgressPipeModule,
    GoalThumbnailModule,
    GoalUpdatesModalModule,
    MiniThumbnailSwiperModule,

    CardsModalModule,
    AffirmModalModule,
    MessageModalModule,
    EntryModalModule
  ],
  declarations: [GoalsPageComponent]
})
export class GoalsPageModule {}
