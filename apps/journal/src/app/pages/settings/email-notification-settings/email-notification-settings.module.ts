import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { EmailNotificationSettingsComponent } from './email-notification-settings.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

const routes: Routes = [
  {
    path: '',
    component: EmailNotificationSettingsComponent,
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
  declarations: [EmailNotificationSettingsComponent]
})
export class EmailNotificationSettingsModule {}