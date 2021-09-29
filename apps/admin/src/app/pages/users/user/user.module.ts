import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UserPage } from './user.page';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module'
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module'

const routes: Routes = [
  {
    path: '',
    component: UserPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    ImageSelectorModule,
    ThumbnailListModule,
    RectangleThumbnailModule
  ],
  declarations: [UserPage]
})
export class UserPageModule {}
