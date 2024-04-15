import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { AddSupportComponent } from './add.component'

import { AchieversModalModule } from '../../modals/achievers/achievers.module'
import { IonList, IonItem, IonInput, IonButton, IonIcon, IonTitle, IonContent } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AchieversModalModule,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent
  ],
  declarations: [AddSupportComponent],
  exports: [AddSupportComponent]
})
export class AddSupportModule { }
