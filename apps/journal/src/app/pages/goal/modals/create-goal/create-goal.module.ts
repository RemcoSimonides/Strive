import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateGoalPage } from './create-goal.page';

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
    CreateGoalPage
  ]
})
export class CreateGoalPageModule {}
