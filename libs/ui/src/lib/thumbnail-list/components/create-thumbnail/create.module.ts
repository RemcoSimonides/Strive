import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CreateThumbnailComponent } from './create.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CreateThumbnailComponent],
  declarations: [CreateThumbnailComponent],
  providers: [],
})
export class CreateThumbnailModule { }
