import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { DearFutureSelfPageComponent } from './dear-future-self.component'
import { HeaderModule } from '@strive/ui/header/header.module'
import { MessageModalModule } from '@strive/exercises/dear-future-self/modals/message/message.module'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'

import { TimeToGoPipeModule } from '@strive/utils/pipes/time-to-go.pipe'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'
import { IonContent, IonCard, IonItem, IonTextarea, IonButton, IonDatetime, IonIcon, IonList } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: DearFutureSelfPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TimeToGoPipeModule,
    TimeAgoPipeModule,
    PageLoadingModule,
    AuthModalModule,
    HeaderModule,
    MessageModalModule,
    IonContent,
    IonCard,
    IonItem,
    IonTextarea,
    IonButton,
    IonDatetime,
    IonIcon,
    IonList
  ],
  declarations: [DearFutureSelfPageComponent]
})
export class DearFutureSelfModule { }
