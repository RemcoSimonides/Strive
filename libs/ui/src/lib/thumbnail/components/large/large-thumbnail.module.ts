import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { RouterModule } from "@angular/router";
import { ImageModule } from "@strive/media/directives/image.module";
import { LargeThumbnailComponent } from "./large-thumbnail.component";

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule
  ],
  exports: [LargeThumbnailComponent],
  declarations: [LargeThumbnailComponent]
})
export class LargeThumbnailModule { }