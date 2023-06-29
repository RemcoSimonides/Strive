import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ChatModalComponent } from './chat.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { ThinkingPipe } from '@strive/chat/pipes/thinking.pipe'
import { JoinButtonModule } from '@strive/goal/components/join-button/join-button.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { AddSupportModalModule } from '@strive/support/modals/add/add.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageModule,
    TimeAgoPipeModule,
    HTMLPipeModule,

    JoinButtonModule,
    AuthModalModule,
    AddSupportModalModule,
    HeaderModalComponent,
    ThinkingPipe
  ],
  declarations: [
    ChatModalComponent
  ],
  exports: [
    ChatModalComponent
  ]
})
export class ChatModalModule {}
