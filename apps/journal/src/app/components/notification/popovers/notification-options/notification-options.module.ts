import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationOptionsPageRoutingModule } from './notification-options-routing.module';

import { NotificationOptionsPage } from './notification-options.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotificationOptionsPageRoutingModule
  ],
  declarations: []
})
export class NotificationOptionsPageModule {}
