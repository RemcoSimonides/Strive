import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { DearFutureSelfComponent } from './dear-future-self.component'
import { DearFutureSelfExplanationComponent } from '@strive/exercises/dear-future-self/components/explanation/explanation.component'
import { MessagePopoverComponent } from '@strive/exercises/dear-future-self/components/message/message.component'
import { HeaderModule } from '@strive/ui/header/header.module'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module'

import { TimeToGoPipeModule } from '@strive/utils/pipes/time-to-go.pipe'
import { TimeAgoPipeModule } from '@strive/utils/pipes/time-ago.pipe'

const routes: Routes = [
  {
    path: '',
    component: DearFutureSelfComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TimeToGoPipeModule,
    TimeAgoPipeModule,
    PageLoadingModule,
    AuthModalModule,
    HeaderModule
  ],
  declarations: [
    DearFutureSelfComponent,
    DearFutureSelfExplanationComponent,
    MessagePopoverComponent
  ]
})
export class DearFutureSelfModule {}