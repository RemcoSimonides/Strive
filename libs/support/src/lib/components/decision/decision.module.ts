import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { SupportDecisionComponent } from './decision.component'

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [
    SupportDecisionComponent
  ],
  exports: [
    SupportDecisionComponent
  ]
})
export class SupportDecisionModule {}