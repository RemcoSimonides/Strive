import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ProfileComponent } from './profile.page';

// Exercises
import { DailyGratefulnessUpsertModule } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.module';
import { AssessLifeUpsertModule } from '@strive/exercises/assess-life/components/upsert/upsert.module';
import { DearFutureSelfUpsertModule } from '@strive/exercises/dear-future-self/components/upsert/upsert.module';

// Followers / Followings
import { FollowingModule } from '@strive/user/spectator/components/following/following.module';
import { FollowersModule } from '@strive/user/spectator/components/followers/followers.module';

// Strive
import { ThumbnailGridModule } from '@strive/ui/thumbnail/layout/grid/thumbnail-grid.module';
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';
import { RowsPipeModule } from '@strive/ui/thumbnail/pipes/rows.pipe';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

import { ImageModule } from '@strive/media/directives/image.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


import { StatusPipeModule } from '@strive/goal/goal/pipes/status.pipe';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { GoalOptionsModule } from '@strive/goal/goal/components/goal-options/goal-options.module';


const routes: Routes = [
  { path: '', component: ProfileComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    IonicModule,
    RouterModule.forChild(routes),
    ThumbnailGridModule,
    RowsPipeModule,
    PageLoadingModule,
    ImageModule,
    ImageSelectorModule,
    FollowingModule,
    FollowersModule,
    StatusPipeModule,
    GoalOptionsModule,
    UpsertGoalModalModule,
    FontAwesomeModule,
    SmallThumbnailModule,

    // Exercises
    DailyGratefulnessUpsertModule,
    AssessLifeUpsertModule,
    DearFutureSelfUpsertModule
  ],
  declarations: [
    ProfileComponent
  ]
})
export class ProfilePageModule {}
