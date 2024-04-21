import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonButton, IonIcon, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonFooter, IonItem, IonTextarea, IonPopover, IonList } from '@ionic/angular/standalone'

import { ChatModalComponent } from './chat.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'
import { HTMLPipe } from '@strive/utils/pipes/string-to-html.pipe'
import { ThinkingPipe } from '@strive/chat/pipes/thinking.pipe'
import { JoinButtonModule } from '@strive/goal/components/join-button/join-button.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { AddSupportModalComponent } from '@strive/support/modals/add/add.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageModule,
    TimeAgoPipe,
    HTMLPipe,

    JoinButtonModule,
    AuthModalModule,
    AddSupportModalComponent,
    HeaderModalComponent,
    ThinkingPipe,
    PageLoadingComponent,
    IonButton,
    IonIcon,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonFooter,
    IonItem,
    IonTextarea,
    IonPopover,
    IonList
  ],
  declarations: [
    ChatModalComponent
  ],
  exports: [
    ChatModalComponent
  ]
})
export class ChatModalModule { }
