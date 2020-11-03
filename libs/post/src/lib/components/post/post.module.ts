import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PostComponent } from './post.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  exports: [PostComponent],
  declarations: [PostComponent],
})
export class PostComponentModule { }
