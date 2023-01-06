import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { JoinButtonComponent, JoinButtonTextSPipe } from './join-button.component'

import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AuthModalModule,
    JoinButtonTextSPipe
  ],
  declarations: [JoinButtonComponent],
  exports: [JoinButtonComponent]
})
export class JoinButtonModule {}