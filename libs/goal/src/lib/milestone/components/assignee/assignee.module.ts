import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AssigneeComponent } from './assignee.component';

import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule
  ],
  declarations: [AssigneeComponent],
  exports: [AssigneeComponent]
})
export class AssigneeModule {}