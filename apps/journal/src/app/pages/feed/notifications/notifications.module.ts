import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NotificationModule } from '@strive/notification/components/notification/notification.module';
import { HeaderModule } from '@strive/ui/header/header.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

import { NotificationsComponent } from './notifications.component';

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    NotificationModule,
    HeaderModule,
    PageLoadingModule
  ],
  exports: [],
  declarations: [NotificationsComponent]
})
export class NotificationsModule { }
