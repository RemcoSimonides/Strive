import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { IonicModule } from '@ionic/angular';

import { EditDefaultRoadmapPage } from './edit-default-roadmap.page';

// Components
import { ComponentsModule } from '../../../../../components/components.module'

const routes: Routes = [
  {
    path: '',
    component: EditDefaultRoadmapPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FontAwesomeModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    EditDefaultRoadmapPage
  ]
})
export class EditDefaultRoadmapPageModule {}
