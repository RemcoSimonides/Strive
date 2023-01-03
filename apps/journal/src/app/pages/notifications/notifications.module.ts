import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { HeaderModule } from '@strive/ui/header/header.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { MessagePipeModule } from '@strive/notification/pipes/message.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'

import { NotificationsComponent } from './notifications.component'

const routes: Routes = [
  {
    path: '',
    component: NotificationsComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    PageLoadingModule,
    MessagePipeModule,
    ImageModule,
    TimeAgoPipeModule
  ],
  exports: [],
  declarations: [NotificationsComponent]
})
export class NotificationsModule { }
