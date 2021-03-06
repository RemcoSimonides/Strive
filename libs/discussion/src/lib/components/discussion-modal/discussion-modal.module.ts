import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DiscussionModalPage } from './discussion-modal.component';

import { CommentModule } from '../comment/comment.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    CommentModule
  ],
  declarations: [
    DiscussionModalPage
  ],
})
export class DiscussionModalModule {}
