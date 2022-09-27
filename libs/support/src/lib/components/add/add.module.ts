import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { AddSupportModalComponent } from './add.component'

import { SupportOptionsModule } from '../options/options.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { SupportStatusPipeModule } from '@strive/support/pipes/status.pipe'
import { AchieversModalModule } from '../../modals/achievers/achievers.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageModule,
    SupportOptionsModule,
    SupportStatusPipeModule,
    AchieversModalModule
  ],
  declarations: [
    AddSupportModalComponent
  ]
})
export class AddSupportModalModule {}
