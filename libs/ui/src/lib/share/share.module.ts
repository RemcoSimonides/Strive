import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { ShareComponent } from './share.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: [ShareComponent],
  declarations: [ShareComponent],
})
export class ShareModule { }
