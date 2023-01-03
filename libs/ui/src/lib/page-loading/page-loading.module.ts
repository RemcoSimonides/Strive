import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { IonicModule } from '@ionic/angular'

import { PageLoadingComponent } from './page-loading.component'

@NgModule({
  declarations: [PageLoadingComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [PageLoadingComponent]
})
export class PageLoadingModule { }
