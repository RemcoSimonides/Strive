import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { SelectUserModalComponent } from './select-user.modal'
import { IonHeader, IonToolbar, IonSearchbar, IonContent, IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonSearchbar,
    IonContent,
    IonList,
    IonItem
  ],
  declarations: [
    SelectUserModalComponent
  ]
})
export class SelectUserModule { }
