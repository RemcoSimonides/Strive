import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalOptionsComponent } from "./goal-options.component"

import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    UpsertPostModalComponent,
    IonList,
    IonItem
  ],
  declarations: [GoalOptionsComponent]
})
export class GoalOptionsModule { }
