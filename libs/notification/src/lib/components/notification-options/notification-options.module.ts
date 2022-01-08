import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { NotificationOptionsPopoverComponent } from './notification-options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [],
  declarations: [NotificationOptionsPopoverComponent]
})
export class NotificationOptionsPopoverModule { }
