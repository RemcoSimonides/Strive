import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CreateGoalPage } from './create-goal.page';

// import { ImageUploadComponent } from '../../../../components/image-upload/image-upload.component'
import { AutosizeModule } from '@strive/ui/directives/auto-resize-textarea.directive';


const routes: Routes = [
  {
    path: '',
    component: CreateGoalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AutosizeModule
  ],
  declarations: [
    CreateGoalPage
  ]
})
export class CreateGoalPageModule {}
