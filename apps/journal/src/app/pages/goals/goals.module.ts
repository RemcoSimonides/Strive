import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { GoalsPageComponent } from './goals.page'

// Strive
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ProgressPipeModule } from '@strive/goal/pipes/progress.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { GoalOptionsModule } from '@strive/goal/components/goal-options/goal-options.module'
import { HomePageModule } from '../home/home.module'
import { GoalThumbnailModule } from '@strive/goal/components/thumbnail/thumbnail.module'
import { GoalUpdatesModalModule } from '@strive/goal/modals/goal-updates/goal-updates.module'
import { MiniThumbnailSwiperModule } from '@strive/goal/components/mini-thumbnail-swiper/mini-thumbnail-swiper.module'

import { CardsModalModule } from '@strive/exercises/daily-gratitude/modals/cards/cards-modal.module'
import { AffirmModalComponent } from '@strive/exercises/affirmation/modals/affirm-modal.component'
import { MessageModalModule } from '@strive/exercises/dear-future-self/modals/message/message.module'
import { EntryModalModule } from '@strive/exercises/wheel-of-life/modals/entry/entry.module'
import { IonContent, IonRefresher, IonRefresherContent, IonThumbnail, IonIcon, IonBadge, IonButton, IonSkeletonText } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: GoalsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    HeaderRootComponent,
    GoalCreateModalComponent,
    ImageModule,
    GoalOptionsModule,
    HomePageModule,
    ReactiveFormsModule,
    ProgressPipeModule,
    GoalThumbnailModule,
    GoalUpdatesModalModule,
    MiniThumbnailSwiperModule,

    CardsModalModule,
    AffirmModalComponent,
    MessageModalModule,
    EntryModalModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonThumbnail,
    IonIcon,
    IonBadge,
    IonButton,
    IonSkeletonText
  ],
  declarations: [GoalsPageComponent]
})
export class GoalsPageModule { }
