import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PostComponent } from './post.component';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule
  ],
  exports: [PostComponent],
  declarations: [PostComponent],
})
export class PostComponentModule { }
