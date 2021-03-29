import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpsertGoalModalComponent } from './upsert.component';

import { AutosizeModule } from '@strive/ui/directives/auto-resize-textarea.directive';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AutosizeModule,
    ImageSelectorModule
  ],
  declarations: [
    UpsertGoalModalComponent
  ]
})
export class UpsertGoalModalModule {}
