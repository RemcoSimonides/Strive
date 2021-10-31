import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { FlexLayoutModule } from '@angular/flex-layout';

import { SmallThumbnailComponent } from "./small-thumbnail.component";
import { ImageModule } from "@strive/media/directives/image.module";

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule
  ],
  exports: [SmallThumbnailComponent],
  declarations: [SmallThumbnailComponent]
})
export class SmallThumbnailModule { }