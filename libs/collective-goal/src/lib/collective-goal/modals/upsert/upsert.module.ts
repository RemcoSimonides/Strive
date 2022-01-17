import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UpsertCollectiveGoalComponent } from './upsert.component';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    ImageSelectorModule
  ],
  exports: [],
  declarations: [
    UpsertCollectiveGoalComponent
  ],
})
export class UpsertCollectiveGoalModule { }
