import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UpsertCollectiveGoalPage } from './upsert.component';
import { AutosizeModule } from '@strive/ui/directives/auto-resize-textarea.directive';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AutosizeModule
  ],
  exports: [],
  declarations: [
    UpsertCollectiveGoalPage
  ],
})
export class UpsertCollectiveGoalModule { }
