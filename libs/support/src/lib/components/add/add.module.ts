import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { AddSupportComponent } from './add.component'

import { AchieversModalModule } from '../../modals/achievers/achievers.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    AchieversModalModule
  ],
  declarations: [AddSupportComponent],
  exports: [AddSupportComponent]
})
export class AddSupportModule {}