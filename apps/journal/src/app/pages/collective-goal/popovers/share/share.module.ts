import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CollectiveGoalSharePopoverPage } from './share.component';

import { ShareModule } from '@strive/ui/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    ShareModule
  ],
  exports: [CollectiveGoalSharePopoverPage],
  declarations: [CollectiveGoalSharePopoverPage],
})
export class CollectiveGoalSharePopoverModule {}
