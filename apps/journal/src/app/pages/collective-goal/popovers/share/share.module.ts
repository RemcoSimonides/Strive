import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollectiveGoalSharePopoverComponent } from './share.component';

import { ShareModule } from '@strive/ui/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    ShareModule
  ],
  exports: [CollectiveGoalSharePopoverComponent],
  declarations: [CollectiveGoalSharePopoverComponent],
})
export class CollectiveGoalSharePopoverModule {}
