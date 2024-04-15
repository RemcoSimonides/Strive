import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { GoalOptionsPopoverComponent } from './options.component'
import { IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    IonList,
    IonItem
  ],
  exports: [],
  declarations: [GoalOptionsPopoverComponent],
})
export class GoalOptionsModule { }
