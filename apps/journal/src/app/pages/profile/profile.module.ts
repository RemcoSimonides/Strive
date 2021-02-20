import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { ProfileOptionsPage } from './popovers/profile-options/profile-options.page'
import { EditProfileImagePopoverPage } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'

// import { ExerciseDailyGratefulnessPage } from './modals/exercise-daily-gratefulness/exercise-daily-gratefulness.page'
// import { ExerciseAssessLifePage } from './modals/exercise-assess-life/exercise-assess-life.page'
// import { ExerciseDearFutureSelfPage } from './modals/exercise-dear-future-self/exercise-dear-future-self.page'
import { BucketListViewModule } from '@strive/exercises/bucket-list/components/view/view.module';
import { BucketListUpsertModule } from '@strive/exercises/bucket-list/components/upsert/upsert.module';
import { AffirmationsViewModule } from '@strive/exercises/affirmation/components/view/view.module';
import { AffirmationUpsertModule } from '@strive/exercises/affirmation/components/upsert/upsert.module';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

const routes: Routes = [
  { path: '', component: ProfilePage },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    IonicModule,
    RouterModule.forChild(routes),
    ThumbnailListModule,
    RectangleThumbnailModule,
    PageLoadingModule,

    // Exercises
    BucketListViewModule,
    BucketListUpsertModule,
    AffirmationsViewModule,
    AffirmationUpsertModule
  ],
  declarations: [
    ProfilePage,
    ProfileOptionsPage,
    EditProfileImagePopoverPage
  ],
  entryComponents: [
    ProfileOptionsPage,
    EditProfileImagePopoverPage
  ]
})
export class ProfilePageModule {}
