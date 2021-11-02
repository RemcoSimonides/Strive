import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { RouterModule } from "@angular/router";
import { IonicModule } from '@ionic/angular';

import { ImageModule } from "@strive/media/directives/image.module";
import { BannerComponent } from "./banner.component";
import { AffirmationUpsertModule } from '@strive/exercises/affirmation/components/upsert/upsert.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    IonicModule,
    ImageModule,
    AffirmationUpsertModule
  ],
  declarations: [BannerComponent],
  exports: [BannerComponent]
})
export class BannerModule { }