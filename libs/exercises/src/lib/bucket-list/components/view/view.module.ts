import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ViewComponent } from './view.component';

import { UpsertModule } from '../upsert/upsert.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UpsertModule
  ],
  exports: [ViewComponent],
  declarations: [ViewComponent]
})
export class BucketListViewModule { }
