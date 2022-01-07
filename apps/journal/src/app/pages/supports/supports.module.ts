import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SupportsComponent } from './supports.page';

import { HeaderModule } from '@strive/ui/header/header.module';
import { MilestonePathPipeModule } from '@strive/goal/milestone/pipes/path.pipe'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

const routes: Routes = [
  {
    path: '',
    component: SupportsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    MilestonePathPipeModule,
    PageLoadingModule
  ],
  declarations: [
    SupportsComponent,
  ]
})
export class SupportsPageModule {}
