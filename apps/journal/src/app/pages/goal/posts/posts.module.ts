import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PostsComponent } from './posts.component';
import { MessagePipeModule } from '@strive/notification/pipes/message.pipe';
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe';
import { PostComponentModule } from '@strive/post/components/post/post.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    MessagePipeModule,
    TimeAgoPipeModule,
    PostComponentModule
  ],
  exports: [PostsComponent],
  declarations: [PostsComponent]
})
export class PostsModule { }
