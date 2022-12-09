import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { SupportDetailsModalComponent } from './details.component'

import { SupportDetailsModule } from '../../components/details/details.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SupportDetailsModule
  ],
  declarations: [SupportDetailsModalComponent],
  exports: [SupportDetailsModalComponent]
})
export class SupportDetailsModalModule {}