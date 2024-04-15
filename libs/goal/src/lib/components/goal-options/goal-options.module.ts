import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalOptionsComponent } from "./goal-options.component"

import { UpsertPostModalModule } from '@strive/post/modals/upsert/post-upsert.module'
import { IonList, IonItem } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    UpsertPostModalModule,
    IonList,
    IonItem
  ],
  declarations: [GoalOptionsComponent]
})
export class GoalOptionsModule { }
