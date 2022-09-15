import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'

import { DailyGratefulnessComponent } from './daily-gratefulness.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module'
import { ActivatePushNotificaitonsModule } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.module'
import { HeaderModule } from '@strive/ui/header/header.module'

import { CardsModule } from '@strive/exercises/daily-gratefulness/components/cards/cards.module'
import { CardsModalModule } from '@strive/exercises/daily-gratefulness/modals/cards/cards-modal.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'

const routes: Routes = [
  {
    path: '',
    component: DailyGratefulnessComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    AuthModalModule,
    ActivatePushNotificaitonsModule,
    HeaderModule,
    CardsModule,
    CardsModalModule,
    DatetimeModule
  ],
  declarations: [DailyGratefulnessComponent]
})
export class DailyGratefulnessModule {}