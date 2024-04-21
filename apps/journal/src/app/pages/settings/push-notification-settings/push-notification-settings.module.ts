import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { PushNotificationsSettingsComponent } from './push-notification-settings.component'

import { HeaderComponent } from '@strive/ui/header/header.component'
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
  declarations: [PushNotificationsSettingsComponent]
})
export class PushNotificationsSettingsModule { }
