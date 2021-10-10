import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalComponent } from './collective-goal.component';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    IonicModule,
    PageLoadingModule,
    ImageSelectorModule
  ],
  declarations: [CollectiveGoalComponent],
  exports: [CollectiveGoalComponent]
})
export class CollectiveGoalPageModule {}
