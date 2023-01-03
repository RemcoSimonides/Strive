import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { RouterModule } from '@angular/router'
import { IonicModule } from "@ionic/angular"

import { PagenotfoundComponent } from './404.component'

import { HeaderModule } from '../header/header.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    HeaderModule
  ],
  declarations: [PagenotfoundComponent],
  exports: [PagenotfoundComponent]
})
export class PagenotfoundModule {}