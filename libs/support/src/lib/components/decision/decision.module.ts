import { NgModule } from '@angular/core'
import { SupportDecisionComponent } from './decision.component'
import { IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    IonButton
  ],
  declarations: [
    SupportDecisionComponent
  ],
  exports: [
    SupportDecisionComponent
  ]
})
export class SupportDecisionModule { }
