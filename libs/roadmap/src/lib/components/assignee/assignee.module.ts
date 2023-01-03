import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AssigneeComponent } from './assignee.component'

import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    ImageModule
  ],
  declarations: [AssigneeComponent],
  exports: [AssigneeComponent]
})
export class AssigneeModule {}