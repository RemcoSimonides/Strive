import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'

import { DailyGratitudePageComponent } from './daily-gratitude.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { AuthModalModule } from '@strive/auth/components/auth-modal/auth-modal.module'
import { ActivatePushNotificationsComponent } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.component'
import { HeaderComponent } from '@strive/ui/header/header.component'

import { CardsComponent } from '@strive/exercises/daily-gratitude/components/cards/cards.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
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
    PageLoadingComponent,
    AuthModalModule,
    ActivatePushNotificationsComponent,
    HeaderComponent,
    CardsComponent,
    DatetimeComponent,
    IonContent,
    IonToggle
  ],
  declarations: [DailyGratitudePageComponent]
})
export class DailyGratitudeModule { }
