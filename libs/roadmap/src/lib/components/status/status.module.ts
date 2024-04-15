import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { MilestoneStatusComponent } from './status.component'
import { IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonIcon
  ],
  declarations: [
    MilestoneStatusComponent
  ],
  exports: [
    MilestoneStatusComponent
  ]
})
export class MilestoneStatusModule { }
