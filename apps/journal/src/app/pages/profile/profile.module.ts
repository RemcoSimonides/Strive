import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ProfileComponent } from './profile.page';

// Followers / Followings
import { FollowingModule } from '@strive/user/spectator/components/following/following.module';
import { FollowersModule } from '@strive/user/spectator/components/followers/followers.module';

// Strive
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

import { ImageModule } from '@strive/media/directives/image.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

import { StatusPipeModule } from '@strive/goal/goal/pipes/status.pipe';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { GoalOptionsModule } from '@strive/goal/goal/components/goal-options/goal-options.module';
import { EditProfileImagePopoverModule } from './popovers/edit-profile-image/edit-profile-image.module';
import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module';

import { HeaderRootModule } from '@strive/ui/header-root/header-root.module';
import { HeaderModule } from '@strive/ui/header/header.module';

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
    PageLoadingModule,
    ImageModule,
    ImageSelectorModule,
    FollowingModule,
    FollowersModule,
    StatusPipeModule,
    GoalOptionsModule,
    UpsertGoalModalModule,
    EditProfileImagePopoverModule,
    ImageZoomModalModule,
    HeaderRootModule,
    HeaderModule
  ],
  declarations: [
    ProfileComponent
  ]
})
export class ProfilePageModule {}
