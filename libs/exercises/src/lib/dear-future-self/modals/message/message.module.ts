import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MessageModalComponent } from './message.component'

import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonTitle, IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    HeaderModalComponent,
    IonTitle,
    IonContent
  ],
  declarations: [MessageModalComponent]
})
export class MessageModalModule { }
