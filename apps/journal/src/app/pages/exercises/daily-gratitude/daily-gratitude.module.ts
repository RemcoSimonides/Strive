import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'

import { DailyGratitudePageComponent } from './daily-gratitude.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { ActivatePushNotificationsModule } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.module'
import { HeaderModule } from '@strive/ui/header/header.module'

import { CardsModule } from '@strive/exercises/daily-gratitude/components/cards/cards.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { IonContent, IonToggle } from "@ionic/angular/standalone"

const routes: Routes = [
  {
    path: '',
    component: DailyGratitudePageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    AuthModalModule,
    ActivatePushNotificationsModule,
    HeaderModule,
    CardsModule,
    DatetimeModule,
    IonContent,
    IonToggle
  ],
  declarations: [DailyGratitudePageComponent]
})
export class DailyGratitudeModule { }
