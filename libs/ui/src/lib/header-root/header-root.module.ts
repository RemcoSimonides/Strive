import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'
import { RouterModule } from '@angular/router'

import { HeaderRootComponent } from './header-root.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { MenuModule } from '../menu/menu.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ImageModule,
    MenuModule
  ],
  exports: [HeaderRootComponent],
  declarations: [HeaderRootComponent],
})
export class HeaderRootModule { }
