import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CommentComponent } from './comment.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CommentComponent],
  declarations: [CommentComponent]
})
export class CommentModule { }
