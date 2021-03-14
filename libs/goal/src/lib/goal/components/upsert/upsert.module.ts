import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpsertGoalModalComponent } from './upsert.component';

// import { ImageUploadComponent } from '../../../../components/image-upload/image-upload.component'
import { AutosizeModule } from '@strive/ui/directives/auto-resize-textarea.directive';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AutosizeModule
  ],
  declarations: [
    UpsertGoalModalComponent
  ]
})
export class UpsertGoalModalModule {}
