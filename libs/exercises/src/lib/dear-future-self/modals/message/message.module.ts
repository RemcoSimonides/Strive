import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { MessageModalComponent } from './message.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HeaderModalComponent
  ],
  declarations: [MessageModalComponent]
})
export class MessageModalModule {}