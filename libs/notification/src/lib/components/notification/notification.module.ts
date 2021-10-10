import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { NotificationComponent, SourcePipe } from './notification.component';

import { ChooseAchieverModalModule } from '../choose-achiever/choose-achiever-modal.module';
import { NotificationOptionsPopoverModule } from '../notification-options/notification-options.module';
import { PostComponentModule } from '@strive/post/components/post/post.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { MessagePipeModule } from '../../pipes/message.pipe';
import { DiscussionModalModule } from '@strive/discussion/components/discussion-modal/discussion-modal.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,

    ChooseAchieverModalModule,
    NotificationOptionsPopoverModule,
    PostComponentModule,
    ImageModule,
    MessagePipeModule,
    DiscussionModalModule
  ],
  exports: [NotificationComponent],
  declarations: [NotificationComponent, SourcePipe],
})
export class NotificationModule { }
