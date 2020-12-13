import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PostsComponent } from './posts.component';
import { NotificationModule } from '@strive/notification/components/notification/notification.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    NotificationModule
  ],
  exports: [PostsComponent],
  declarations: [PostsComponent]
})
export class PostsModule { }
