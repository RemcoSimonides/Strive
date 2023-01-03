import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { JoinButtonComponent } from './join-button.component'

import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module'
import { JoinButtonPipeModule } from '../../pipes/join-button'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    JoinButtonPipeModule,
    AuthModalModule
  ],
  declarations: [JoinButtonComponent],
  exports: [JoinButtonComponent]
})
export class JoinButtonModule {}