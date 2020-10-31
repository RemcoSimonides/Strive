import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UpsertCollectiveGoalPage } from './upsert.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [],
  declarations: [UpsertCollectiveGoalPage],
})
export class UpsertCollectiveGoalModule { }
