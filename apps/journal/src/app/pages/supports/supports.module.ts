import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SupportsPage } from './supports.page';
// pipes
import { PipesModule } from '../../pipes/pipes.module'
// Components
import { ComponentsModule } from '../../components/components.module'

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
    PipesModule,
    ComponentsModule
  ],
  declarations: [
    SupportsPage,
  ]
})
export class SupportsPageModule {}
