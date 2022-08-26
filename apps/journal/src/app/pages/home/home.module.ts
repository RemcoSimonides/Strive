import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { FlexLayoutModule } from '@angular/flex-layout'
import { IonicModule } from '@ionic/angular'

import { HomeComponent } from './home.page'

import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    IonicModule,
    ImageModule,
    SmallThumbnailModule
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomePageModule {}