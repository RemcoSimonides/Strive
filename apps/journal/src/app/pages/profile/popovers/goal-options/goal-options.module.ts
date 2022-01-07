import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { GoalOptionsComponent } from "./goal-options.component";

import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UpsertPostModalModule
  ],
  declarations: [GoalOptionsComponent]
})
export class GoalOptionsModule { }