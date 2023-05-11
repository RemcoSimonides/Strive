import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { PushNotificationsSettingsComponent } from './push-notification-settings.component'

import { HeaderModule } from '@strive/ui/header/header.module'

const routes: Routes = [
  {
    path: '',
    component: PushNotificationsSettingsComponent,
  }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    HeaderModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [PushNotificationsSettingsComponent]
})
export class PushNotificationsSettingsModule {}