import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { AffirmationsPageComponent } from './affirmations.component'

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { ActivatePushNotificationsComponent } from '@strive/exercises/components/activate-push-notifications/activate-push-notifications.component'
import { HeaderComponent } from '@strive/ui/header/header.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { IonContent, IonList, IonItem, IonLabel, IonText, IonIcon, IonButton, IonInput, IonSelect, IonSelectOption } from '@ionic/angular/standalone'

const routes: Routes = [
  {
    path: '',
    component: AffirmationsPageComponent
  }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    PageLoadingModule,
    ActivatePushNotificationsComponent,
    HeaderComponent,
    DatetimeComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonIcon,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption
  ],
  declarations: [AffirmationsPageComponent]
})
export class AffirmationsModule { }
