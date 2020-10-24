import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CollectiveGoalOptionsPage } from './options.component';

@NgModule({
  declarations: [CollectiveGoalOptionsPage],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [CollectiveGoalOptionsPage]
})
export class CollectiveGoalOptionsPopoverModule {}
