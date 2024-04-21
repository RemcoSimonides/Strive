import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { DearFutureSelfPageComponent } from './dear-future-self.component'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { MessageModalComponent } from '@strive/exercises/dear-future-self/modals/message/message.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { AuthModalComponent } from '@strive/auth/components/auth-modal/auth-modal.page'

import { TimeToGoPipe } from '@strive/utils/pipes/time-to-go.pipe'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'
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
    TimeToGoPipe,
    TimeAgoPipe,
    PageLoadingComponent,
    AuthModalComponent,
    HeaderComponent,
    MessageModalComponent,
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
