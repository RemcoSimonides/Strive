import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { NotificationComponent } from './notification.component';

import { ChooseAchieverModalModule } from '../choose-achiever/choose-achiever-modal.module';
import { NotificationOptionsPopoverModule } from '../notification-options/notification-options.module';
import { PostComponentModule } from '@strive/post/components/post/post.module';
import { CountdownComponent } from '../countdown/countdown.component';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,

    ChooseAchieverModalModule,
    NotificationOptionsPopoverModule,
    PostComponentModule,
    ImageModule
  ],
  exports: [NotificationComponent],
  declarations: [NotificationComponent, CountdownComponent],
})
export class NotificationModule { }
