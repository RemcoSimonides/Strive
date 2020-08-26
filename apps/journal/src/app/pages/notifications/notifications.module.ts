import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

// Pages
import { NotificationsPage } from './notifications.page';
import { ChooseAchieverModalPage } from './modals/choose-achiever-modal/choose-achiever-modal.page'

import { ComponentsModule } from '../../components/components.module'
// pipes
import { PipesModule } from '../../pipes/pipes.module'

const routes: Routes = [
  {
    path: '',
    component: NotificationsPage
  }
];

@NgModule({
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PipesModule
  ],
  declarations: [
    NotificationsPage,
    ChooseAchieverModalPage
  ],
  entryComponents: [
    ChooseAchieverModalPage
  ]
})
export class NotificationsPageModule {}
