import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { ViewComponent } from './view.component';

import { BucketListUpsertModule } from '../upsert/upsert.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    IonicModule,
    BucketListUpsertModule
  ],
  exports: [ViewComponent],
  declarations: [ViewComponent]
})
export class BucketListViewModule { }
