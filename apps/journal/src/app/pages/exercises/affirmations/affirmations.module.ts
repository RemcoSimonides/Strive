import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { AffirmationsPageComponent } from './affirmations.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ActivatePushNotificationsModule } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.module'
import { HeaderModule } from '@strive/ui/header/header.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'

const routes: Routes = [
  {
    path: '',
    component: AffirmationsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageLoadingModule,
    ActivatePushNotificationsModule,
    HeaderModule,
    DatetimeModule
  ],
  declarations: [AffirmationsPageComponent]
})
export class AffirmationsModule {}