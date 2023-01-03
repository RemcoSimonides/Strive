import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { HeaderComponent } from './header.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [HeaderComponent],
  declarations: [HeaderComponent],
})
export class HeaderModule { }
