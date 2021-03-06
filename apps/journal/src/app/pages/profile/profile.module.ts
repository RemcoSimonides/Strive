import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ProfilePage } from './profile.page';
import { ProfileOptionsPage } from './popovers/profile-options/profile-options.page'
import { EditProfileImagePopoverPage } from './popovers/edit-profile-image-popover/edit-profile-image-popover.page'

import { BucketListViewModule } from '@strive/exercises/bucket-list/components/view/view.module';
import { BucketListUpsertModule } from '@strive/exercises/bucket-list/components/upsert/upsert.module';
import { AffirmationsViewModule } from '@strive/exercises/affirmation/components/view/view.module';
import { AffirmationUpsertModule } from '@strive/exercises/affirmation/components/upsert/upsert.module';
import { DailyGratefulnessUpsertModule } from '@strive/exercises/daily-gratefulness/components/upsert/upsert.module';
import { AssessLifeUpsertModule } from '@strive/exercises/assess-life/components/upsert/upsert.module';
import { DearFutureSelfUpsertModule } from '@strive/exercises/dear-future-self/components/upsert/upsert.module';
import { FollowingModule } from '@strive/user/spectator/components/following/following.module';
import { FollowersModule } from '@strive/user/spectator/components/followers/followers.module';
// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

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
    ImageModule,
    ImageSelectorModule,
    FollowingModule,

    // Exercises
    BucketListViewModule,
    BucketListUpsertModule,
    AffirmationsViewModule,
    AffirmationUpsertModule,
    DailyGratefulnessUpsertModule,
    AssessLifeUpsertModule,
    DearFutureSelfUpsertModule
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
