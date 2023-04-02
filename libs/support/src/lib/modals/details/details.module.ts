import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { SupportDetailsModalComponent } from './details.component'

import { SupportDetailsModule } from '../../components/details/details.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SupportDetailsModule,
    HeaderModalComponent
  ],
  declarations: [SupportDetailsModalComponent],
  exports: [SupportDetailsModalComponent]
})
export class SupportDetailsModalModule {}