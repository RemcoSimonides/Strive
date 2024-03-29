import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { HomePageComponent } from './home.page'

import { ImageModule } from '@strive/media/directives/image.module'
import { CompactPipeModule } from '@strive/utils/pipes/compact.pipe'

import { FooterModule } from '@strive/ui/footer/footer.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    CompactPipeModule,
    FooterModule
  ],
  declarations: [HomePageComponent],
  exports: [HomePageComponent]
})
export class HomePageModule {}