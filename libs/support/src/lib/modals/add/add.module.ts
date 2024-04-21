import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AddSupportModalComponent } from './add.component'

import { SupportListComponent } from '../../components/list/list.component'
import { AddSupportComponent } from '../../components/add/add.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonContent, IonTitle } from '@ionic/angular/standalone'


@NgModule({
  imports: [
    CommonModule,
    SupportListComponent,
    AddSupportComponent,
    HeaderModalComponent,
    IonTitle,
    IonContent,
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule { }
