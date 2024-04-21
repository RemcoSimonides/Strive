import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonContent, IonIcon } from '@ionic/angular/standalone'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { MessagePipeModule } from '@strive/notification/pipes/message.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'

import { NotificationsPageComponent } from './notifications.component'

const routes: Routes = [
  {
    path: '',
    component: NotificationsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderComponent,
    PageLoadingModule,
    MessagePipeModule,
    ImageModule,
    TimeAgoPipeModule,
    IonContent,
    IonIcon
  ],
  exports: [],
  declarations: [NotificationsPageComponent]
})
export class NotificationsPageModule { }
