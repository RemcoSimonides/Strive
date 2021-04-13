import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IonicModule } from '@ionic/angular';

import { EditRoadmapPage } from './edit-roadmap.page';

const routes: Routes = [
  {
    path: '',
    component: EditRoadmapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EditRoadmapPage
  ]
})
export class EditRoadmapPageModule {}
