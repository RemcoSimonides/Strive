import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FontAwesomeModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EditRoadmapPage
  ]
})
export class EditRoadmapPageModule {}
