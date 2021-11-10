import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FlexLayoutModule } from '@angular/flex-layout';

import { SwiperModule } from 'swiper/angular';
import { RowsPipeModule } from '../../pipes/rows.pipe';

import { ThumbnailGridComponent } from './thumbnail-grid.component'

@NgModule({
  imports: [
    CommonModule,
    SwiperModule,
    RowsPipeModule,
    FlexLayoutModule
  ],
  declarations: [ThumbnailGridComponent],
  exports: [ThumbnailGridComponent]
})
export class ThumbnailGridModule { }