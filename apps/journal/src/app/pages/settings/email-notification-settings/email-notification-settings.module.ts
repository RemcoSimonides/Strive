import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { EmailNotificationSettingsComponent } from './email-notification-settings.component'

import { HeaderComponent } from '@strive/ui/header/header.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { IonButtons, IonButton, IonToggle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: EmailNotificationSettingsComponent,
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    IonButtons,
    IonButton,
    IonToggle,
    IonContent,
    IonList,
    IonListHeader,
    IonItem,
    IonLabel,
    IonCheckbox
  ],
  declarations: [EmailNotificationSettingsComponent]
})
export class EmailNotificationSettingsModule { }
