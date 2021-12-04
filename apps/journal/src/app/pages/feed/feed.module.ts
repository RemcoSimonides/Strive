import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

// Pages
import { FeedPage } from './feed.page';

// Components
import { NotificationModule } from '@strive/notification/components/notification/notification.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';

// Exercises
import { AffirmationUpsertModule } from '@strive/exercises/affirmation/components/upsert/upsert.module';
import { DailyGratefulnessUpsertModule } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.module';
import { AssessLifeUpsertModule } from '@strive/exercises/assess-life/components/upsert/upsert.module';
import { DearFutureSelfUpsertModule } from '@strive/exercises/dear-future-self/components/upsert/upsert.module';

// Pipes
import { MilestonePathPipeModule } from '@strive/milestone/pipes/path.pipe'

const routes: Routes = [
  {
    path: '',
    component: FeedPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    MilestonePathPipeModule,
    NotificationModule,
    PageLoadingModule,
    ImageModule,
    SmallThumbnailModule,

    // Exercises
    AffirmationUpsertModule,
    DailyGratefulnessUpsertModule,
    AssessLifeUpsertModule,
    DearFutureSelfUpsertModule
  ],
  declarations: [
    FeedPage,
  ]
})
export class FeedPageModule {}
