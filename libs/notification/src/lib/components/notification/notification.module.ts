import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { NotificationComponent } from './notification.component';

import { ChooseAchieverModalModule } from '../choose-achiever/choose-achiever-modal.module';
import { NotificationOptionsPopoverModule } from '../notification-options/notification-options.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,

    ChooseAchieverModalModule,
    NotificationOptionsPopoverModule
  ],
  exports: [NotificationComponent],
  declarations: [NotificationComponent],
})
export class NotificationModule { }
