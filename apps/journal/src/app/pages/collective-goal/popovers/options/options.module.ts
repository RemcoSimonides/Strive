import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CollectiveGoalOptionsComponent } from './options.component';

@NgModule({
  declarations: [CollectiveGoalOptionsComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CollectiveGoalOptionsComponent]
})
export class CollectiveGoalOptionsPopoverModule {}
