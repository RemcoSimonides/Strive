import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FlexLayoutModule } from '@angular/flex-layout';

import { SmallThumbnailComponent } from "./small-thumbnail.component";
import { ImageModule } from "@strive/media/directives/image.module";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule
  ],
  exports: [SmallThumbnailComponent],
  declarations: [SmallThumbnailComponent]
})
export class SmallThumbnailModule { }