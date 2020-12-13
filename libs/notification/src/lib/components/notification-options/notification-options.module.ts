import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { NotificationOptionsPopover } from './notification-options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [],
  declarations: [NotificationOptionsPopover]
})
export class NotificationOptionsPopoverModule { }
