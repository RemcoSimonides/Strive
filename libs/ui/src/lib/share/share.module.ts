import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ShareComponent } from './share.component'
import { IonButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonButton,
    IonIcon
  ],
  exports: [ShareComponent],
  declarations: [ShareComponent],
})
export class ShareModule { }
