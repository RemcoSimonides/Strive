import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { GoalSharePopoverPage } from './share.component';

import { ShareModule } from '@strive/ui/share/share.module';

@NgModule({
  imports: [
    CommonModule,
    ShareModule
  ],
  exports: [],
  declarations: [GoalSharePopoverPage],
})
export class GoalSharePopoverModule { }
