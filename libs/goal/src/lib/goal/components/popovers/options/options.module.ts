import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { OptionsPopoverComponent } from './options.component'


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  declarations: [OptionsPopoverComponent],
  exports: [OptionsPopoverComponent]
})
export class OptionsPopoverModule {}