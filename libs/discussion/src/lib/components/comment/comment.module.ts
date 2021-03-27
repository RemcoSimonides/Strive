import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CommentComponent } from './comment.component';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule
  ],
  exports: [CommentComponent],
  declarations: [CommentComponent]
})
export class CommentModule { }
