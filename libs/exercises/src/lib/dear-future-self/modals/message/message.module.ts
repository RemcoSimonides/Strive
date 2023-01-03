import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { MessageModalComponent } from './message.component'

import { HeaderModule } from '@strive/ui/header/header.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderModule
  ],
  declarations: [MessageModalComponent]
})
export class MessageModalModule {}