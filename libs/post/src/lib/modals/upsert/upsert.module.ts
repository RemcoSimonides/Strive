import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { UpsertPostModalComponent } from './upsert.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageSelectorModule,
    DatetimeModule
  ],
  declarations: [UpsertPostModalComponent]
})
export class UpsertPostModalModule {}
