import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { HeaderComponent } from './header.component'
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle
  ],
  exports: [HeaderComponent],
  declarations: [HeaderComponent],
})
export class HeaderModule { }
