import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

import { ChatComponent } from './chat.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { JoinButtonModule } from '@strive/goal/goal/components/join-button/join-button.module'
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module'
import { AddSupportModalModule } from '@strive/support/modals/add/add.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    ImageModule,
    TimeAgoPipeModule,
    HTMLPipeModule,
    
    JoinButtonModule,
    AuthModalModule,
    AddSupportModalModule
  ],
  declarations: [
    ChatComponent
  ],
  exports: [
    ChatComponent
  ]
})
export class ChatModule {}
