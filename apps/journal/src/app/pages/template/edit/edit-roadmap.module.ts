import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EditRoadmapPage } from './edit-roadmap.page';

import { EditRoadmapModule } from '@strive/milestone/components/edit-roadmap/edit-roadmap.module';

const routes: Routes = [
  {
    path: '',
    component: EditRoadmapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    EditRoadmapModule
  ],
  declarations: [EditRoadmapPage]
})
export class EditRoadmapPageModule {}
