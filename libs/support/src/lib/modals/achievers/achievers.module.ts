import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AchieversModalComponent } from './achievers.component'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { IonSearchbar, IonContent, IonList, IonItem, IonButton, IonAvatar, IonLabel, IonText, IonCheckbox } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ImageModule,
    HeaderModalComponent,
    IonSearchbar,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonAvatar,
    IonLabel,
    IonText,
    IonCheckbox,
    IonSearchbar,
    IonContent,
    IonList,
    IonItem,
    IonButton,
    IonAvatar,
    IonLabel,
    IonText,
    IonCheckbox
  ],
  declarations: [AchieversModalComponent]
})
export class AchieversModalModule { }
