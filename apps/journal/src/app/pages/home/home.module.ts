import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { HomeComponent } from './home.page'

import { ImageModule } from '@strive/media/directives/image.module'
import { CompactPipeModule } from '@strive/utils/pipes/compact.pipe'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    CompactPipeModule
  ],
  declarations: [HomeComponent],
  exports: [HomeComponent]
})
export class HomePageModule {}