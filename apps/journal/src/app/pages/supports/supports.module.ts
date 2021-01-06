import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SupportsPage } from './supports.page';

import { HeaderModule } from '@strive/ui/header/header.module';
import { MilestonePathPipeModule } from '@strive/milestone/pipes/path.pipe'

const routes: Routes = [
  {
    path: '',
    component: SupportsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    MilestonePathPipeModule
  ],
  declarations: [
    SupportsPage,
  ]
})
export class SupportsPageModule {}
