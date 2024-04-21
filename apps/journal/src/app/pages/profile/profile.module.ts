import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonContent, IonCard, IonAvatar, IonButton, IonIcon } from '@ionic/angular/standalone'

import { ProfilePageComponent } from './profile.page'

// Followers / Followings
import { FollowingModule } from '@strive/spectator/components/following/following.module'
import { FollowersModule } from '@strive/spectator/components/followers/followers.module'
import { SupportingModule } from '@strive/goal/modals/supporting/supporting.module'

// Strive
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'

import { GoalOptionsModule } from '@strive/goal/components/goal-options/goal-options.module'
import { EditProfileImagePopoverModule } from './popovers/edit-profile-image/edit-profile-image.module'
import { ImageZoomModalComponent } from '@strive/ui/image-zoom/image-zoom.component'
import { PagenotfoundComponent } from '@strive/ui/404/404.component'
import { GoalCreateModalComponent } from '@strive/goal/modals/upsert/create/create.component'
import { CopiedPopoverComponent } from '@strive/ui/copied/copied.component'

import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { GoalThumbnailModule } from '@strive/goal/components/thumbnail/thumbnail.module'
import { ProgressPipeModule } from '@strive/goal/pipes/progress.pipe'

const routes: Routes = [
  { path: '', component: ProfilePageComponent },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    PageLoadingComponent,
    ImageModule,
    ImageSelectorModule,
    FollowingModule,
    FollowersModule,
    GoalOptionsModule,
    EditProfileImagePopoverModule,
    ImageZoomModalComponent,
    HeaderRootComponent,
    HeaderComponent,
    ProgressPipeModule,
    SupportingModule,
    GoalThumbnailModule,
    PagenotfoundComponent,
    GoalCreateModalComponent,
    CopiedPopoverComponent,
    IonContent,
    IonCard,
    IonAvatar,
    IonButton,
    IonIcon
  ],
  declarations: [
    ProfilePageComponent
  ]
})
export class ProfilePageModule { }
