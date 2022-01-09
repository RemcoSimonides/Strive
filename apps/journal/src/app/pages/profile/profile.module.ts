import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ProfileComponent } from './profile.page';
import { EditProfileImagePopoverComponent } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'

import { AffirmationsViewModule } from '@strive/exercises/affirmation/components/view/view.module';
import { AffirmationUpsertModule } from '@strive/exercises/affirmation/components/upsert/upsert.module';
import { DailyGratefulnessUpsertModule } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.module';
import { AssessLifeUpsertModule } from '@strive/exercises/assess-life/components/upsert/upsert.module';
import { DearFutureSelfUpsertModule } from '@strive/exercises/dear-future-self/components/upsert/upsert.module';
import { FollowingModule } from '@strive/user/spectator/components/following/following.module';
import { FollowersModule } from '@strive/user/spectator/components/followers/followers.module';
// Strive
import { ThumbnailGridModule } from '@strive/ui/thumbnail/layout/grid/thumbnail-grid.module';
import { RowsPipeModule } from '@strive/ui/thumbnail/pipes/rows.pipe';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';
import { StatusPipeModule } from '@strive/goal/goal/pipes/status.pipe';
import { GoalOptionsModule } from './popovers/goal-options/goal-options.module';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

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
    SmallThumbnailModule,
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

    // Exercises
    AffirmationsViewModule,
    AffirmationUpsertModule,
    DailyGratefulnessUpsertModule,
    AssessLifeUpsertModule,
    DearFutureSelfUpsertModule
  ],
  declarations: [
    ProfileComponent,
    EditProfileImagePopoverComponent
  ],
  entryComponents: [
    EditProfileImagePopoverComponent
  ]
})
export class ProfilePageModule {}
