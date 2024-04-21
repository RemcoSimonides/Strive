import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { SupportDetailsModalComponent } from './details.component'

import { SupportDetailsComponent } from '../../components/details/details.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    SupportDetailsComponent,
    HeaderModalComponent
  ],
  declarations: [SupportDetailsModalComponent],
  exports: [SupportDetailsModalComponent]
})
export class SupportDetailsModalModule { }
