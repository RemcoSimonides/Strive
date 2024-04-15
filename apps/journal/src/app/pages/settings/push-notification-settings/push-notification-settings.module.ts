import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { PushNotificationsSettingsComponent } from './push-notification-settings.component'

import { HeaderModule } from '@strive/ui/header/header.module'
import { IonButtons, IonButton, IonToggle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonCheckbox } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: PushNotificationsSettingsComponent,
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HeaderModule,
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
  declarations: [PushNotificationsSettingsComponent]
})
export class PushNotificationsSettingsModule { }
