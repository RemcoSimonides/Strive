import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { AddSupportModalComponent } from './add.component'

import { SupportListModule } from '../../components/list/list.module'
import { AddSupportModule } from '../../components/add/add.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SupportListModule,
    AddSupportModule,
    HeaderModalComponent
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule {}
