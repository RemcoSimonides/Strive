import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { ProfileOptionsPage } from './popovers/profile-options/profile-options.page'
import { EditProfileImagePopoverPage } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'

import { ExerciseAffirmationPage } from './modals/exercise-affirmation/exercise-affirmation.page';
import { ExerciseBucketlistPage }  from './modals/exercise-bucketlist/exercise-bucketlist.page'
import { ExerciseAffirmationExplanationPage } from './modals/exercise-affirmation/popovers/exercise-affirmation-explanation/exercise-affirmation-explanation.page'
import { ExerciseDailyGratefulnessPage } from './modals/exercise-daily-gratefulness/exercise-daily-gratefulness.page'
import { ExerciseAssessLifePage } from './modals/exercise-assess-life/exercise-assess-life.page'
import { ExerciseDearFutureSelfPage } from './modals/exercise-dear-future-self/exercise-dear-future-self.page'

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module';

const routes: Routes = [
  { path: '', component: ProfilePage },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ThumbnailListModule,
    RectangleThumbnailModule
  ],
  declarations: [
    ProfilePage,
    ProfileOptionsPage,
    EditProfileImagePopoverPage,
    ExerciseAffirmationPage,
    ExerciseBucketlistPage,
    ExerciseAffirmationExplanationPage,
    ExerciseDailyGratefulnessPage,
    ExerciseAssessLifePage,
    ExerciseDearFutureSelfPage
  ],
  entryComponents: [
    ProfileOptionsPage,
    EditProfileImagePopoverPage,
    ExerciseAffirmationPage,
    ExerciseBucketlistPage,
    ExerciseAffirmationExplanationPage,
    ExerciseDailyGratefulnessPage,
    ExerciseAssessLifePage,
    ExerciseDearFutureSelfPage
  ]
})
export class ProfilePageModule {}
