import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { UpsertPostModalComponent } from './post-upsert.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { DatetimeModule } from '@strive/ui/datetime/datetime.module'
import { SafePipe } from '@strive/utils/pipes/safe-url.pipe'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageSelectorModule,
    DatetimeModule,
    SafePipe
  ],
  declarations: [UpsertPostModalComponent]
})
export class UpsertPostModalModule {}
