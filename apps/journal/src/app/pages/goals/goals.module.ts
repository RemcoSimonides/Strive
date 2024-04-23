import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { GoalsPageComponent } from './goals.page'

// Strive
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { GoalOptionsComponent } from '@strive/goal/components/goal-options/goal-options.component'
import { HomePageModule } from '../home/home.module'
import { GoalThumbnailComponent } from '@strive/goal/components/thumbnail/thumbnail.component'
import { GoalUpdatesModalComponent } from '@strive/goal/modals/goal-updates/goal-updates.component'
import { MiniThumbnailSwiperComponent } from '@strive/goal/components/mini-thumbnail-swiper/mini-thumbnail-swiper.component'

import { CardsModalComponent } from '@strive/exercises/daily-gratitude/modals/cards/cards-modal.component'
import { AffirmModalComponent } from '@strive/exercises/affirmation/modals/affirm-modal.component'
import { MessageModalComponent } from '@strive/exercises/dear-future-self/modals/message/message.component'
import { EntryModalComponent } from '@strive/exercises/wheel-of-life/modals/entry/entry.component'
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
    PageLoadingComponent,
    HeaderRootComponent,
    GoalCreateModalComponent,
    ImageDirective,
    GoalOptionsComponent,
    HomePageModule,
    ReactiveFormsModule,
    GoalThumbnailComponent,
    GoalUpdatesModalComponent,
    MiniThumbnailSwiperComponent,

    CardsModalComponent,
    AffirmModalComponent,
    MessageModalComponent,
    EntryModalComponent,
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
