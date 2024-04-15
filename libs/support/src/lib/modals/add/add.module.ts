import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AddSupportModalComponent } from './add.component'

import { SupportListModule } from '../../components/list/list.module'
import { AddSupportModule } from '../../components/add/add.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonContent, IonTitle } from '@ionic/angular/standalone'


@NgModule({
  imports: [
    CommonModule,
    SupportListModule,
    AddSupportModule,
    HeaderModalComponent,
    IonTitle,
    IonContent,
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule { }
