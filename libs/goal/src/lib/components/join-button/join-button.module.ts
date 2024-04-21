import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { JoinButtonComponent, JoinButtonTextSPipe } from './join-button.component'

import { AuthModalComponent } from '@strive/auth/components/auth-modal/auth-modal.page'
import { IonButton, IonIcon, IonItem, IonList, IonPopover, IonSpinner } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    AuthModalComponent,
    JoinButtonTextSPipe,
    IonIcon,
    IonPopover,
    IonList,
    IonItem,
    IonButton,
    IonSpinner
  ],
  declarations: [JoinButtonComponent],
  exports: [JoinButtonComponent]
})
export class JoinButtonModule { }
