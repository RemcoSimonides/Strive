import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonContent, IonIcon } from '@ionic/angular/standalone'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { MessagePipe } from '@strive/notification/pipes/message.pipe'
import { ImageModule } from '@strive/media/directives/image.module'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'

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
    PageLoadingComponent,
    MessagePipe,
    ImageModule,
    TimeAgoPipe,
    IonContent,
    IonIcon
  ],
  exports: [],
  declarations: [NotificationsPageComponent]
})
export class NotificationsPageModule { }
