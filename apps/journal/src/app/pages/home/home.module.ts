import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { HomeComponent } from './home.page';

import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    IonicModule,
    SmallThumbnailModule
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomePageModule {}